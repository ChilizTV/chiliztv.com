/**
 * Cache keys for the stream-wallet read surfaces. Per the plan §2.10 these
 * lists are paginated by offset, so the cache key includes the limit/offset
 * pair. The data is indexer-driven (write side is the StreamWalletIndexer
 * inserting events) — no explicit invalidation on writes, the TTL absorbs
 * the indexer lag.
 */
export const StreamWalletCacheKeys = {
  donationsByStreamer: (streamer: string, limit: number, offset: number): string =>
    `donations:streamer:${streamer.toLowerCase()}:l${limit}:o${offset}`,
  subscriptionsByStreamer: (streamer: string, limit: number, offset: number): string =>
    `subscriptions:streamer:${streamer.toLowerCase()}:l${limit}:o${offset}`,
  streamerStats: (streamer: string): string =>
    `stream-wallet:stats:${streamer.toLowerCase()}`,
} as const;

export const StreamWalletCacheTtl = {
  listSeconds: 120,
  statsSeconds: 120,
  jitterPct: 15,
} as const;
