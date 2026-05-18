/**
 * @fileoverview 环境配置测试
 */
import { describe, it, expect } from 'vitest';
import { getEnvConfig } from '../../src/config/env';

describe('EnvConfig', () => {
  it('返回默认配置', () => {
    const config = getEnvConfig();
    expect(config.env).toBe('test');
    expect(config.openApiBase).toBeTruthy();
    expect(config.webBase).toBeTruthy();
    expect(config.loginApiBase).toBeTruthy();
    expect(config.platform).toBe(1);
    expect(config.language).toBe('en');
    expect(config.currency).toBe('USD');
  });
});
