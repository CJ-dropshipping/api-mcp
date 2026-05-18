/**
 * @fileoverview 限速器 (增强版)
 * - 令牌桶 3级限速: 查询10QPS / 写操作2QPS / 认证1QPS，全局上限20QPS
 * - 请求队列 + 延迟重试 (最多3次, 指数退避)
 * - 日配额限制 (每日最大调用次数，默认10000)
 * - 并发限制 (最大同时并发Tool调用数，默认5)
 * - 常用数据缓存 (减少重复API调用)
 */

export type RateTier = 'read' | 'write' | 'auth';

interface BucketConfig {
  maxTokens: number;
  refillRate: number; // tokens per second
}

const TIER_CONFIG: Record<RateTier, BucketConfig> = {
  read: { maxTokens: 10, refillRate: 10 },
  write: { maxTokens: 2, refillRate: 2 },
  auth: { maxTokens: 1, refillRate: 1 },
};

const GLOBAL_CONFIG: BucketConfig = { maxTokens: 20, refillRate: 20 };

/** 日配额上限 */
const DAILY_QUOTA = Number(process.env.CJ_DAILY_QUOTA) || 10000;

/** 最大并发 Tool 调用数 */
const MAX_CONCURRENCY = Number(process.env.CJ_MAX_CONCURRENCY) || 5;

/** 延迟重试配置 */
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;

  constructor(config: BucketConfig) {
    this.maxTokens = config.maxTokens;
    this.refillRate = config.refillRate;
    this.tokens = config.maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  tryConsume(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  getWaitTime(): number {
    this.refill();
    if (this.tokens >= 1) return 0;
    return Math.ceil(((1 - this.tokens) / this.refillRate) * 1000);
  }

  getStatus() {
    this.refill();
    return {
      available: Math.floor(this.tokens),
      max: this.maxTokens,
      refillRate: this.refillRate,
    };
  }
}

/**
 * @description 日配额计数器
 * 每日零点自动重置
 */
class DailyQuota {
  private count = 0;
  private dateKey = '';
  private readonly max: number;

  constructor(max: number) {
    this.max = max;
    this.resetIfNewDay();
  }

  private resetIfNewDay(): void {
    const today = new Date().toISOString().slice(0, 10);
    if (today !== this.dateKey) {
      this.dateKey = today;
      this.count = 0;
    }
  }

  tryConsume(): boolean {
    this.resetIfNewDay();
    if (this.count >= this.max) return false;
    this.count++;
    return true;
  }

  getStatus() {
    this.resetIfNewDay();
    return { used: this.count, max: this.max, remaining: this.max - this.count };
  }
}

/**
 * @description 并发控制信号量
 */
class ConcurrencySemaphore {
  private current = 0;
  private readonly max: number;
  private queue: Array<() => void> = [];

  constructor(max: number) {
    this.max = max;
  }

  async acquire(): Promise<void> {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.current++;
        resolve();
      });
    });
  }

  release(): void {
    this.current--;
    const next = this.queue.shift();
    if (next) next();
  }

  getStatus() {
    return { active: this.current, max: this.max, queued: this.queue.length };
  }
}

/**
 * @description 简单内存缓存 (TTL based)
 * 用于缓存常用查询数据 (如分类树、仓库列表)，减少 API 调用
 */
export class ResponseCache {
  private cache = new Map<string, { data: unknown; expiry: number }>();
  private readonly defaultTtlMs: number;

  constructor(defaultTtlMs = 5 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  set(key: string, data: unknown, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) this.cache.delete(key);
    }
  }

  getStatus() {
    let validCount = 0;
    const now = Date.now();
    for (const entry of this.cache.values()) {
      if (entry.expiry > now) validCount++;
    }
    return { size: validCount, ttlMs: this.defaultTtlMs };
  }
}

export class RateLimiter {
  private tierBuckets: Map<RateTier, TokenBucket> = new Map();
  private globalBucket: TokenBucket;
  private dailyQuota: DailyQuota;
  private concurrency: ConcurrencySemaphore;
  public cache: ResponseCache;

  constructor() {
    for (const [tier, config] of Object.entries(TIER_CONFIG)) {
      this.tierBuckets.set(tier as RateTier, new TokenBucket(config));
    }
    this.globalBucket = new TokenBucket(GLOBAL_CONFIG);
    this.dailyQuota = new DailyQuota(DAILY_QUOTA);
    this.concurrency = new ConcurrencySemaphore(MAX_CONCURRENCY);
    this.cache = new ResponseCache();
  }

  /**
   * @description 获取限速许可 (含队列等待)
   * 失败时抛出错误
   */
  async acquire(tier: RateTier): Promise<void> {
    // 日配额检查
    if (!this.dailyQuota.tryConsume()) {
      throw new QuotaExceededError(
        `日调用配额已达上限 (${DAILY_QUOTA}次)，请明日再试 / Daily quota exceeded (${DAILY_QUOTA} calls). Try again tomorrow.`
      );
    }

    const tierBucket = this.tierBuckets.get(tier)!;

    while (!tierBucket.tryConsume() || !this.globalBucket.tryConsume()) {
      const tierWait = tierBucket.getWaitTime();
      const globalWait = this.globalBucket.getWaitTime();
      const waitTime = Math.max(tierWait, globalWait, 50);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * @description 获取并发许可
   */
  async acquireConcurrency(): Promise<void> {
    await this.concurrency.acquire();
  }

  /**
   * @description 释放并发许可
   */
  releaseConcurrency(): void {
    this.concurrency.release();
  }

  /**
   * @description 计算重试延迟 (指数退避)
   */
  getRetryDelay(attempt: number): number {
    return BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
  }

  getMaxRetries(): number {
    return MAX_RETRIES;
  }

  getStatus() {
    const tiers: Record<string, ReturnType<TokenBucket['getStatus']>> = {};
    for (const [tier, bucket] of this.tierBuckets) {
      tiers[tier] = bucket.getStatus();
    }
    return {
      tiers,
      global: this.globalBucket.getStatus(),
      dailyQuota: this.dailyQuota.getStatus(),
      concurrency: this.concurrency.getStatus(),
      cache: this.cache.getStatus(),
    };
  }
}

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export const rateLimiter = new RateLimiter();
