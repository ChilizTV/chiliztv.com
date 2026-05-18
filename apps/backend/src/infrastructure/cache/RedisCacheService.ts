import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'node:crypto';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type {
  CacheLoadOptions,
  CacheReadResult,
  ICacheService,
} from '@chiliztv/domain/shared/ports/ICacheService';
import type { ILogger } from '@chiliztv/domain/shared/ports/ILogger';
import type { RedisClient } from './RedisClient';
import { encodeForCache, decodeFromCache } from './CacheCodec';
import { env } from '../config/environment';

const LOCK_TTL_SECONDS = 10;
const LOCK_WAIT_MAX_MS = 2_000;
const LOCK_WAIT_STEP_MS = 50;
const SCAN_BATCH = 100;
const INVALIDATE_CHANNEL_SUFFIX = 'cache:invalidate';

// Sample rate for per-call hit/miss/error telemetry. In production at
// 100-300 cmd/s the unfiltered stream would flood Fly Logs; 1% gives us a
// statistically usable signal without paying for noise. Full sampling in
// dev/test keeps local debugging immediate.
const CACHE_LOG_SAMPLE_RATE = (() => {
  if (env.NODE_ENV === 'production') return 0.01;
  return 1;
})();

@injectable()
export class RedisCacheService implements ICacheService {
  private readonly prefix = `${env.NODE_ENV}:`;
  private readonly invalidateChannel = `${env.NODE_ENV}:${INVALIDATE_CHANNEL_SUFFIX}`;
  private readonly inflight = new Map<string, Promise<unknown>>();
  private subscriberInitialised = false;

  constructor(
    @inject(TOKENS.RedisClient) private readonly redis: RedisClient,
    @inject(TOKENS.ILogger) private readonly logger: ILogger,
  ) {
    this.initInvalidationSubscriber();
  }

