/**
 * @fileoverview 认证会话管理
 * - 前端登录获取 userInfo → 提取 apiKey
 * - 用 apiKey 换取 OpenAPI accessToken
 * - Token 过期自动 refresh，refresh 失败提示重新登录
 *
 * @note 纠正(apiKey-URL 方案):
 *   新增 apiKeySessions Map 用于 /mcp/{apiKey} URL 路径认证场景。
 *   当 HTTP 入口通过 AsyncLocalStorage 注入了 apiKey 上下文（getContextApiKey() !== undefined），
 *   所有 session 操作均路由到 apiKeySessions Map，不读写 currentSession 及持久化文件，
 *   从而实现多用户请求的完全隔离，不影响原有本地 stdio/单用户模式。
 */
import { TokenStore } from './token-store.js';
import { httpClient } from '../api-client/http-client.js';
import { ENDPOINTS } from '../api-client/endpoints.js';
import { getEnvConfig } from '../config/env.js';
import { getContextApiKey, getDirectTokenContext } from './api-key-context.js';

/**
 * per-apiKey session 缓存（/mcp/{apiKey} URL 模式专用）
 * key: apiKey 字符串, value: 对应用户的 SessionData
 * 进程级生命周期，重启后需重新认证。
 *
 * @note 内存说明: 每条约 1-2 KB，1000 用户约 1-2 MB，可控。
 * cleanupExpiredApiKeySessions() 每30分钟清理 refreshToken 已过期的条目，
 * 防止长期运行时 Map 无限增长。
 */
const apiKeySessions = new Map<string, SessionData>();

/**
 * 清理 apiKeySessions 中 refreshToken 已过期的条目，释放内存。
 * 由 setInterval 每30分钟自动调用，也可手动调用（便于测试）。
 *
 * @note 新增(apiKey-URL 内存优化): 防止长期运行时 Map 无限增长。
 *   只清理 refreshToken 过期的条目（accessToken 过期但 refreshToken 未过期的条目保留，
 *   下次请求时 ensureApiKeySession 会自动 refresh）。
 * @returns 本次清理的条目数
 */
export function cleanupExpiredApiKeySessions(): number {
  const now = new Date();
  let count = 0;
  for (const [key, session] of apiKeySessions) {
    if (new Date(session.refreshTokenExpiry) < now) {
      apiKeySessions.delete(key);
      count++;
    }
  }
  return count;
}

// 每30分钟自动清理一次过期 session，防止内存无限增长
// unref() 确保此定时器不阻止进程正常退出
const _cleanupTimer = setInterval(() => {
  const removed = cleanupExpiredApiKeySessions();
  if (removed > 0) {
    // 仅在实际有清理时输出日志（避免无意义噪音）
    console.info(`[session] 自动清理过期 apiKey session: 移除 ${removed} 条 / Auto-cleanup: removed ${removed} expired apiKey sessions`);
  }
}, 30 * 60 * 1000).unref();

export interface SessionData {
  /** 用户邮箱 */
  email: string;
  /** OpenAPI accessToken */
  accessToken: string;
  /** accessToken 过期时间 (ISO) */
  accessTokenExpiry: string;
  /** refreshToken */
  refreshToken: string;
  /** refreshToken 过期时间 (ISO) */
  refreshTokenExpiry: string;
  /** 用户 openId */
  openId: string;
  /** 前端登录 token (cjLoginToken) */
  loginToken?: string;
  /** API Key */
  apiKey?: string;
}

const tokenStore = TokenStore.getInstance();

let currentSession: SessionData | null = null;

export function getSession(): SessionData | null {
  // 直接 Token 模式（/mcp/API@userId@CJ:token）：无内存存储，返回合成 session
  const directCtx = getDirectTokenContext();
  if (directCtx) {
    return {
      email: directCtx.userId,
      accessToken: directCtx.accessToken,
      accessTokenExpiry: new Date(Date.now() + 86400_000).toISOString(), // 虚拟过期时间，实际由 API 响应决定
      refreshToken: '',
      refreshTokenExpiry: new Date(Date.now() + 86400_000).toISOString(),
      openId: directCtx.userId,
    };
  }

  const ctxApiKey = getContextApiKey();
  if (ctxApiKey !== undefined) {
    return apiKeySessions.get(ctxApiKey) ?? null;
  }
  if (currentSession) return currentSession;
  // 尝试从持久化恢复
  const stored = tokenStore.getToken();
  if (stored) {
    try {
      currentSession = JSON.parse(stored);
      return currentSession;
    } catch {
      return null;
    }
  }
  return null;
}

