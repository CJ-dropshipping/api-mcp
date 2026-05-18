/**
 * @fileoverview HTTP Client 单元测试 (Mock fetch)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpClient, AuthExpiredError, setTokenGetter } from '../../src/api-client/http-client';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock env config
vi.mock('../../src/config/env', () => ({
  getEnvConfig: () => ({
    env: 'test',
    openApiBase: 'http://test002.cjdropshipping.offline.pre.com',
    webBase: 'http://www.cjdropshipping.offline.pre.com',
    loginApiBase: 'http://www.cjdropshipping.offline.pre.com',
    platform: 1,
    language: 'en',
    currency: 'USD',
    tokenEncryptKey: 'test-key',
  }),
}));

// Mock rate limiter
vi.mock('../../src/api-client/rate-limiter', () => ({
  rateLimiter: {
    acquire: vi.fn().mockResolvedValue(undefined),
    getRetryDelay: vi.fn((n: number) => 500 * Math.pow(2, n)),
    getMaxRetries: vi.fn().mockReturnValue(3),
  },
}));

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    rateLimit: vi.fn(),
    request: vi.fn(),
  },
  isDebugMode: vi.fn(() => false),
}));

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    client = new HttpClient();
    mockFetch.mockReset();
    setTokenGetter(() => 'test-token-123');
  });

  it('发送 POST 请求带正确的 headers', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ code: 200, result: true, message: 'Success', data: { id: 1 } }),
    });

    const result = await client.request('/product/query', {
      body: { keyword: 'test' },
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api2.0/v1/product/query');
    expect(options.method).toBe('POST');
    expect(options.headers['CJ-Access-Token']).toBe('test-token-123');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(result.code).toBe(200);
    expect(result.data).toEqual({ id: 1 });
  });

  it('skipAuth 时不携带 token', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ code: 200, result: true, message: 'Success', data: {} }),
    });

    await client.request('/authentication/getAccessToken', { skipAuth: true });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['CJ-Access-Token']).toBeUndefined();
  });

  it('401/1600100 抛出 AuthExpiredError', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ code: 1600100, result: false, message: 'Token expired', data: null }),
    });

    await expect(client.request('/product/query')).rejects.toThrow(AuthExpiredError);
  });

  it('GET 请求不携带 body', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ code: 200, result: true, data: [] }),
    });

    await client.request('/product/globalWarehouseList', { method: 'GET' });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.body).toBeUndefined();
  });

  it('params 附加到 URL query string', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ code: 200, result: true, data: {} }),
    });

    await client.request('/product/query', { params: { lang: 'en' } });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('lang=en');
  });
});
