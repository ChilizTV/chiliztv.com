/**
 * Cache keys for the per-PariMatch outcome pool snapshots. Lifted out of
 * MatchCacheKeys.ts so the invalidation flow (PariMatchEventIndexer) and
 * the reader (GetMarketPoolsUseCase) share the same string.
 *
 * TTL kept short on purpose — pool ratios drive payout previews in the bet
 * dialog and must stay fresh. The Realtime push on `bets` invalidates on
 * every PositionTaken; the TTL is a fallback for environments without
 * Realtime (e.g. the Vitest harness).
 */
export const MarketPoolsCacheKeys = {
    forAddress: (contractAddress: string): string =>
        `market:pools:${contractAddress.toLowerCase()}`,
} as const;

export const MarketPoolsCacheTtl = {
    seconds: 5,
    jitterPct: 10,
} as const;
