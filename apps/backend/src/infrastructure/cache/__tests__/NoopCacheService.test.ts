import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { NoopCacheService } from '../NoopCacheService';

describe('NoopCacheService', () => {
  const cache = new NoopCacheService();

  it('get always reports miss', async () => {
    expect(await cache.get('any-key')).toEqual({ hit: false });
  });

  it('set / delete / mset / markFresh / clearInflight are no-ops', async () => {
    await cache.set('k', 1, 60);
    await cache.delete('k');
    await cache.mset([{ key: 'k', value: 1, ttl: 60 }]);
    await cache.markFresh('k', 2);
    cache.clearInflight('k');
    expect(await cache.deleteByPattern('k*')).toBe(0);
    expect((await cache.mget(['k'])).size).toBe(0);
    expect(await cache.incr('k', 60)).toBe(1);
  });

  it('getOrLoad calls the loader and returns its value', async () => {
    const loader = vi.fn().mockResolvedValue({ apy: 12.3 });
    const out = await cache.getOrLoad({ key: 'apy:7d', ttlSeconds: 300, loader });
    expect(out).toEqual({ apy: 12.3 });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('getOrLoad propagates null loader result without caching', async () => {
    const loader = vi.fn().mockResolvedValue(null);
    const out = await cache.getOrLoad({ key: 'missing', ttlSeconds: 60, loader });
    expect(out).toBeNull();
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
