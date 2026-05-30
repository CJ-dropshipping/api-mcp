/**
 * @fileoverview 订单/纠纷/店铺/库存 Tools 单元测试
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

const mockRequest = vi.fn().mockResolvedValue({ code: 200, result: true, message: 'OK', data: { items: [] } });

// @note 新增(第5次提交): Mock resources/index 以便控制 getOrderListCache / getOrderDetailCache
const mockGetOrderListCache = vi.fn();
const mockGetOrderDetailCache = vi.fn();
vi.mock('../../src/mcp-server/resources/index', () => ({
  setProductListCache: vi.fn(),
  getProductListCache: vi.fn(),
  setProductDetailCache: vi.fn(),
  getProductDetailCache: vi.fn(),
  hasProductDetailCache: vi.fn().mockReturnValue(false),
  setOrderListCache: vi.fn(),
  getOrderListCache: () => mockGetOrderListCache(),
  setOrderDetailCache: vi.fn(),
  getOrderDetailCache: () => mockGetOrderDetailCache(),
}));

vi.mock('../../src/api-client/http-client', () => ({
  httpClient: { request: (...args: unknown[]) => mockRequest(...args) },
  AuthExpiredError: class extends Error { name = 'AuthExpiredError'; },
  isApiSuccess: (r: { result?: boolean; success?: boolean; code: number }) =>
    r.result === true || r.success === true || r.code === 200 || r.code === 0,
  setTokenGetter: vi.fn(),
}));

import { handleOrderTool, orderTools } from '../../src/mcp-server/tools/order.tool';
import { handleDisputeTool, disputeTools } from '../../src/mcp-server/tools/dispute.tool';
import { handleShopTool, shopTools } from '../../src/mcp-server/tools/shop.tool';
import { handleStockTool, stockTools } from '../../src/mcp-server/tools/stock.tool';
import { logisticsTools } from '../../src/mcp-server/tools/logistics.tool';
import { webhookTools } from '../../src/mcp-server/tools/webhook.tool';

describe('order.tool', () => {
  beforeEach(() => mockRequest.mockClear());

  it('注册了14个tools', () => {
    expect(orderTools).toHaveLength(18);
    expect(orderTools.map(t => t.name)).toContain('add_to_cart');
    expect(orderTools.map(t => t.name)).toContain('create_order');
    expect(orderTools.map(t => t.name)).toContain('submit_order_to_cart');
    expect(orderTools.map(t => t.name)).toContain('confirm_cart_and_pay');
    expect(orderTools.map(t => t.name)).toContain('generate_payment_link');
    expect(orderTools.map(t => t.name)).toContain('get_order_list');
    expect(orderTools.map(t => t.name)).toContain('get_order_detail');
    expect(orderTools.map(t => t.name)).toContain('get_account_balance');
    expect(orderTools.map(t => t.name)).toContain('pay_by_balance');
    expect(orderTools.map(t => t.name)).toContain('pay_by_balance_v2');
    expect(orderTools.map(t => t.name)).toContain('confirm_order');
    expect(orderTools.map(t => t.name)).toContain('delete_order');
    expect(orderTools.map(t => t.name)).toContain('query_cogs');
  });

  it('add_to_cart 调用正确的端点', async () => {
    const result = await handleOrderTool('add_to_cart', { vid: 'V123', quantity: 2 });
    expect(mockRequest).toHaveBeenCalledWith(
      '/shopping/order/addCart',
      expect.objectContaining({ body: { vid: 'V123', quantity: 2 }, tier: 'write' })
    );
    expect(result.isError).toBeUndefined();
  });

  it('get_pay_order_list 调用正确端点（已修正为 /shopping/order/list）', async () => {
    await handleOrderTool('get_pay_order_list', { pageNum: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      '/shopping/order/list',
      expect.objectContaining({ tier: 'read' })
    );
  });

  /**
   * @note 新增(第5次提交): show_order_list 通过 structuredContent 把最新订单列表数据
   * 推送到 iframe（MCP Apps ui/notifications/tool-result 协议），
   * 解决 ChatGPT 缓存 HTML 后数据不更新的问题。
   */
  it('show_order_list 有缓存时 structuredContent 包含订单数据，resourceUri 为固定 URI', async () => {
    const mockListData = { list: [{ orderId: 'O001', orderStatus: 'SHIPPED' }], total: 1, pageNum: 1, pageSize: 20 };
    mockGetOrderListCache.mockReturnValue(mockListData);

    const result = await handleOrderTool('show_order_list', {});

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual(mockListData);
    expect((result._meta as Record<string, unknown>)?.ui).toMatchObject({
      resourceUri: 'ui://cj-mcp/order-list',  // 固定 URI，不含时间戳
    });
  });

  it('show_order_list 无缓存时 structuredContent 为空对象，不报错', async () => {
    mockGetOrderListCache.mockReturnValue(null);

    const result = await handleOrderTool('show_order_list', {});

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual({});
    expect((result._meta as Record<string, unknown>)?.ui).toMatchObject({
      resourceUri: 'ui://cj-mcp/order-list',
    });
  });

  it('show_order_detail 有缓存时 structuredContent 包含订单详情，resourceUri 为固定 URI', async () => {
    const mockDetailData = { orderId: 'O001', orderStatus: 'DELIVERED', productList: [] };
    mockGetOrderDetailCache.mockReturnValue(mockDetailData);
    mockRequest.mockResolvedValue({ code: 200, result: true, data: mockDetailData });

    const result = await handleOrderTool('show_order_detail', { orderId: 'O001' });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual(mockDetailData);
    expect((result._meta as Record<string, unknown>)?.ui).toMatchObject({
      resourceUri: 'ui://cj-mcp/order-detail',  // 固定 URI，不含时间戳
    });
  });
});

