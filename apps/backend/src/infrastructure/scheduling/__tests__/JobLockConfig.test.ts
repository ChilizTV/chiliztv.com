import { describe, it, expect } from 'vitest';
import { JobLocks, indexerLockConfig } from '../JobLockConfig';

describe('JobLocks', () => {
  it('every job has a stable lock:job:* key and a positive TTL', () => {
    for (const [name, cfg] of Object.entries(JobLocks)) {
      expect(cfg.key, `${name} key`).toMatch(/^lock:job:[a-z][a-z0-9-]+$/);
      expect(cfg.ttlSeconds, `${name} ttl`).toBeGreaterThan(0);
    }
  });

  it('long-running jobs get larger TTLs than short ones (sanity check)', () => {
    expect(JobLocks.resolveMarkets.ttlSeconds).toBeGreaterThan(JobLocks.refreshTokenPrices.ttlSeconds);
    expect(JobLocks.backfillMarketLines.ttlSeconds).toBeGreaterThan(JobLocks.computeApy.ttlSeconds);
  });

  it('no two jobs share a lock key (collision would silently serialise unrelated work)', () => {
    const keys = Object.values(JobLocks).map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('indexerLockConfig', () => {
  it('slugifies camelCase indexer names to kebab-case', () => {
    expect(indexerLockConfig('LiquidityPool').key).toBe('lock:indexer:liquiditypool');
    expect(indexerLockConfig('Betting Match Event').key).toBe('lock:indexer:betting-match-event');
  });

  it('falls back to a stable token when the name is empty or symbols-only', () => {
    expect(indexerLockConfig('').key).toBe('lock:indexer:unknown');
    expect(indexerLockConfig('!!!').key).toBe('lock:indexer:unknown');
  });

  it('uses a short TTL (60s) — the watchdog renews automatically for long batches', () => {
    expect(indexerLockConfig('any').ttlSeconds).toBe(60);
  });
});
