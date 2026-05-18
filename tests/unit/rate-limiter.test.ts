/**
 * @fileoverview QPS 令牌桶限速器单元测试 (增强版)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter, QuotaExceededError, ResponseCache } from '../../src/api-client/rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  describe('getStatus', () => {
    it('初始状态各级别令牌数正确', () => {
      const status = limiter.getStatus();
      expect(status.tiers.read.available).toBe(10);
      expect(status.tiers.read.max).toBe(10);
      expect(status.tiers.write.available).toBe(2);
      expect(status.tiers.write.max).toBe(2);
      expect(status.tiers.auth.available).toBe(1);
      expect(status.tiers.auth.max).toBe(1);
      expect(status.global.available).toBe(20);
      expect(status.global.max).toBe(20);
      // 新增: 日配额、并发、缓存状态
      expect(status.dailyQuota.remaining).toBeGreaterThan(0);
      expect(status.concurrency.active).toBe(0);
      expect(status.cache.size).toBe(0);
    });
  });

  describe('acquire', () => {
    it('read 请求消耗 read + global 令牌', async () => {
      await limiter.acquire('read');
      const status = limiter.getStatus();
      expect(status.tiers.read.available).toBeLessThanOrEqual(9);
      expect(status.global.available).toBeLessThanOrEqual(19);
    });

    it('write 请求消耗 write + global 令牌', async () => {
      await limiter.acquire('write');
      const status = limiter.getStatus();
      expect(status.tiers.write.available).toBeLessThanOrEqual(1);
      expect(status.global.available).toBeLessThanOrEqual(19);
    });

    it('auth 请求消耗 auth + global 令牌', async () => {
      await limiter.acquire('auth');
      const status = limiter.getStatus();
      expect(status.tiers.auth.available).toBe(0);
      expect(status.global.available).toBeLessThanOrEqual(19);
    });

    it('连续 read 请求不超过 10 QPS (令牌耗尽后等待)', async () => {
      for (let i = 0; i < 10; i++) {
        await limiter.acquire('read');
      }
      const status = limiter.getStatus();
      expect(status.tiers.read.available).toBe(0);
    });
  });

  describe('concurrency', () => {
    it('获取和释放并发许可', async () => {
      await limiter.acquireConcurrency();
      const status = limiter.getStatus();
      expect(status.concurrency.active).toBe(1);
      limiter.releaseConcurrency();
      const status2 = limiter.getStatus();
      expect(status2.concurrency.active).toBe(0);
    });
  });

  describe('retry', () => {
    it('getRetryDelay 指数退避', () => {
      expect(limiter.getRetryDelay(0)).toBe(500);
      expect(limiter.getRetryDelay(1)).toBe(1000);
      expect(limiter.getRetryDelay(2)).toBe(2000);
    });

    it('getMaxRetries 返回3', () => {
      expect(limiter.getMaxRetries()).toBe(3);
    });
  });
});

describe('ResponseCache', () => {
  let cache: ResponseCache;

  beforeEach(() => {
    cache = new ResponseCache(1000); // 1s TTL
  });

  it('set 和 get 正常工作', () => {
    cache.set('key1', { value: 123 });
    expect(cache.get('key1')).toEqual({ value: 123 });
  });

  it('过期后 get 返回 undefined', async () => {
    cache.set('key2', 'data', 10); // 10ms TTL
    await new Promise(r => setTimeout(r, 20));
    expect(cache.get('key2')).toBeUndefined();
  });

  it('invalidate 清除指定 pattern', () => {
    cache.set('product:list', [1, 2]);
    cache.set('product:detail', { id: 1 });
    cache.set('order:list', [3]);
    cache.invalidate('product');
    expect(cache.get('product:list')).toBeUndefined();
    expect(cache.get('order:list')).toEqual([3]);
  });

  it('invalidate 无参数清除全部', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.invalidate();
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
  });
});
