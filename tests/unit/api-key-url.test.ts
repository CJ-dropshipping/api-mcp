/**
 * @fileoverview URL 认证方案单元测试
 * 覆盖：
 *  1. apiKey 上下文下 setSessionDirect 存入 Map，getSession 可读取
 *  2. 不同 apiKey 的 session 互相隔离
 *  3. 无 apiKey 上下文时，原有 local 模式行为不变（返回 null）
 *  4. clearSession 在 apiKey 上下文下只删除当前 apiKey 的 session
 *  5. cleanupExpiredApiKeySessions 清理 refreshToken 已过期的条目
 *  6. 直接 Token 模式（/mcp/API@userId@CJ:token）：getSession 返回合成 session，ensureAccessToken 直接返回 token
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiKeyStorage } from '../../src/auth/api-key-context';
import type { SessionData } from '../../src/auth/session';

// ---------- mock token-store（避免文件 I/O） ----------
vi.mock('../../src/auth/token-store', () => ({
  TokenStore: class {
    static getInstance() { return new this(); }
    getToken() { return ''; }
    setToken() { /* noop */ }
    clearToken() { /* noop */ }
    hasToken() { return false; }
  },
}));

// ---------- mock http-client（避免真实 API 调用） ----------
vi.mock('../../src/api-client/http-client', () => ({
  httpClient: { request: vi.fn() },
}));

// ---------- mock env ----------
vi.mock('../../src/config/env', () => ({
  getEnvConfig: () => ({
    env: 'test',
    openApiBase: '',
    webBase: '',
    loginApiBase: '',
    platform: 1,
    language: 'en',
    currency: 'USD',
    tokenEncryptKey: '',
  }),
}));

// 动态 import 确保 mock 先行
const { getSession, setSessionDirect, clearSession, cleanupExpiredApiKeySessions, ensureAccessToken, isSessionValid } = await import('../../src/auth/session');

function makeSession(email: string): SessionData {
  return {
    email,
    accessToken: `at-${email}`,
    accessTokenExpiry: new Date(Date.now() + 3600_000).toISOString(),
    refreshToken: `rt-${email}`,
    refreshTokenExpiry: new Date(Date.now() + 86400_000).toISOString(),
    openId: `oid-${email}`,
  };
}

