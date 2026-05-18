/**
 * @fileoverview Token 加密存储单元测试
 * 覆盖：加密存储、读取解密、清除、无token状态、测试环境明文备份文件
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TokenStore } from '../../src/auth/token-store';
import * as fs from 'fs';
import * as path from 'path';

const TOKEN_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE || '.',
  '.cj-mcp-token',
);

const TOKEN_FILE2 = path.join(
  process.env.HOME || process.env.USERPROFILE || '.',
  '.cj-mcp-token2',
);

describe('TokenStore', () => {
  let store: TokenStore;

  beforeEach(() => {
    // 清理之前的测试残留
    try {
      if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
    } catch { /* ignore */ }
    try {
      if (fs.existsSync(TOKEN_FILE2)) fs.unlinkSync(TOKEN_FILE2);
    } catch { /* ignore */ }
    store = new TokenStore();
  });

  afterEach(() => {
    store.clearToken();
  });

  it('无token时返回空字符串', () => {
    expect(store.getToken()).toBe('');
  });

  it('hasToken 无token时返回false', () => {
    expect(store.hasToken()).toBe(false);
  });

  it('存储后能正确读取token', () => {
    const testToken = 'test-cj-login-token-12345';
    store.setToken(testToken);
    expect(store.getToken()).toBe(testToken);
  });

  it('hasToken 有token时返回true', () => {
    store.setToken('some-token');
    expect(store.hasToken()).toBe(true);
  });

  it('token加密存储，文件内容不是明文', () => {
    const testToken = 'my-secret-token';
    store.setToken(testToken);
    const fileContent = fs.readFileSync(TOKEN_FILE, 'utf8');
    expect(fileContent).not.toBe(testToken);
    expect(fileContent).toContain(':');
  });

  it('清除token后无法读取', () => {
    store.setToken('token-to-clear');
    store.clearToken();
    expect(store.getToken()).toBe('');
    expect(store.hasToken()).toBe(false);
  });

  it('多次设置token以最后一次为准', () => {
    store.setToken('token-1');
    store.setToken('token-2');
    store.setToken('token-3');
    expect(store.getToken()).toBe('token-3');
  });

  describe('测试环境明文备份（.cj-mcp-token2）', () => {
    /**
     * @note 纠正(78次): 测试环境下需要额外写入明文 token 到 .cj-mcp-token2，
     * 方便调试时直接查看 token 值。生产环境不写入，避免安全风险。
     * 断言失败说明明文备份功能未生效，调试时无法直接读取 token。
     */
    it('测试环境 setToken 后 .cj-mcp-token2 包含明文 token', () => {
      // 默认 CJ_ENV 未设置时为 test 环境
      const originalEnv = process.env.CJ_ENV;
      process.env.CJ_ENV = 'test';
      const testStore = new TokenStore();
      const testToken = 'plain-text-debug-token-999';

      testStore.setToken(testToken);

      expect(fs.existsSync(TOKEN_FILE2)).toBe(true);
      const plain = fs.readFileSync(TOKEN_FILE2, 'utf8').trim();
      expect(plain).toBe(testToken);

      testStore.clearToken();
      process.env.CJ_ENV = originalEnv;
    });

    it('测试环境 clearToken 后 .cj-mcp-token2 也被删除', () => {
      const originalEnv = process.env.CJ_ENV;
      process.env.CJ_ENV = 'test';
      const testStore = new TokenStore();
      testStore.setToken('token-to-clear-2');

      testStore.clearToken();

      expect(fs.existsSync(TOKEN_FILE2)).toBe(false);
      process.env.CJ_ENV = originalEnv;
    });

    it('生产环境 setToken 不写入 .cj-mcp-token2', () => {
      const originalEnv = process.env.CJ_ENV;
      process.env.CJ_ENV = 'production';
      const prodStore = new TokenStore();

      prodStore.setToken('prod-token-should-not-have-file2');

      expect(fs.existsSync(TOKEN_FILE2)).toBe(
        false,
        '.cj-mcp-token2 不应在生产环境存在，存在会导致 token 明文泄露'
      );

      prodStore.clearToken();
      process.env.CJ_ENV = originalEnv;
    });
  });
});
