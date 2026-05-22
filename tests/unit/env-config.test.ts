/**
 * @fileoverview 环境配置测试
 */
import { describe, it, expect } from 'vitest';
import { getEnvConfig } from '../../src/config/env';

describe('EnvConfig', () => {
  it('返回默认配置', () => {
    const config = getEnvConfig();
    // @note 纠正(开源准备): 默认环境已从 test 改为 production，外部开发者无需额外配置
    expect(config.env).toBe('production');
    expect(config.openApiBase).toBe('https://developers.cjdropshipping.com');
    expect(config.webBase).toBeTruthy();
    expect(config.loginApiBase).toBeTruthy();
    expect(config.platform).toBe(1);
    expect(config.language).toBe('en');
    expect(config.currency).toBe('USD');
  });
});
