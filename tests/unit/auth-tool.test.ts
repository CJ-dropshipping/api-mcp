/**
 * @fileoverview Auth Tool 单元测试 (Mock 外部调用)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAuthTool, getAuthTools } from '../../src/mcp-server/tools/auth.tool';

// Mock session module
vi.mock('../../src/auth/session', () => ({
  getSession: vi.fn().mockReturnValue(null),
  isSessionValid: vi.fn().mockReturnValue(false),
  createSession: vi.fn(),
  clearSession: vi.fn(),
  ensureAccessToken: vi.fn().mockResolvedValue(null),
}));

// Mock env config
vi.mock('../../src/config/env', () => ({
  getEnvConfig: () => ({
    env: 'test',
    openApiBase: 'http://test002.cjdropshipping.offline.pre.com',
    webBase: 'http://www.cjdropshipping.offline.pre.com',
    loginApiBase: 'http://www.cjdropshipping.offline.pre.com',
    platform: 1,
    language: 'en',
    currency: 'USD',
    tokenEncryptKey: '',
  }),
}));

// Mock rate limiter
vi.mock('../../src/api-client/rate-limiter', () => ({
  rateLimiter: {
    getStatus: () => ({
      tiers: {
        read: { available: 10, max: 10, refillRate: 10 },
        write: { available: 2, max: 2, refillRate: 2 },
        auth: { available: 1, max: 1, refillRate: 1 },
      },
      global: { available: 20, max: 20, refillRate: 20 },
      dailyQuota: { used: 5, max: 10000, remaining: 9995 },
      concurrency: { active: 1, max: 5, queued: 0 },
      cache: { size: 3, ttlMs: 300000 },
    }),
  },
}));

describe('auth.tool', () => {
  it('show_login_form 返回成功提示', async () => {
    const result = await handleAuthTool('show_login_form', {});
    expect(result.content[0].text).toContain('Login form displayed');
  });

  it('check_login_status 未登录时提示登录', async () => {
    const result = await handleAuthTool('check_login_status', {});
    expect(result.content[0].text).toContain('未登录');
    expect(result.content[0].text).toContain('Not logged in');
  });

  it('get_rate_limit_status 返回限速状态', async () => {
    const result = await handleAuthTool('get_rate_limit_status', {});
    expect(result.content[0].text).toContain('10/10');
    expect(result.content[0].text).toContain('2/2');
    expect(result.content[0].text).toContain('1/1');
    expect(result.content[0].text).toContain('20/20');
  });

  it('verify_credentials 缺少参数返回错误', async () => {
    const result = await handleAuthTool('verify_credentials', {});
    expect(result.isError).toBe(true);
    // @note 纠正: 支持 loginName 后错误提示改为 email/loginName+password
    expect(result.content[0].text).toContain('email/loginName+password');
  });

  it('logout 清除会话并返回成功', async () => {
    const result = await handleAuthTool('logout', {});
    expect(result.content[0].text).toContain('已登出');
    expect(result.content[0].text).toContain('Logged out');
  });

  it('wait_for_login 未登录时超时返回引导消息（非错误）', async () => {
    // 未登录状态（isSessionValid mock 返回 false），设 1 秒超时
    // @note 纠正(41次): 超时不再标记 isError=true，而是返回引导消息，让 AI 询问用户是否已登录
    const result = await handleAuthTool('wait_for_login', { timeout: 1 });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('超时');
    expect(result.content[0].text).toContain('check_login_status');
  });

  it('wait_for_login 已登录时立即返回成功', async () => {
    // Mock isSessionValid 返回 true，getSession 返回用户信息
    const sessionModule = await import('../../src/auth/session');
    vi.mocked(sessionModule.isSessionValid).mockReturnValueOnce(true);
    vi.mocked(sessionModule.getSession).mockReturnValueOnce({ loginName: 'test@test.com' } as ReturnType<typeof sessionModule.getSession>);

    const result = await handleAuthTool('wait_for_login', { timeout: 10 });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('登录成功');
  });

  /**
   * @note 纠正(72次): 验证 getAuthTools() 每次调用都生成唯一的 resourceUri（含时间戳），
   * 确保 VS Code Copilot 在同一对话中多次登录时，每次都在当前位置创建新的登录 UI，
   * 而非复用/滚动到之前位置的旧 UI 元素。
   * 业务影响：修复「多次登录-退出-再登录，新登录 UI 无法出现在当前对话位置」的 UX 缺陷。
   */
  it('getAuthTools 每次调用 wait_for_login 的 resourceUri 均唯一（含时间戳）', () => {
    const tools1 = getAuthTools();
    const tools2 = getAuthTools();

    const waitLogin1 = tools1.find(t => t.name === 'wait_for_login');
    const waitLogin2 = tools2.find(t => t.name === 'wait_for_login');

    expect(waitLogin1).toBeDefined();
    expect(waitLogin2).toBeDefined();

    const meta1 = (waitLogin1 as { _meta?: { ui?: { resourceUri?: string } } })._meta;
    const meta2 = (waitLogin2 as { _meta?: { ui?: { resourceUri?: string } } })._meta;

    expect(meta1?.ui?.resourceUri).toMatch(/^ui:\/\/cj-mcp\/login\?t=\d+_\d+$/);
    expect(meta2?.ui?.resourceUri).toMatch(/^ui:\/\/cj-mcp\/login\?t=\d+_\d+$/);
    // 两次调用的时间戳不同（唯一性），断言失败说明用户在同一对话中无法获得新的登录 UI
    expect(meta1?.ui?.resourceUri).not.toBe(meta2?.ui?.resourceUri);
  });
});
