/**
 * @fileoverview Official unpaid-order logistics read/update tools.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/auth/session', () => ({
  ensureAccessToken: vi.fn().mockResolvedValue('mock-token'),
  isSessionValid: vi.fn().mockReturnValue(true),
}));

const mockRequest = vi.fn();
vi.mock('../../src/api-client/http-client', () => ({
  httpClient: { request: (...args: unknown[]) => mockRequest(...args) },
  AuthExpiredError: class extends Error { name = 'AuthExpiredError'; },
  setTokenGetter: vi.fn(),
  isApiSuccess: (response: { result?: boolean; success?: boolean; code?: number }) =>
    response.result === true || response.success === true || response.code === 200 || response.code === 0,
}));

vi.mock('../../src/config/env', () => ({
  getEnvConfig: () => ({
    openApiBase: 'https://developers.cjdropshipping.com',
    webBase: 'https://www.cjdropshipping.com',
  }),
}));

vi.mock('../../src/mcp-server/resources/index', () => ({
  setOrderListCache: vi.fn(),
  setOrderDetailCache: vi.fn(),
  getOrderListCache: vi.fn(),
  getOrderDetailCache: vi.fn(),
}));

import { ENDPOINTS } from '../../src/api-client/endpoints';
import { getOrderTools, handleOrderTool, orderTools } from '../../src/mcp-server/tools/order.tool';
import { getToolsList, handleToolCall, registerTools } from '../../src/mcp-server/tools/index';
import { isSensitiveTool } from '../../src/utils/sensitive-ops';

describe('CJ unpaid order logistics tools', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValue({ code: 200, result: true, message: 'Success', data: {} });
    registerTools();
  });

  it('maps the two official endpoints and registers narrow tool safety metadata', () => {
    expect(ENDPOINTS.shopping.getOrderLogisticsInfo).toBe('/shopping/order/getOrderLogisticsInfo');
    expect(ENDPOINTS.shopping.updateLogistics).toBe('/shopping/order/updateLogistics');

    const names = orderTools.map(tool => tool.name);
    expect(names).toContain('get_order_logistics_options');
    expect(names).toContain('update_unpaid_order_logistics');
    expect(getToolsList().map(tool => tool.name)).toEqual(expect.arrayContaining(names));

    const tools = getOrderTools();
    expect(tools.find(tool => tool.name === 'get_order_logistics_options')?.annotations).toEqual({ readOnlyHint: true });
    expect(tools.find(tool => tool.name === 'update_unpaid_order_logistics')?.annotations).toBeUndefined();
    expect(isSensitiveTool('update_unpaid_order_logistics')).toBe(true);
  });

  it('gets the authoritative modifiable route list for one exact order code', async () => {
    const data = [{ id: 'order-row-1', logisticsName: 'CJPacket Ordinary', freight: 12.1 }];
    mockRequest.mockResolvedValueOnce({ code: 200, result: true, message: 'Success', data });

    const result = await handleOrderTool('get_order_logistics_options', {
      orderCode: 'DP2608231826390664200',
    });

    expect(mockRequest).toHaveBeenCalledWith('/shopping/order/getOrderLogisticsInfo', {
      method: 'GET',
      params: { orderCode: 'DP2608231826390664200' },
      tier: 'read',
    });
    expect(JSON.parse(String(result.content[0].text))).toEqual(data);
  });

  it('updates only one exact unpaid order with from=1 fixed by the tool', async () => {
    const data = { orderCode: 'DP2608231826390664200', logisticsName: 'CJPacket Ordinary' };
    mockRequest.mockResolvedValueOnce({ code: 200, result: true, message: 'Success', data });

    const result = await handleOrderTool('update_unpaid_order_logistics', {
      id: 'order-row-1',
      orderCode: 'DP2608231826390664200',
      logisticsName: 'CJPacket Ordinary',
    });

    expect(mockRequest).toHaveBeenCalledWith('/shopping/order/updateLogistics', {
      method: 'POST',
      body: {
        id: 'order-row-1',
        orderCode: 'DP2608231826390664200',
        logisticsName: 'CJPacket Ordinary',
        from: 1,
      },
      tier: 'write',
    });
    expect(JSON.parse(String(result.content[0].text))).toEqual(data);
  });

  it.each([
    ['get_order_logistics_options', {}, 'orderCode'],
    ['get_order_logistics_options', { orderCode: ' DP2608231826390664200 ' }, 'orderCode'],
    ['update_unpaid_order_logistics', { id: '', orderCode: 'DP1', logisticsName: 'CJPacket' }, 'id'],
    ['update_unpaid_order_logistics', { id: '1', orderCode: '', logisticsName: 'CJPacket' }, 'orderCode'],
    ['update_unpaid_order_logistics', { id: '1', orderCode: 'DP1', logisticsName: '' }, 'logisticsName'],
  ])('blocks malformed input before dispatch: %s %j', async (name, args, message) => {
    const result = await handleOrderTool(name, args);

    expect(result.isError).toBe(true);
    expect(String(result.content[0].text)).toContain(message);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('dispatches both tools through the central MCP registry', async () => {
    mockRequest
      .mockResolvedValueOnce({ code: 200, result: true, message: 'Success', data: [{ id: 'row-1' }] })
      .mockResolvedValueOnce({ code: 200, result: true, message: 'Success', data: { updated: true } });

    const read = await handleToolCall('get_order_logistics_options', { orderCode: 'DP1' });
    const write = await handleToolCall('update_unpaid_order_logistics', {
      id: 'row-1', orderCode: 'DP1', logisticsName: 'CJPacket Ordinary',
    });

    expect(read.isError).not.toBe(true);
    expect(write.isError).not.toBe(true);
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it('preserves an official non-modifiable error and performs no fallback call', async () => {
    mockRequest.mockResolvedValueOnce({
      code: 400,
      result: false,
      message: 'The current order status does not support logistics modification.',
      data: null,
    });

    const result = await handleOrderTool('update_unpaid_order_logistics', {
      id: 'row-1', orderCode: 'DP1', logisticsName: 'CJPacket Ordinary',
    });

    expect(result.isError).toBe(true);
    expect(String(result.content[0].text)).toContain('400');
    expect(String(result.content[0].text)).toContain('does not support logistics modification');
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });
});
