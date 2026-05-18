import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetLatestApyUseCase } from '../GetLatestApyUseCase';
import { NoopCacheService } from '../../../../infrastructure/cache/NoopCacheService';
import type { IPoolApyRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IPoolApyRepository';
import type { ApyWindow, PoolApySnapshot } from '@chiliztv/domain/blockchain-indexing/entities/PoolApySnapshot';
import type { ICacheService, CacheLoadOptions, CacheReadResult } from '@chiliztv/domain/shared/ports/ICacheService';

function snapshot(window: ApyWindow, apyBps: number): PoolApySnapshot {
  return {
    id: `id-${window}`,
    windowLabel: window,
    ppsStart: 1_000_000n,
    ppsEnd: 1_001_234n,
    apyBps,
    apyPostFeeBps: apyBps - 50,
    periodDays: window === '7d' ? 7 : 30,
    noisy: false,
    blockStart: 100n,
    blockEnd: 200n,
    computedAt: new Date('2026-05-16T12:00:00.000Z'),
  };
}

function fakeRepo(impl: (w: ApyWindow) => Promise<PoolApySnapshot | null>): IPoolApyRepository {
  return {
    findLatest: vi.fn(impl),
    save: vi.fn(),
  };
}

/**
 * In-memory cache impl that exercises the same getOrLoad semantics as the
 * Redis adapter (single-flight + negative caching) without booting Redis.
 */
class RecordingCache implements ICacheService {
  private readonly store = new Map<string, unknown>();
  private readonly inflight = new Map<string, Promise<unknown>>();
  public readonly getOrLoadCalls: string[] = [];

  async get<T>(key: string): Promise<CacheReadResult<T>> {
    return this.store.has(key) ? { hit: true, value: this.store.get(key) as T } : { hit: false };
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
  async deleteByPattern(): Promise<number> {
    return 0;
  }
  async mget<T>(): Promise<Map<string, T>> {
    return new Map();
  }
  async mset<T>(entries: ReadonlyArray<{ key: string; value: T; ttl: number }>): Promise<void> {
    for (const e of entries) this.store.set(e.key, e.value);
  }
  async incr(): Promise<number> {
    return 1;
  }
  async markFresh(): Promise<void> {}
  clearInflight(key: string): void {
    this.inflight.delete(key);
  }
  async getOrLoad<T>(opts: CacheLoadOptions<T>): Promise<T | null> {
    this.getOrLoadCalls.push(opts.key);
    if (this.store.has(opts.key)) {
      return this.store.get(opts.key) as T;
    }
    const existing = this.inflight.get(opts.key) as Promise<T | null> | undefined;
    if (existing) return existing;
    const work = (async () => {
      try {
        const value = await opts.loader();
        this.store.set(opts.key, value);
        return value;
      } finally {
        this.inflight.delete(opts.key);
      }
    })();
    this.inflight.set(opts.key, work);
    return work;
  }
}

describe('GetLatestApyUseCase', () => {
  let cache: RecordingCache;

  beforeEach(() => {
    cache = new RecordingCache();
  });

  it('fetches both windows in parallel on cold cache (one repo call per window)', async () => {
    const repo = fakeRepo(async (w) => snapshot(w, w === '7d' ? 1200 : 1500));
    const uc = new GetLatestApyUseCase(repo, cache);

    const result = await uc.execute();

    expect(result.apy7d?.apyBps).toBe(1200);
    expect(result.apy30d?.apyBps).toBe(1500);
    expect(repo.findLatest).toHaveBeenCalledTimes(2);
    expect(cache.getOrLoadCalls).toEqual(['pool:apy:7d', 'pool:apy:30d']);
  });

  it('serves both windows from cache on warm path (no repo hit)', async () => {
    const repo = fakeRepo(async (w) => snapshot(w, 999));
    const uc = new GetLatestApyUseCase(repo, cache);

    await uc.execute();
    (repo.findLatest as ReturnType<typeof vi.fn>).mockClear();
    const second = await uc.execute();

    expect(second.apy7d?.apyBps).toBe(999);
    expect(second.apy30d?.apyBps).toBe(999);
    expect(repo.findLatest).not.toHaveBeenCalled();
  });

  it('caches a null result (negative caching) and avoids re-fetching', async () => {
    const repo = fakeRepo(async () => null);
    const uc = new GetLatestApyUseCase(repo, cache);

    const first = await uc.execute();
    const initialCalls = (repo.findLatest as ReturnType<typeof vi.fn>).mock.calls.length;
    const second = await uc.execute();

    expect(first).toEqual({ apy7d: null, apy30d: null });
    expect(second).toEqual({ apy7d: null, apy30d: null });
    expect((repo.findLatest as ReturnType<typeof vi.fn>).mock.calls.length).toBe(initialCalls);
  });

  it('dedupes concurrent calls to the same window (single-flight)', async () => {
    let resolve!: (s: PoolApySnapshot) => void;
    const pending = new Promise<PoolApySnapshot>((r) => {
      resolve = r;
    });
    const repo = fakeRepo(async (w) => (w === '7d' ? pending : snapshot('30d', 1500)));
    const uc = new GetLatestApyUseCase(repo, cache);

    const a = uc.execute();
    const b = uc.execute();
    await new Promise((r) => setTimeout(r, 5));
    resolve(snapshot('7d', 1200));
    const [r1, r2] = await Promise.all([a, b]);

    expect(r1.apy7d?.apyBps).toBe(1200);
    expect(r2.apy7d?.apyBps).toBe(1200);
    const sevenDayCalls = (repo.findLatest as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([w]) => w === '7d',
    );
    expect(sevenDayCalls.length).toBe(1);
  });

  it('falls through to the repository directly when bound to NoopCacheService', async () => {
    const repo = fakeRepo(async (w) => snapshot(w, w === '7d' ? 100 : 200));
    const uc = new GetLatestApyUseCase(repo, new NoopCacheService());

    const result = await uc.execute();

    expect(result.apy7d?.apyBps).toBe(100);
    expect(result.apy30d?.apyBps).toBe(200);
    expect(repo.findLatest).toHaveBeenCalledTimes(2);
  });
});
