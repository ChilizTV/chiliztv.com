/**
 * Distributed cache port. Production binds to `RedisCacheService`; environments
 * without `REDIS_URL` bind to `NoopCacheService` (pass-through). The domain and
 * application layers MUST go through this port — never import `ioredis` directly.
 *
 * Reads use a discriminated union to disambiguate "key absent" from "cached
 * null/undefined value" without nullable optionals.
 */
export type CacheReadResult<T> =
  | { hit: true; value: T }
  | { hit: false };

export interface CacheLoadOptions<T> {
  key: string;
  ttlSeconds: number;
  /** Random TTL jitter percentage (default 15) — prevents thundering herd on simultaneous expiry. */
  jitterPct?: number;
  /** Shorter TTL applied when the loader returns null (negative caching). Defaults to `ttlSeconds`. */
  negativeTtlSeconds?: number;
  loader: () => Promise<T | null>;
  /** When true and a freshness marker is set for `key`, bypass cache and call loader directly. */
  bypassIfFreshnessMarker?: boolean;
}

export interface ICacheService {
  get<T>(key: string): Promise<CacheReadResult<T>>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
  /** SCAN + UNLINK over keys matching the pattern. Returns the number of keys deleted. */
  deleteByPattern(pattern: string): Promise<number>;
  mget<T>(keys: readonly string[]): Promise<Map<string, T>>;
  mset<T>(entries: ReadonlyArray<{ key: string; value: T; ttl: number }>): Promise<void>;
  /** Cache-aside + single-flight + jitter + negative caching, all in one. */
  getOrLoad<T>(opts: CacheLoadOptions<T>): Promise<T | null>;
  /** Mark a key freshly written so readers bypass cache for the next `freshnessSeconds`. */
  markFresh(key: string, freshnessSeconds: number): Promise<void>;
  /** Drop the in-process single-flight slot for `key`. Called by `markFresh` and pub/sub. */
  clearInflight(key: string): void;
  /** Atomic counter with TTL set on first INCR (used by rate-limit fallback paths). */
  incr(key: string, ttlSeconds: number): Promise<number>;
}
