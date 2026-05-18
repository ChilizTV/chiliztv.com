import { injectable } from 'tsyringe';
import type {
  CacheLoadOptions,
  CacheReadResult,
  ICacheService,
} from '@chiliztv/domain/shared/ports/ICacheService';

/**
 * Fallback when REDIS_URL is absent (dev local or staging not provisioned).
 * `getOrLoad` degrades to direct loader invocation, so callers behave as if
 * the cache were always missing. Multi-instance correctness is NOT preserved
 * in this mode — intended for single-process dev or a deliberate graceful
 * degradation.
 */
@injectable()
export class NoopCacheService implements ICacheService {
  async get<T>(_key: string): Promise<CacheReadResult<T>> {
    return { hit: false };
  }

  async set<T>(_key: string, _value: T, _ttlSeconds: number): Promise<void> {
    // intentionally no-op
  }

  async delete(_key: string): Promise<void> {
    // intentionally no-op
  }

  async deleteByPattern(_pattern: string): Promise<number> {
    return 0;
  }

  async mget<T>(_keys: readonly string[]): Promise<Map<string, T>> {
    return new Map();
  }

  async mset<T>(_entries: ReadonlyArray<{ key: string; value: T; ttl: number }>): Promise<void> {
    // intentionally no-op
  }

  async getOrLoad<T>(opts: CacheLoadOptions<T>): Promise<T | null> {
    return opts.loader();
  }

  async markFresh(_key: string, _freshnessSeconds: number): Promise<void> {
    // intentionally no-op
  }

  clearInflight(_key: string): void {
    // intentionally no-op
  }

  async incr(_key: string, _ttlSeconds: number): Promise<number> {
    return 1;
  }
}
