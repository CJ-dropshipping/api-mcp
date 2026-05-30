/**
 * @fileoverview product.tool 单元测试
 * 重点验证 search_products 的 productUrl 注入逻辑（纠正75次）
 * 以及 show_product_list 的 structuredContent 推送逻辑（第4次提交）
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

// Mock resources/index 以便控制 getProductListCache / getProductDetailCache 返回值
const mockGetProductListCache = vi.fn();
const mockGetProductDetailCache = vi.fn();
vi.mock('../../src/mcp-server/resources/index', () => ({
  setProductListCache: vi.fn(),
  getProductListCache: () => mockGetProductListCache(),
  setProductDetailCache: vi.fn(),
  getProductDetailCache: () => mockGetProductDetailCache(),
  hasProductDetailCache: vi.fn().mockReturnValue(false),
  setOrderListCache: vi.fn(),
  setOrderDetailCache: vi.fn(),
}));

import { handleProductTool, productTools } from '../../src/mcp-server/tools/product.tool';

describe('product.tool', () => {
  beforeEach(() => mockRequest.mockClear());

  it('注册了16个tools（search_products, get_category_tree, get_warehouses, get_product_detail, query_cj_inventory, get_my_products, get_product_variants, create_sourcing, query_sourcing, list_product_connections, get_product_reviews, create_product_connection, disconnect_product, search_products_by_image, show_product_list, show_product_detail）', () => {
    expect(productTools).toHaveLength(16);
    expect(productTools.map(t => t.name)).toContain('search_products');
    expect(productTools.map(t => t.name)).toContain('get_product_detail');
    expect(productTools.map(t => t.name)).toContain('query_cj_inventory');
    expect(productTools.map(t => t.name)).toContain('get_my_products');
    expect(productTools.map(t => t.name)).toContain('get_product_variants');
    expect(productTools.map(t => t.name)).toContain('create_sourcing');
    expect(productTools.map(t => t.name)).toContain('query_sourcing');
    expect(productTools.map(t => t.name)).toContain('list_product_connections');
    expect(productTools.map(t => t.name)).toContain('get_product_reviews');
    expect(productTools.map(t => t.name)).toContain('create_product_connection');
    expect(productTools.map(t => t.name)).toContain('disconnect_product');
    expect(productTools.map(t => t.name)).toContain('search_products_by_image');
    expect(productTools.map(t => t.name)).toContain('show_product_list');
    expect(productTools.map(t => t.name)).toContain('show_product_detail');
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

    // 返回文本包含 UI 引导前缀 + JSON 数据，提取 JSON 部分
    const rawText = result.content[0].text;
    const jsonStart = rawText.indexOf('{');
    const data = JSON.parse(rawText.slice(jsonStart));
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

  it('show_product_list 有缓存时 structuredContent 包含商品数据，且 _meta.ui.resourceUri 为固定 URI', async () => {
    /**
     * @note 新增(第4次提交): show_product_list 通过 structuredContent 把最新商品数据
     * 推送到 iframe（MCP Apps ui/notifications/tool-result 协议），
     * 解决 ChatGPT 缓存 HTML 后 __INITIAL_DATA__ 不更新的问题。
     */
    const mockListData = {
      totalRecords: 2,
      pageNumber: 1,
      totalPages: 1,
      content: [{ productList: [{ id: 'P001', nameEn: 'Mouse', sellPrice: '9.99' }] }],
    };
    mockGetProductListCache.mockReturnValue(mockListData);

    const result = await handleProductTool('show_product_list', {});

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual(mockListData);
    expect((result._meta as Record<string, unknown>)?.ui).toMatchObject({
      resourceUri: 'ui://cj-mcp/product-list',  // 固定 URI，不含时间戳
    });
  });

  it('show_product_list 无缓存时 structuredContent 为空对象，不报错', async () => {
    mockGetProductListCache.mockReturnValue(null);

    const result = await handleProductTool('show_product_list', {});

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual({});
    expect((result._meta as Record<string, unknown>)?.ui).toMatchObject({
      resourceUri: 'ui://cj-mcp/product-list',
    });
  });

  /**
   * @note 新增(第5次提交): show_product_detail 通过 structuredContent 把最新商品详情数据
   * 推送到 iframe（MCP Apps ui/notifications/tool-result 协议），
   * 解决 ChatGPT 缓存 HTML 后 __INITIAL_DATA__ 不更新的问题。
   */
  it('show_product_detail 有缓存时 structuredContent 包含商品详情数据，resourceUri 为固定 URI', async () => {
    const mockDetailData = { pid: 'P001', nameEn: 'Wireless Mouse', sellPrice: '12.99', variants: [] };
    mockGetProductDetailCache.mockReturnValue(mockDetailData);
    mockRequest.mockResolvedValue({ result: true, code: 200, data: mockDetailData });

    const result = await handleProductTool('show_product_detail', { pid: 'P001' });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual(mockDetailData);
    expect((result._meta as Record<string, unknown>)?.ui).toMatchObject({
      resourceUri: 'ui://cj-mcp/product-detail',  // 固定 URI，不含时间戳
    });
  });

  it('show_product_detail 无缓存时 structuredContent 为空对象，不报错', async () => {
    mockGetProductDetailCache.mockReturnValue(null);
    mockRequest.mockResolvedValue({ result: true, code: 200, data: null });

    const result = await handleProductTool('show_product_detail', { pid: 'P002' });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual({});
    expect((result._meta as Record<string, unknown>)?.ui).toMatchObject({
      resourceUri: 'ui://cj-mcp/product-detail',
    });
  });
});
