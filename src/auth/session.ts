/**
 * @fileoverview 认证会话管理
 * - 前端登录获取 userInfo → 提取 apiKey
 * - 用 apiKey 换取 OpenAPI accessToken
 * - Token 过期自动 refresh，refresh 失败提示重新登录
 */
import { TokenStore } from './token-store.js';
import { httpClient } from '../api-client/http-client.js';
import { ENDPOINTS } from '../api-client/endpoints.js';
import { getEnvConfig } from '../config/env.js';

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
  const session = getSession();
  if (!session) return false;
  // refreshToken 还没过期就算有效（accessToken 可以续期）
  return new Date(session.refreshTokenExpiry) > new Date();
}

export function isAccessTokenExpired(): boolean {
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
  currentSession = session;
  tokenStore.setToken(JSON.stringify(session));
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

  currentSession = session;
  tokenStore.setToken(JSON.stringify(session));
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

    currentSession = session;
    tokenStore.setToken(JSON.stringify(session));
    return true;
  } catch {
    clearSession();
    return false;
  }
}

export function clearSession(): void {
  currentSession = null;
  tokenStore.clearToken();
}

/**
 * 确保有有效的 accessToken，自动续期
 * @returns accessToken 或 null (需要重新登录)
 */
export async function ensureAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  if (token) return token;

  // 尝试 refresh
  const refreshed = await refreshSession();
  if (refreshed) {
    return getAccessToken();
  }

  return null;
}
