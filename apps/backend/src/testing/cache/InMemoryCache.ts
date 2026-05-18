import type {
  CacheLoadOptions,
  CacheReadResult,
  ICacheService,
} from '@chiliztv/domain/shared/ports/ICacheService';

/**
 * Test-only ICacheService that exercises the same getOrLoad + single-flight
 * semantics as the Redis adapter without booting Redis. Records every
 * `delete` call so invalidation hooks can be asserted from tests.
 */
export class InMemoryCache implements ICacheService {
  private readonly store = new Map<string, unknown>();
  private readonly inflight = new Map<string, Promise<unknown>>();
  public readonly deletedKeys: string[] = [];

  async get<T>(key: string): Promise<CacheReadResult<T>> {
    return this.store.has(key) ? { hit: true, value: this.store.get(key) as T } : { hit: false };
  }
  async set<T>(key: string, value: T, _ttlSeconds: number): Promise<void> {
    this.store.set(key, value);
  }
  async delete(key: string): Promise<void> {
    this.deletedKeys.push(key);
    this.store.delete(key);
  }
  async deleteByPattern(pattern: string): Promise<number> {
    let n = 0;
    for (const key of [...this.store.keys()]) {
      if (matchesPattern(key, pattern)) {
        this.store.delete(key);
        this.deletedKeys.push(key);
        n++;
      }
    }
    return n;
  }
  async mget<T>(keys: readonly string[]): Promise<Map<string, T>> {
    const out = new Map<string, T>();
    for (const k of keys) if (this.store.has(k)) out.set(k, this.store.get(k) as T);
    return out;
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
    if (this.store.has(opts.key)) return this.store.get(opts.key) as T;
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

function matchesPattern(key: string, pattern: string): boolean {
  if (!pattern.includes('*')) return key === pattern;
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`).test(key);
}