describe('dispute.tool', () => {
  beforeEach(() => mockRequest.mockClear());

  it('注册了6个tools', () => {
    expect(disputeTools).toHaveLength(6);
    expect(disputeTools.map(t => t.name)).toContain('get_dispute_products');
    expect(disputeTools.map(t => t.name)).toContain('create_dispute');
    expect(disputeTools.map(t => t.name)).toContain('cancel_dispute');
    expect(disputeTools.map(t => t.name)).toContain('list_disputes');
    expect(disputeTools.map(t => t.name)).toContain('get_dispute_detail');
    expect(disputeTools.map(t => t.name)).toContain('confirm_dispute');
  });

  it('create_dispute 使用 write tier 并传正确参数', async () => {
    await handleDisputeTool('create_dispute', {
      orderId: 'O001',
      disputeReasonId: 1,
      expectType: 1,
      messageText: '质量问题',
      productInfoList: [{ lineItemId: 'L001', quantity: 1, price: 10 }],
    });
    expect(mockRequest).toHaveBeenCalledWith(
      '/disputes/create',
      expect.objectContaining({ tier: 'write' })
    );
  });

  it('list_disputes 使用 read tier', async () => {
    await handleDisputeTool('list_disputes', { pageNum: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      '/disputes/getDisputeList',
      expect.objectContaining({ tier: 'read' })
    );
  });
});

describe('shop.tool', () => {
  beforeEach(() => mockRequest.mockClear());

  it('注册了4个tools', () => {
    expect(shopTools).toHaveLength(4);
    expect(shopTools.map(t => t.name)).toContain('list_shops');
    expect(shopTools.map(t => t.name)).toContain('get_authorize_url');
    expect(shopTools.map(t => t.name)).toContain('get_account_settings');
    expect(shopTools.map(t => t.name)).toContain('save_product_to_shop');
  });

  it('list_shops 调用 /shop/getShops', async () => {
    await handleShopTool('list_shops', {});
    expect(mockRequest).toHaveBeenCalledWith(
      '/shop/getShops',
      expect.objectContaining({ tier: 'read' })
    );
  });
});

describe('logistics.tool', () => {
  it('注册了4个tools（含 calculate_freight_tip）', () => {
    expect(logisticsTools).toHaveLength(4);
    expect(logisticsTools.map((t: { name: string }) => t.name)).toContain('calculate_freight');
    expect(logisticsTools.map((t: { name: string }) => t.name)).toContain('get_tracking_info');
    expect(logisticsTools.map((t: { name: string }) => t.name)).toContain('calculate_freight_tip');
  });
});

describe('webhook.tool', () => {
  it('注册了1个tool（configure_webhook）', () => {
    expect(webhookTools).toHaveLength(1);
    expect(webhookTools.map((t: { name: string }) => t.name)).toContain('configure_webhook');
  });
});

describe('stock.tool', () => {
  beforeEach(() => mockRequest.mockClear());

  it('注册了7个tools', () => {
    expect(stockTools).toHaveLength(7);
    expect(stockTools.map(t => t.name)).toContain('query_private_inventory');
    expect(stockTools.map(t => t.name)).toContain('query_sku_details');
    expect(stockTools.map(t => t.name)).toContain('query_sku_detail_page');
    expect(stockTools.map(t => t.name)).toContain('query_sku_detail_by_sku');
    expect(stockTools.map(t => t.name)).toContain('get_product_inventory');
    expect(stockTools.map(t => t.name)).toContain('get_storage_info');
    expect(stockTools.map(t => t.name)).toContain('query_warehouse_order_pictures');
  });

  it('query_sku_details 调用正确端点', async () => {
    await handleStockTool('query_sku_details', { productId: 'P999' });
    expect(mockRequest).toHaveBeenCalledWith(
      '/product/stock/privateInventory/querySkuListByProductId',
      expect.objectContaining({ body: { productId: 'P999' }, tier: 'read' })
    );
  });
});
