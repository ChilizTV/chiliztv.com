import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisCacheService } from '../RedisCacheService';
import type { RedisClient } from '../RedisClient';
import type { ILogger } from '@chiliztv/domain/shared/ports/ILogger';

const PREFIX = 'test:';

function makeLogger(): ILogger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

interface StoredValue {
  value: string;
  expireAt: number;
}

function makeFakeRedis(): { client: RedisClient; store: Map<string, StoredValue> } {
  const store = new Map<string, StoredValue>();
  const now = () => Date.now();
  const isAlive = (k: string) => {
    const v = store.get(k);
    if (!v) return false;
    if (v.expireAt !== 0 && v.expireAt <= now()) {
      store.delete(k);
      return false;
    }
    return true;
  };

  const client = {
    get: vi.fn(async (k: string) => (isAlive(k) ? store.get(k)!.value : null)),

    set: vi.fn(async (...args: unknown[]) => {
      const key = args[0] as string;
      const value = args[1] as string;
      const flags = args.slice(2);
      const ttlIdx = flags.indexOf('EX');
      const ttl = ttlIdx >= 0 ? Number(flags[ttlIdx + 1]) : 0;
      const pxIdx = flags.indexOf('PX');
      const pxTtl = pxIdx >= 0 ? Number(flags[pxIdx + 1]) : 0;
      const nx = flags.includes('NX');
      if (nx && isAlive(key)) return null;
      const expireAt = ttl > 0 ? now() + ttl * 1000 : pxTtl > 0 ? now() + pxTtl : 0;
      store.set(key, { value, expireAt });
      return 'OK';
    }),

    unlink: vi.fn(async (...keys: string[]) => {
      let n = 0;
      for (const k of keys) {
        if (store.delete(k)) n++;
      }
      return n;
    }),

    mget: vi.fn(async (...keys: string[]) =>
      keys.map((k) => (isAlive(k) ? store.get(k)!.value : null)),
    ),

    scan: vi.fn(async () => ['0', Array.from(store.keys())] as [string, string[]]),

    pipeline: vi.fn(() => {
      const ops: Array<() => Promise<unknown>> = [];
      const pipelineApi = {
        set: (key: string, value: string, _ex: string, ttl: number) => {
          ops.push(async () => {
            store.set(key, { value, expireAt: now() + ttl * 1000 });
          });
          return pipelineApi;
        },
        exec: async () => {
          for (const op of ops) await op();
          return [];
        },
      };
      return pipelineApi as unknown;
    }),

    incr: vi.fn(async (k: string) => {
      const current = isAlive(k) ? Number(store.get(k)!.value) : 0;
      const next = current + 1;
      store.set(k, { value: String(next), expireAt: store.get(k)?.expireAt ?? 0 });
      return next;
    }),

    expire: vi.fn(async (k: string, ttl: number) => {
      const v = store.get(k);
      if (!v) return 0;
      v.expireAt = now() + ttl * 1000;
      return 1;
    }),

    ttl: vi.fn(async (k: string) => {
      const v = store.get(k);
      if (!v) return -2;
      if (v.expireAt === 0) return -1;
      return Math.max(0, Math.floor((v.expireAt - now()) / 1000));
    }),

    releaseCacheLock: vi.fn(async (key: string, token: string) => {
      const v = store.get(key);
      if (v && v.value === token) {
        store.delete(key);
        return 1;
      }
      return 0;
    }),

    renewCacheLock: vi.fn(async (key: string, token: string, ttlMs: number) => {
      const v = store.get(key);
      if (v && v.value === token) {
        v.expireAt = now() + ttlMs;
        return 1;
      }
      return 0;
    }),
  } as unknown as RedisClient;

  return { client, store };
}

describe('RedisCacheService', () => {
  let redis: ReturnType<typeof makeFakeRedis>;
  let cache: RedisCacheService;

  beforeEach(() => {
    redis = makeFakeRedis();
    cache = new RedisCacheService(redis.client, makeLogger());
  });

  it('get returns hit=false on missing key', async () => {
    expect(await cache.get('absent')).toEqual({ hit: false });
  });

  it('set then get round-trips parsed JSON', async () => {
    await cache.set('match:1', { id: 1, name: 'PSG' }, 60);
    expect(await cache.get('match:1')).toEqual({ hit: true, value: { id: 1, name: 'PSG' } });
  });

  it('delete removes the key', async () => {
    await cache.set('k', 'v', 60);
    await cache.delete('k');
    expect(await cache.get('k')).toEqual({ hit: false });
  });

  it('mget batches and parses each entry, skipping misses', async () => {
    await cache.set('a', 1, 60);
    await cache.set('c', 3, 60);
    const out = await cache.mget<number>(['a', 'b', 'c']);
    expect(out.get('a')).toBe(1);
    expect(out.has('b')).toBe(false);
    expect(out.get('c')).toBe(3);
  });

  it('getOrLoad returns the cached value without invoking the loader', async () => {
    await cache.set('hot', { x: 1 }, 60);
    const loader = vi.fn();
    expect(await cache.getOrLoad({ key: 'hot', ttlSeconds: 60, loader })).toEqual({ x: 1 });
    expect(loader).not.toHaveBeenCalled();
  });

  it('getOrLoad on miss runs the loader once and caches the result', async () => {
    const loader = vi.fn().mockResolvedValue({ apy: 4.2 });
    const result = await cache.getOrLoad({ key: 'cold', ttlSeconds: 60, loader });
    expect(result).toEqual({ apy: 4.2 });
    expect(loader).toHaveBeenCalledTimes(1);
    expect(await cache.get('cold')).toEqual({ hit: true, value: { apy: 4.2 } });
  });

  it('getOrLoad dedupes concurrent in-flight requests to a single loader call', async () => {
    let resolveLoader!: (v: { x: number }) => void;
    const deferred = new Promise<{ x: number }>((resolve) => {
      resolveLoader = resolve;
    });
    const loader = vi.fn().mockReturnValue(deferred);
    const a = cache.getOrLoad({ key: 'race', ttlSeconds: 60, loader });
    const b = cache.getOrLoad({ key: 'race', ttlSeconds: 60, loader });
    await new Promise((r) => setTimeout(r, 10));
    resolveLoader({ x: 42 });
    const [r1, r2] = await Promise.all([a, b]);
    expect(r1).toEqual({ x: 42 });
    expect(r2).toEqual({ x: 42 });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('getOrLoad caches null loader result with negative TTL', async () => {
    const loader = vi.fn().mockResolvedValue(null);
    const result = await cache.getOrLoad({
      key: 'gone',
      ttlSeconds: 300,
      negativeTtlSeconds: 30,
      loader,
    });
    expect(result).toBeNull();
    expect(await cache.get('gone')).toEqual({ hit: true, value: null });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('markFresh writes a freshness marker and clears L1 inflight', async () => {
    await cache.markFresh('user:0xabc', 5);
    const raw = await redis.client.get(`${PREFIX}freshness:user:0xabc`);
    expect(raw).toBe('1');
  });

  it('bypassIfFreshnessMarker skips cache when marker is present', async () => {
    await cache.set('user:0xabc', { found: true, user: { username: 'old' } }, 300);
    await cache.markFresh('user:0xabc', 5);
    const loader = vi.fn().mockResolvedValue({ found: true, user: { username: 'fresh' } });
    const result = await cache.getOrLoad({
      key: 'user:0xabc',
      ttlSeconds: 300,
      loader,
      bypassIfFreshnessMarker: true,
    });
    expect(result).toEqual({ found: true, user: { username: 'fresh' } });
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
