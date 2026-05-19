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

describe('order.tool', () => {
  beforeEach(() => mockRequest.mockClear());

  it('注册了8个tools', () => {
    expect(orderTools).toHaveLength(8);
    expect(orderTools.map(t => t.name)).toContain('add_to_cart');
    expect(orderTools.map(t => t.name)).toContain('create_order');
    expect(orderTools.map(t => t.name)).toContain('get_order_list');
    expect(orderTools.map(t => t.name)).toContain('get_order_detail');
    expect(orderTools.map(t => t.name)).toContain('get_account_balance');
  });

  it('add_to_cart 调用正确的端点', async () => {
    const result = await handleOrderTool('add_to_cart', { vid: 'V123', quantity: 2 });
    expect(mockRequest).toHaveBeenCalledWith(
      '/shopping/order/addCart',
      expect.objectContaining({ body: { vid: 'V123', quantity: 2 }, tier: 'write' })
    );
    expect(result.isError).toBeUndefined();
  });

  it('get_pay_order_list 调用正确端点', async () => {
    await handleOrderTool('get_pay_order_list', { pageNum: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      '/shopping/directOrder/getPayOrderListV3',
      expect.objectContaining({ tier: 'read' })
    );
  });
});

describe('dispute.tool', () => {
  beforeEach(() => mockRequest.mockClear());

  it('注册了4个tools', () => {
    expect(disputeTools).toHaveLength(4);
    expect(disputeTools.map(t => t.name)).toContain('create_dispute');
    expect(disputeTools.map(t => t.name)).toContain('cancel_dispute');
    expect(disputeTools.map(t => t.name)).toContain('list_disputes');
  });

  it('create_dispute 使用 write tier', async () => {
    await handleDisputeTool('create_dispute', { orderId: 'O001', reason: 'damaged' });
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

  it('注册了2个tools', () => {
    expect(shopTools).toHaveLength(2);
    expect(shopTools.map(t => t.name)).toContain('list_shops');
    expect(shopTools.map(t => t.name)).toContain('get_authorize_url');
  });

  it('list_shops 调用 /shop/getShops', async () => {
    await handleShopTool('list_shops', {});
    expect(mockRequest).toHaveBeenCalledWith(
      '/shop/getShops',
      expect.objectContaining({ tier: 'read' })
    );
  });
});

describe('stock.tool', () => {
  beforeEach(() => mockRequest.mockClear());

  it('注册了3个tools', () => {
    expect(stockTools).toHaveLength(3);
    expect(stockTools.map(t => t.name)).toContain('query_private_inventory');
    expect(stockTools.map(t => t.name)).toContain('query_sku_details');
  });

  it('query_sku_details 调用正确端点', async () => {
    await handleStockTool('query_sku_details', { productId: 'P999' });
    expect(mockRequest).toHaveBeenCalledWith(
      '/product/stock/privateInventory/querySkuListByProductId',
      expect.objectContaining({ body: { productId: 'P999' }, tier: 'read' })
    );
  });
});
