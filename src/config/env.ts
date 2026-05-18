/**
 * @fileoverview CJ API 环境配置
 * 从环境变量读取配置，提供默认值
 * CJ_ENV=test 走测试环境，CJ_ENV=production 走线上
 */

export interface EnvConfig {
  /** 环境标识 */
  env: 'test' | 'production';
  /** OpenAPI 基础地址 (开发者接口) */
  openApiBase: string;
  /** 前端页面域名 (用于 navigate tool 生成链接) */
  webBase: string;
  /** 前端登录接口基础地址 */
  loginApiBase: string;
  /** 平台标识 (1=MyCJ, 2=OwnCJ, 3=Affiliate) */
  platform: number;
  /** 默认语言 */
  language: string;
  /** 默认货币 */
  currency: string;
  /** Token 加密密钥 (本地持久化加密) */
  tokenEncryptKey: string;
}

export function getEnvConfig(): EnvConfig {
  const env = (process.env.CJ_ENV || 'test') as 'test' | 'production';
  const isProduction = env === 'production';

  return {
    env,
    /**
     * @note 纠正: 测试环境 OpenAPI 域名是 developers.cjdropshipping.offline.pre.com
     * 而非 test002 (test002 是静态文件服务, POST 返回 405)
     */
    openApiBase: isProduction
      ? 'https://developers.cjdropshipping.com'
      : 'http://developers.cjdropshipping.offline.pre.com',
    webBase: isProduction
      ? 'https://www.cjdropshipping.com'
      : 'http://www.cjdropshipping.offline.pre.com',
    loginApiBase: isProduction
      ? 'https://www.cjdropshipping.com'
      : 'http://www.cjdropshipping.offline.pre.com',
    platform: Number(process.env.CJ_PLATFORM) || 1,
    language: process.env.CJ_LANGUAGE || 'en',
    currency: process.env.CJ_CURRENCY || 'USD',
    tokenEncryptKey: process.env.TOKEN_ENCRYPT_KEY || '',
  };
}
