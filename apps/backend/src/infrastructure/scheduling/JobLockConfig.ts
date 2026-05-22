/**
 * Per-job distributed-lock configuration. Centralised so the scheduler and
 * any future "force-run" CLI use the exact same key namespace — a drift here
 * would let two writers attack the same Supabase rows or send conflicting
 * on-chain tx at the same nonce.
 *
 * TTLs are chosen to bound the maximum runtime of each job. The cache layer
 * runs an automatic watchdog at TTL/3, so the actual lock survives jobs that
 * exceed their expected duration as long as they're still alive.
 */
export interface JobLockConfig {
  readonly key: string;
  readonly ttlSeconds: number;
}

const baseKey = (slug: string): string => `lock:job:${slug}`;

export const JobLocks = {
  syncMatches:          { key: baseKey('sync-matches'),          ttlSeconds: 120 } satisfies JobLockConfig,
  resolveMarkets:       { key: baseKey('resolve-markets'),       ttlSeconds: 600 } satisfies JobLockConfig,
  closeLiveMarkets:     { key: baseKey('close-live-markets'),    ttlSeconds: 300 } satisfies JobLockConfig,
  settlePredictions:    { key: baseKey('settle-predictions'),    ttlSeconds: 180 } satisfies JobLockConfig,
  refreshTokenPrices:   { key: baseKey('refresh-prices'),        ttlSeconds: 60  } satisfies JobLockConfig,
  cleanupStreams:       { key: baseKey('cleanup-streams'),       ttlSeconds: 300 } satisfies JobLockConfig,
  staleStreamCleanup:   { key: baseKey('stale-stream-cleanup'),  ttlSeconds: 300 } satisfies JobLockConfig,
  oldEndedStreams:      { key: baseKey('old-ended-streams'),     ttlSeconds: 300 } satisfies JobLockConfig,
  viewerReconcile:      { key: baseKey('viewer-reconcile'),      ttlSeconds: 300 } satisfies JobLockConfig,
  cloudflareReconcile:  { key: baseKey('cloudflare-reconcile'),  ttlSeconds: 300 } satisfies JobLockConfig,
} as const;

/** Per-indexer lock key. Watchdog renews automatically at TTL/3. */
export function indexerLockConfig(indexerName: string): JobLockConfig {
  const slug = indexerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return { key: `lock:indexer:${slug || 'unknown'}`, ttlSeconds: 60 };
}
