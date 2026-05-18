import { describe, it, expect } from 'vitest';
import { encodeForCache, decodeFromCache } from '../CacheCodec';

describe('CacheCodec', () => {
  it('round-trips primitives unchanged', () => {
    const value = { id: 1, name: 'PSG', score: 3.14, flag: true, none: null };
    expect(decodeFromCache(encodeForCache(value))).toEqual(value);
  });

  it('round-trips bigint losslessly', () => {
    const value = { ppsStart: 1_000_000n, ppsEnd: 9_007_199_254_740_993n };
    const decoded = decodeFromCache<typeof value>(encodeForCache(value));
    expect(decoded.ppsStart).toBe(1_000_000n);
    expect(decoded.ppsEnd).toBe(9_007_199_254_740_993n);
  });

  it('round-trips Date as a Date instance, not a string', () => {
    const value = { computedAt: new Date('2026-05-16T12:00:00.000Z') };
    const decoded = decodeFromCache<typeof value>(encodeForCache(value));
    expect(decoded.computedAt).toBeInstanceOf(Date);
    expect(decoded.computedAt.toISOString()).toBe('2026-05-16T12:00:00.000Z');
  });

  it('handles nested mixed types', () => {
    const value = {
      windowLabel: '7d' as const,
      apyBps: 1234,
      ppsStart: 42n,
      computedAt: new Date('2026-05-16T12:00:00.000Z'),
      meta: { tags: ['ok'], cursor: 99n },
    };
    const decoded = decodeFromCache<typeof value>(encodeForCache(value));
    expect(decoded.ppsStart).toBe(42n);
    expect(decoded.meta.cursor).toBe(99n);
    expect(decoded.computedAt.toISOString()).toBe('2026-05-16T12:00:00.000Z');
    expect(decoded.meta.tags).toEqual(['ok']);
  });

  it('does not misinterpret caller payloads that happen to use an __t field', () => {
    const value = { __t: 'some-app-tag', v: 'unrelated' };
    const encoded = encodeForCache(value);
    const decoded = decodeFromCache<typeof value>(encoded);
    expect(decoded).toEqual(value);
  });
});
