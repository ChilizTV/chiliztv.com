/**
 * Cache-key conventions for the matches read surfaces. Kept in one module so
 * both readers (`Get*MatchesUseCase`) and the writer/invalidator
 * (`SyncMatchesUseCase`) share the exact same strings — a divergence here
 * would make invalidation silently ineffective.
 *
 * The env prefix (`staging:`, `production:`, etc.) is added by the cache
 * adapter; keys returned here are env-agnostic.
 */
export const MatchCacheKeys = {
  listAll: 'match:list:all',
  listBrowse: 'match:list:browse',
  listLive: 'match:list:live',
  listUpcoming: 'match:list:upcoming',
  statsSummary: 'match:stats:summary',
  league: (leagueId: number): string => `match:list:league:${leagueId}`,
  single: (apiFootballId: number): string => `match:single:${apiFootballId}`,
} as const;

/** TTLs in seconds. Aligned with SyncMatchesJob cadence (10 min) — see docs/plans/redis-integration.md §2.18. */
export const MatchCacheTtl = {
  listSeconds: 60,
  liveSeconds: 30,
  singleSeconds: 30,
  statsSeconds: 60,
  jitterPct: 10,
} as const;

/** List-shaped cache keys that are not parameterised — invalidated wholesale on any match upsert. */
export const FIXED_LIST_KEYS: readonly string[] = [
  MatchCacheKeys.listAll,
  MatchCacheKeys.listBrowse,
  MatchCacheKeys.listLive,
  MatchCacheKeys.listUpcoming,
  MatchCacheKeys.statsSummary,
];