describe('apiKey URL 认证 — 会话隔离', () => {
  beforeEach(() => {
    // 重置：无 apiKey 上下文下清除 currentSession
    clearSession();
  });

  it('apiKey 上下文下 setSessionDirect 后 getSession 可取到 session', async () => {
    const session = makeSession('apikey-user@test.com');
    await apiKeyStorage.run('test-api-key-1', async () => {
      setSessionDirect(session);
      const result = getSession();
      expect(result?.email).toBe('apikey-user@test.com');
    });
  });

  it('不同 apiKey 的 session 互相隔离', async () => {
    const s1 = makeSession('user-a@test.com');
    const s2 = makeSession('user-b@test.com');

    await apiKeyStorage.run('api-key-A', async () => { setSessionDirect(s1); });
    await apiKeyStorage.run('api-key-B', async () => { setSessionDirect(s2); });

    let r1: SessionData | null = null;
    let r2: SessionData | null = null;
    await apiKeyStorage.run('api-key-A', async () => { r1 = getSession(); });
    await apiKeyStorage.run('api-key-B', async () => { r2 = getSession(); });

    expect(r1?.email).toBe('user-a@test.com');
    expect(r2?.email).toBe('user-b@test.com');
  });

  it('无 apiKey 上下文时 getSession 返回 null（本地模式回归）', () => {
    // beforeEach clearSession 已确保 currentSession = null
    const result = getSession();
    expect(result).toBeNull();
  });

  it('apiKey 上下文下 clearSession 删除对应 session，不影响其他 apiKey', async () => {
    const sA = makeSession('clear-a@test.com');
    const sB = makeSession('keep-b@test.com');

    await apiKeyStorage.run('key-clear', async () => { setSessionDirect(sA); });
    await apiKeyStorage.run('key-keep', async () => { setSessionDirect(sB); });

    // 清除 key-clear
    await apiKeyStorage.run('key-clear', async () => {
      clearSession();
      expect(getSession()).toBeNull();
    });

    // key-keep 不受影响
    let keepResult: SessionData | null = null;
    await apiKeyStorage.run('key-keep', async () => { keepResult = getSession(); });
    expect(keepResult?.email).toBe('keep-b@test.com');
  });

  it('cleanupExpiredApiKeySessions 清除 refreshToken 已过期的条目', async () => {
    const expired: SessionData = {
      email: 'expired@test.com',
      accessToken: 'at-expired',
      accessTokenExpiry: new Date(Date.now() - 7200_000).toISOString(), // 2h 前
      refreshToken: 'rt-expired',
      refreshTokenExpiry: new Date(Date.now() - 3600_000).toISOString(), // 1h 前（过期）
      openId: 'oid-expired',
    };
    const valid = makeSession('valid@test.com');

    await apiKeyStorage.run('key-expired', async () => { setSessionDirect(expired); });
    await apiKeyStorage.run('key-valid', async () => { setSessionDirect(valid); });

    const removed = cleanupExpiredApiKeySessions();
    expect(removed).toBeGreaterThanOrEqual(1);

    // 过期条目被清除
    let expiredResult: SessionData | null = null;
    await apiKeyStorage.run('key-expired', async () => { expiredResult = getSession(); });
    expect(expiredResult).toBeNull();

    // 有效条目保留
    let validResult: SessionData | null = null;
    await apiKeyStorage.run('key-valid', async () => { validResult = getSession(); });
    expect(validResult?.email).toBe('valid@test.com');
  });
});

// 需要独立导入 directTokenStorage
const { directTokenStorage } = await import('../../src/auth/api-key-context');

describe('直接 Token 模式（/mcp/API@userId@CJ:token）', () => {
  it('直接 Token 上下文下 getSession 返回合成 session，email=userId', async () => {
    let result: SessionData | null = null;
    await directTokenStorage.run({ userId: 'CJ4623764', accessToken: 'fake-jwt-token' }, async () => {
      result = getSession();
    });
    expect(result).not.toBeNull();
    expect(result?.email).toBe('CJ4623764');
    expect(result?.accessToken).toBe('fake-jwt-token');
  });

  it('直接 Token 上下文下 ensureAccessToken 直接返回 token，不调用 API', async () => {
    let token: string | null = null;
    await directTokenStorage.run({ userId: 'CJ1234567', accessToken: 'direct-access-token-xyz' }, async () => {
      token = await ensureAccessToken();
    });
    expect(token).toBe('direct-access-token-xyz');
  });

  it('直接 Token 上下文下 isSessionValid 返回 true', async () => {
    let valid: boolean | undefined;
    await directTokenStorage.run({ userId: 'CJ9999', accessToken: 'some-token' }, async () => {
      valid = isSessionValid();
    });
    expect(valid).toBe(true);
  });

  it('直接 Token 模式不影响 apiKey Map 也不影响本地模式', async () => {
    // 在 apiKey 上下文中设置 session
    const session = makeSession('map-user@test.com');
    await apiKeyStorage.run('my-api-key', async () => { setSessionDirect(session); });

    // 在直接 Token 上下文中，getSession 返回合成 session（不是 apiKeySessions 中的）
    let dtResult: SessionData | null = null;
    await directTokenStorage.run({ userId: 'DT-USER', accessToken: 'dt-token' }, async () => {
      dtResult = getSession();
    });
    expect(dtResult?.email).toBe('DT-USER');
    expect(dtResult?.accessToken).toBe('dt-token');

    // apiKey 上下文中的 session 不受影响
    let apiResult: SessionData | null = null;
    await apiKeyStorage.run('my-api-key', async () => { apiResult = getSession(); });
    expect(apiResult?.email).toBe('map-user@test.com');
  });
});
