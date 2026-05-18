/**
 * @fileoverview product.tool 单元测试
 * 重点验证 search_products 的 productUrl 注入逻辑（纠正75次）
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../src/auth/session', () => ({
  ensureAccessToken: vi.fn().mockResolvedValue('mock-token'),
  getAccessToken: vi.fn().mockReturnValue('mock-token'),
}));

vi.mock('../../src/config/env', () => ({
  getEnvConfig: () => ({
    env: 'test',
    openApiBase: 'http://test002.cjdropshipping.offline.pre.com',
    webBase: 'http://www.cjdropshipping.offline.pre.com',
    loginApiBase: 'http://www.cjdropshipping.offline.pre.com',
    platform: 1, language: 'en', currency: 'USD', tokenEncryptKey: '',
  }),
}));

vi.mock('../../src/api-client/rate-limiter', () => ({
  rateLimiter: {
    acquire: vi.fn().mockResolvedValue(undefined),
    acquireConcurrency: vi.fn().mockResolvedValue(undefined),
    releaseConcurrency: vi.fn(),
    getRetryDelay: vi.fn((n: number) => 500 * Math.pow(2, n)),
    getMaxRetries: vi.fn().mockReturnValue(3),
    cache: { get: vi.fn(), set: vi.fn(), invalidate: vi.fn(), getStatus: vi.fn().mockReturnValue({ size: 0, ttlMs: 300000 }) },
    getStatus: vi.fn().mockReturnValue({
      tiers: { read: { available: 10, max: 10, refillRate: 10 }, write: { available: 2, max: 2, refillRate: 2 }, auth: { available: 1, max: 1, refillRate: 1 } },
      global: { available: 20, max: 20, refillRate: 20 },
      dailyQuota: { used: 0, max: 10000, remaining: 10000 },
      concurrency: { active: 0, max: 5, queued: 0 },
      cache: { size: 0, ttlMs: 300000 },
    }),
  },
  QuotaExceededError: class extends Error { name = 'QuotaExceededError'; },
}));

const mockRequest = vi.fn();
vi.mock('../../src/api-client/http-client', () => ({
  httpClient: { request: (...args: unknown[]) => mockRequest(...args) },
  AuthExpiredError: class extends Error { name = 'AuthExpiredError'; },
  isApiSuccess: (r: { result?: boolean; code: number }) => r.result === true || r.code === 200,
  setTokenGetter: vi.fn(),
}));

import { handleProductTool, productTools } from '../../src/mcp-server/tools/product.tool';

describe('product.tool', () => {
  beforeEach(() => mockRequest.mockClear());

  it('注册了3个tools（search_products, get_category_tree, get_warehouses）', () => {
    expect(productTools).toHaveLength(3);
    expect(productTools.map(t => t.name)).toContain('search_products');
  });

  it('search_products 为 content[].productList[] 中的每个商品注入 productUrl', async () => {
    /**
     * @note 纠正(75次): API 返回结构是 data.content[].productList[]，字段 id/nameEn
     * 旧代码错误地遍历了 data.list[]（pid/productNameEn），导致 productUrl 未被注入
     */
    mockRequest.mockResolvedValue({
      code: 200,
      result: true,
      message: 'Success',
      data: {
        pageSize: 10,
        pageNumber: 1,
        totalRecords: 1,
        content: [
          {
            productList: [
              {
                id: 'TEST-PRODUCT-ID',
                nameEn: 'Test Bluetooth Headset',
                sku: 'CJTEST001',
                sellPrice: '9.99',
              },
            ],
          },
        ],
      },
    });

    const result = await handleProductTool('search_products', { keyword: 'bluetooth', pageSize: 10 });
    expect(result.isError).toBeFalsy();

    const data = JSON.parse(result.content[0].text);
    const product = data.content[0].productList[0];

    expect(product.productUrl).toBeDefined();
    // 格式: /product/${urlQueryFormat(nameEn)}-p-${id}.html
    expect(product.productUrl).toMatch(/\/product\/.+-p-TEST-PRODUCT-ID\.html$/);
    // 包含环境变量 webBase（测试环境）
    expect(product.productUrl).toContain('http://www.cjdropshipping.offline.pre.com');
    // 不含硬编码线上域名
    expect(product.productUrl).not.toContain('https://www.cjdropshipping.com');
  });

  it('search_products 失败时返回 isError', async () => {
    mockRequest.mockResolvedValue({ code: 400, result: false, message: '参数错误', data: null });

    const result = await handleProductTool('search_products', { keyword: 'test' });
    expect(result.isError).toBe(true);
  });
});