export function getAccessToken(): string | null {
  const session = getSession();
  if (!session) return null;

  // 检查是否过期
  if (new Date(session.accessTokenExpiry) < new Date()) {
    return null; // 过期了，需要 refresh
  }
  return session.accessToken;
}

export function isSessionValid(): boolean {
  if (getDirectTokenContext()) return true; // 直接 Token 模式：假设有效（失败时 API 返回 401）
  const session = getSession();
  if (!session) return false;
  // refreshToken 还没过期就算有效（accessToken 可以续期）
  return new Date(session.refreshTokenExpiry) > new Date();
}

export function isAccessTokenExpired(): boolean {
  if (getDirectTokenContext()) return false; // 直接 Token 模式：假设未过期
  const session = getSession();
  if (!session) return true;
  return new Date(session.accessTokenExpiry) < new Date();
}

/**
 * 直接设置 session（用于 email+password 登录返回 token 的场景）
 * @note 纠正: email+password 登录返回的 token 可直接用于 OpenAPI 调用，无需 apiKey 流程
 */
export function setSessionDirect(data: Omit<SessionData, 'apiKey'>): SessionData {
  const session: SessionData = { ...data };
  const ctxApiKey = getContextApiKey();
  if (ctxApiKey !== undefined) {
    apiKeySessions.set(ctxApiKey, session);
  } else {
    currentSession = session;
    tokenStore.setToken(JSON.stringify(session));
  }
  return session;
}

/**
 * 用 apiKey 获取 OpenAPI token 并保存会话
 */
export async function createSession(email: string, apiKey: string, loginToken?: string): Promise<SessionData> {
  const response = await httpClient.request<{
    openId: number;
    accessToken: string;
    accessTokenExpiryDate: string;
    refreshToken: string;
    refreshTokenExpiryDate: string;
  }>(ENDPOINTS.auth.getAccessToken, {
    body: { apiKey },
    tier: 'auth',
    skipAuth: true,
  });

  if (!response.result || !response.data) {
    throw new Error(`Failed to get access token: ${response.message}`);
  }

  const session: SessionData = {
    email,
    accessToken: response.data.accessToken,
    accessTokenExpiry: response.data.accessTokenExpiryDate,
    refreshToken: response.data.refreshToken,
    refreshTokenExpiry: response.data.refreshTokenExpiryDate,
    openId: String(response.data.openId),
    loginToken,
    apiKey,
  };

  const ctxApiKey = getContextApiKey();
  if (ctxApiKey !== undefined) {
    apiKeySessions.set(ctxApiKey, session);
  } else {
    currentSession = session;
    tokenStore.setToken(JSON.stringify(session));
  }
  return session;
}

/**
 * 刷新 accessToken
 */
export async function refreshSession(): Promise<boolean> {
  const session = getSession();
  if (!session?.refreshToken) return false;

  // refreshToken 也过期了
  if (new Date(session.refreshTokenExpiry) < new Date()) {
    clearSession();
    return false;
  }

  try {
    const response = await httpClient.request<{
      accessToken: string;
      accessTokenExpiryDate: string;
      refreshToken: string;
      refreshTokenExpiryDate: string;
    }>(ENDPOINTS.auth.refreshAccessToken, {
      body: { refreshToken: session.refreshToken },
      tier: 'auth',
      skipAuth: true,
    });

    if (!response.result || !response.data) {
      clearSession();
      return false;
    }

    session.accessToken = response.data.accessToken;
    session.accessTokenExpiry = response.data.accessTokenExpiryDate;
    session.refreshToken = response.data.refreshToken;
    session.refreshTokenExpiry = response.data.refreshTokenExpiryDate;

    const ctxApiKey = getContextApiKey();
    if (ctxApiKey !== undefined) {
      apiKeySessions.set(ctxApiKey, session);
    } else {
      currentSession = session;
      tokenStore.setToken(JSON.stringify(session));
    }
    return true;
  } catch {
    clearSession();
    return false;
  }
}

export function clearSession(): void {
  const ctxApiKey = getContextApiKey();
  if (ctxApiKey !== undefined) {
    apiKeySessions.delete(ctxApiKey);
  } else {
    currentSession = null;
    tokenStore.clearToken();
  }
}

/**
 * 确保有有效的 accessToken，自动续期
 * @returns accessToken 或 null (需要重新登录)
 */
export async function ensureAccessToken(): Promise<string | null> {
  // 直接 Token 模式：直接返回 URL 中的 accessToken，无需经过 session 管理
  const directCtx = getDirectTokenContext();
  if (directCtx) return directCtx.accessToken;

  const token = getAccessToken();
  if (token) return token;

  // 尝试 refresh
  const refreshed = await refreshSession();
  if (refreshed) {
    return getAccessToken();
  }

  return null;
}