  /**
   * Subscribes to the cross-instance invalidation channel. ioredis requires
   * a dedicated connection for SUBSCRIBE (subscribed connections can't run
   * regular commands), so we `duplicate()` the main client. Each message
   * carries a single key; receivers clear their L1 inflight slot for it.
   * Local writes still publish — same code path, the local instance also
   * receives its own message and clears its inflight as a side-effect, which
   * matches the freshness-marker contract.
   */
  private initInvalidationSubscriber(): void {
    if (this.subscriberInitialised) return;
    this.subscriberInitialised = true;
    try {
      const subscriber = this.redis.duplicate();
      subscriber.on('error', (err: Error) => {
        this.logger.warn('Cache invalidation subscriber error', { message: err.message });
      });
      subscriber.on('message', (_channel: string, payload: string) => {
        if (!payload) return;
        this.inflight.delete(payload);
      });
      // The duplicate inherits enableOfflineQueue:false; subscribing before
      // 'ready' would reject. Gate on the connection coming up.
      const doSubscribe = (): void => {
        subscriber.subscribe(this.invalidateChannel).catch((err: Error) => {
          this.logger.warn('Cache invalidation subscribe failed', { message: err.message });
        });
      };
      if (subscriber.status === 'ready') doSubscribe();
      else subscriber.once('ready', doSubscribe);
    } catch (err) {
      this.logger.warn('Cache invalidation subscriber failed to start', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async publishInvalidation(key: string): Promise<void> {
    try {
      await this.redis.publish(this.invalidateChannel, key);
    } catch (err) {
      this.logger.warn('Cache invalidation publish failed', {
        key,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async get<T>(key: string): Promise<CacheReadResult<T>> {
    const full = this.prefix + key;
    const raw = await this.redis.get(full);
    if (raw === null) return { hit: false };
    try {
      return { hit: true, value: decodeFromCache(raw) as T };
    } catch (err) {
      this.logger.warn('Cache JSON parse failed, treating as miss', { key, error: (err as Error).message });
      return { hit: false };
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const full = this.prefix + key;
    await this.redis.set(full, encodeForCache(value), 'EX', ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.redis.unlink(this.prefix + key);
    await this.publishInvalidation(key);
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const full = this.prefix + pattern;
    let cursor = '0';
    let deleted = 0;
    do {
      const [next, keys] = await this.redis.scan(cursor, 'MATCH', full, 'COUNT', SCAN_BATCH);
      if (keys.length > 0) {
        deleted += await this.redis.unlink(...keys);
      }
      cursor = next;
    } while (cursor !== '0');
    return deleted;
  }

  async mget<T>(keys: readonly string[]): Promise<Map<string, T>> {
    if (keys.length === 0) return new Map();
    const fullKeys = keys.map((k) => this.prefix + k);
    const rows = await this.redis.mget(...fullKeys);
    const out = new Map<string, T>();
    rows.forEach((raw, i) => {
      if (raw === null) return;
      try {
        out.set(keys[i]!, decodeFromCache(raw) as T);
      } catch (err) {
        this.logger.warn('Cache JSON parse failed in mget, skipping key', { key: keys[i], error: (err as Error).message });
      }
    });
    return out;
  }

  async mset<T>(entries: ReadonlyArray<{ key: string; value: T; ttl: number }>): Promise<void> {
    if (entries.length === 0) return;
    const pipeline = this.redis.pipeline();
    for (const entry of entries) {
      pipeline.set(this.prefix + entry.key, encodeForCache(entry.value), 'EX', entry.ttl);
    }
    await pipeline.exec();
  }

  async incr(key: string, ttlSeconds: number): Promise<number> {
    const full = this.prefix + key;
    const next = await this.redis.incr(full);
    if (next === 1) {
      await this.redis.expire(full, ttlSeconds);
    }
    return next;
  }

  async markFresh(key: string, freshnessSeconds: number): Promise<void> {
    const full = `${this.prefix}freshness:${key}`;
    await this.redis.set(full, '1', 'EX', Math.max(1, freshnessSeconds));
    this.clearInflight(key);
    await this.publishInvalidation(key);
  }

  clearInflight(key: string): void {
    this.inflight.delete(key);
  }

  async getOrLoad<T>(opts: CacheLoadOptions<T>): Promise<T | null> {
    const { key, ttlSeconds, jitterPct = 15, negativeTtlSeconds, loader, bypassIfFreshnessMarker } = opts;
    const startedAt = Date.now();

    const existing = this.inflight.get(key) as Promise<T | null> | undefined;
    if (existing) {
      this.sampleLog('cache_inflight_dedup', { key });
      return existing;
    }

    if (bypassIfFreshnessMarker) {
      const fresh = await this.redis.get(`${this.prefix}freshness:${key}`);
      if (fresh !== null) {
        this.sampleLog('cache_freshness_bypass', { key });
        return loader();
      }
    }

    const cached = await this.get<T>(key);
    if (cached.hit) {
      this.sampleLog('cache_hit', { key, durationMs: Date.now() - startedAt });
      return cached.value;
    }

    const lockKey = `${this.prefix}lock:cache:${key}`;
    const lockToken = randomUUID();
    const acquired = await this.redis.set(lockKey, lockToken, 'EX', LOCK_TTL_SECONDS, 'NX');

    if (acquired !== 'OK') {
      this.sampleLog('cache_miss_contended', { key });
      const elapsed = await this.waitForCachedFill<T>(key);
      if (elapsed.hit) return elapsed.value;
      return loader();
    }

    const work = (async () => {
      try {
        const value = await loader();
        const effectiveTtl = value === null
          ? (negativeTtlSeconds ?? ttlSeconds)
          : ttlSeconds;
        const jittered = applyJitter(effectiveTtl, jitterPct);
        await this.redis.set(this.prefix + key, encodeForCache(value), 'EX', jittered);
        this.sampleLog('cache_miss_filled', {
          key,
          durationMs: Date.now() - startedAt,
          ttlSeconds: jittered,
          negative: value === null,
        });
        return value;
      } finally {
        this.inflight.delete(key);
        try {
          await this.redis.releaseCacheLock(lockKey, lockToken);
        } catch (err) {
          this.logger.warn('Cache lock release failed', { key, error: (err as Error).message });
        }
      }
    })();
    this.inflight.set(key, work);
    return work;
  }

  private sampleLog(event: string, meta: Record<string, unknown>): void {
    if (CACHE_LOG_SAMPLE_RATE >= 1 || Math.random() < CACHE_LOG_SAMPLE_RATE) {
      this.logger.debug(event, meta);
    }
  }

  private async waitForCachedFill<T>(key: string): Promise<CacheReadResult<T>> {
    const deadline = Date.now() + LOCK_WAIT_MAX_MS;
    while (Date.now() < deadline) {
      await sleep(LOCK_WAIT_STEP_MS + Math.floor(Math.random() * LOCK_WAIT_STEP_MS));
      const cached = await this.get<T>(key);
      if (cached.hit) return cached;
    }
    return { hit: false };
  }
}

function applyJitter(ttlSeconds: number, jitterPct: number): number {
  if (jitterPct <= 0) return ttlSeconds;
  const factor = 1 + ((Math.random() * 2 - 1) * jitterPct) / 100;
  return Math.max(1, Math.round(ttlSeconds * factor));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
