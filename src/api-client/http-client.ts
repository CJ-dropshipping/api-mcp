/**
 * @fileoverview HTTP 客户端封装
 * - 自动注入 CJ-Access-Token header
 * - 请求前进行 QPS 限速
 * - 401 时返回提示重新登录的错误
 * - 请求日志 (脱敏) + 延迟重试 (指数退避)
 */
import { getEnvConfig } from '../config/env.js';
import { rateLimiter, type RateTier } from './rate-limiter.js';
import { API_VERSION_PREFIX } from './endpoints.js';
import { logger, isDebugMode } from '../utils/logger.js';

export interface ApiResponse<T = unknown> {
  code: number;
  /** OpenAPI 标准接口返回 result */
  result?: boolean;
  message: string;
  data: T;
  requestId?: string;
  /** 部分接口 (shop/getShops, product/globalWarehouseList) 用 success 代替 result */
  success?: boolean;
}

/**
 * @description 统一判断 API 响应是否成功
 * @note 纠正: 部分 OpenAPI 端点返回 {success:true, code:0} 而非 {result:true, code:200}
 * 如 shop/getShops, product/globalWarehouseList
 */
export function isApiSuccess(response: ApiResponse): boolean {
  return response.result === true || response.success === true || response.code === 200 || response.code === 0;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  params?: Record<string, string>;
  tier?: RateTier;
  /** 是否跳过 token 注入 (用于 auth 接口) */
  skipAuth?: boolean;
}

/** Token 获取函数类型，由外部注入避免循环依赖 */
let tokenGetter: (() => string | null) | null = null;

export function setTokenGetter(fn: () => string | null): void {
  tokenGetter = fn;
}

export class HttpClient {
  private baseUrl: string;

  constructor() {
    const config = getEnvConfig();
    this.baseUrl = config.openApiBase;
  }

  /**
   * 发送 OpenAPI 请求 (含重试逻辑)
   * @param endpoint - API 路径 (不含版本前缀)
   * @param options - 请求选项
   */
  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'POST', body, params, tier = 'read', skipAuth = false } = options;
    const maxRetries = rateLimiter.getMaxRetries();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // QPS 限速
        await rateLimiter.acquire(tier);

        // 构建 URL
        const url = new URL(`${API_VERSION_PREFIX}${endpoint}`, this.baseUrl);
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
          });
        }

        // 构建 Headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (!skipAuth && tokenGetter) {
          const token = tokenGetter();
          if (token) {
            headers['CJ-Access-Token'] = token;
          }
        }

        // 发送请求
        const fetchOptions: RequestInit = {
          method,
          headers,
        };

        if (body && method !== 'GET') {
          fetchOptions.body = JSON.stringify(body);
        }

        // @note 新增(63次): debug 模式下记录请求参数体，方便排查接口调用问题
        if (isDebugMode() && body) {
          logger.debug('HTTP', `请求参数 / Request body: ${method} ${endpoint}`, body);
        }

        const startTime = Date.now();
        const response = await fetch(url.toString(), fetchOptions);
        const data: ApiResponse<T> = await response.json();
        const duration = Date.now() - startTime;

        // 请求日志
        logger.request(method, url.toString(), data.code, duration);
        // @note 新增(63次): debug 模式下记录原始响应数据（含 code/message/data 字段）
        if (isDebugMode()) {
          logger.debug('HTTP', `原始响应 / Response data: ${endpoint}`, data);
        }

        // 401 / token 过期处理
        if (data.code === 1600100 || data.code === 401) {
          throw new AuthExpiredError('Token expired. Please re-login via the login tool. / Token已过期，请重新调用登录工具。');
        }

        return data;
      } catch (error: unknown) {
        // AuthExpiredError 不重试
        if (error instanceof AuthExpiredError) throw error;

        // 最后一次重试仍失败则抛出
        if (attempt >= maxRetries) {
          logger.error('HTTP', `请求失败(已重试${maxRetries}次) / Request failed after ${maxRetries} retries: ${endpoint}`, {
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }

        // 指数退避延迟重试
        const delay = rateLimiter.getRetryDelay(attempt);
        logger.rateLimit(tier, 'retrying', `attempt=${attempt + 1} delay=${delay}ms endpoint=${endpoint}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // 不应到达这里
    throw new Error(`Request failed: ${endpoint}`);
  }
}

export class AuthExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthExpiredError';
  }
}

export const httpClient = new HttpClient();
