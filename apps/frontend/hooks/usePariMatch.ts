'use client';

import { keccak256, toBytes, type Address } from 'viem';
import { useMemo } from 'react';
import {
  useFootballPariMatchReadMarketCount,
  useFootballPariMatchReadMatchName,
  useFootballPariMatchReadSportType,
  useFootballPariMatchReadFeeBps,
  useFootballPariMatchReadGetMarketSpec,
  useFootballPariMatchReadGetMarketCore,
  useFootballPariMatchReadGetOutcomePool,
  useFootballPariMatchReadGetTotalPool,
} from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';

// ─── Types mirroring on-chain structs ────────────────────────────────────────

/** PariMatchBase.MarketState enum order. */
export const MarketState = {
  Inactive: 0,
  Open: 1,
  Suspended: 2,
  Closed: 3,
  Resolved: 4,
  Cancelled: 5,
} as const;
export type MarketState = (typeof MarketState)[keyof typeof MarketState];

export const MARKET_STATE_LABEL: Record<number, string> = {
  0: 'Inactive',
  1: 'Open',
  2: 'Suspended',
  3: 'Closed',
  4: 'Resolved',
  5: 'Cancelled',
};

/** Mirror of struct MarketSpec (with line / extra / groupId / maxOutcome). */
export interface MarketSpec {
  marketType: `0x${string}`;
  line: number;
  maxOutcome: number;
  extra: number;
  groupId: number;
}

/** Mirror of struct MarketCore. Note: createdAt / resolvedAt are uint40 →
 *  wagmi returns these as plain numbers (fit within JS safe integer range). */
export interface MarketCore {
  state: MarketState;
  result: bigint;
  createdAt: number;
  resolvedAt: number;
  resolvedNetPool: bigint;
}

export interface OutcomePool {
  outcome: number;
  pool: bigint;
}

// ─── Market-type vocabulary ─────────────────────────────────────────────────

/** keccak256(name) → frontend-friendly slug. Mirrors the on-chain MARKET_*
 *  constants on FootballPariMatch + BasketballPariMatch. */
export const MARKET_TYPE_HASH_TO_KEY: Record<string, string> = {
  // Football
  [keccak256(toBytes('WINNER'))]: 'winner',
  [keccak256(toBytes('GOALS_TOTAL'))]: 'goals_total',
  [keccak256(toBytes('BOTH_SCORE'))]: 'both_score',
  [keccak256(toBytes('HALFTIME'))]: 'halftime',
  [keccak256(toBytes('CORRECT_SCORE'))]: 'correct_score',
  [keccak256(toBytes('FIRST_SCORER'))]: 'first_scorer',
  [keccak256(toBytes('GOALS_EXACT'))]: 'goals_exact',
  // Basketball
  [keccak256(toBytes('TOTAL_POINTS'))]: 'total_points',
  [keccak256(toBytes('SPREAD'))]: 'spread',
  [keccak256(toBytes('QUARTER_WINNER'))]: 'quarter_winner',
  [keccak256(toBytes('FIRST_TO_SCORE'))]: 'first_to_score',
  [keccak256(toBytes('HIGHEST_QUARTER'))]: 'highest_quarter',
  [keccak256(toBytes('POINTS_EXACT'))]: 'points_exact',
};

export function marketTypeKey(hash: `0x${string}`): string {
  return MARKET_TYPE_HASH_TO_KEY[hash.toLowerCase()] ?? 'unknown';
}

// ─── Top-level match metadata ───────────────────────────────────────────────

/**
 * Read-only metadata for a pari-mutuel match proxy.
 *
 * Uses FootballPariMatch* hooks but only reads functions that exist in the
 * shared `PariMatchBase` (`marketCount`, `matchName`, `sportType`, `feeBps`,
 * `getMarketSpec`, `getMarketCore`, `getOutcomePool`, `getTotalPool`), so the
 * same hook works for either sport without needing a separate Basketball hook.
 */
export function usePariMatch(matchAddress?: Address) {
  const enabled = !!matchAddress;
  // marketCount + state change after admin writes (addMarketWithLine,
  // openMarket, ...). Without a refetch interval, wagmi caches the first
  // value forever and the admin panel never reflects the new state.
  // 4s is a comfortable cadence on Chiliz Spicy (~3s block time).
  const queryOptions = { enabled, refetchInterval: 4_000 } as const;

  const { data: countRaw, refetch: refetchCount } = useFootballPariMatchReadMarketCount({
    address: matchAddress,
    chainId: chilizConfig.chainId,
    query: queryOptions,
  });
  const { data: nameRaw, refetch: refetchName } = useFootballPariMatchReadMatchName({
    address: matchAddress,
    chainId: chilizConfig.chainId,
    // Name is immutable post-initialize; no need to poll.
    query: { enabled },
  });
  const { data: sportRaw } = useFootballPariMatchReadSportType({
    address: matchAddress,
    chainId: chilizConfig.chainId,
    query: { enabled },
  });
  const { data: feeBpsRaw, refetch: refetchFee } = useFootballPariMatchReadFeeBps({
    address: matchAddress,
    chainId: chilizConfig.chainId,
    query: { enabled, refetchInterval: 10_000 },
  });

  const marketCount = countRaw !== undefined ? Number(countRaw) : 0;

  /** Imperative refresh — call after a write you know just confirmed so the
   *  UI doesn't have to wait up to one refetchInterval to pick up the change. */
  const refetch = () => {
    void refetchCount();
    void refetchName();
    void refetchFee();
  };

  return {
    matchAddress,
    matchName: (nameRaw as string | undefined) ?? '',
    sportType: (sportRaw as string | undefined) ?? '',
    feeBps: feeBpsRaw !== undefined ? Number(feeBpsRaw) : 200,
    marketCount,
    refetch,
  };
}

// ─── Per-market reads ───────────────────────────────────────────────────────

export function usePariMarketSpec(
  matchAddress: Address | undefined,
  marketId: number | bigint | undefined,
) {
  const enabled = !!matchAddress && marketId !== undefined;
  // Spec is immutable after market creation — the rare exception (cancel
  // reason text in events) doesn't change the spec itself. Read once and
  // keep wagmi's default cache; no interval needed.
  const { data, isLoading } = useFootballPariMatchReadGetMarketSpec({
    address: matchAddress,
    args: marketId !== undefined ? [BigInt(marketId)] : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled },
  });

  const spec: MarketSpec | undefined = useMemo(() => {
    if (!data) return undefined;
    const d = data as { marketType: `0x${string}`; line: number; maxOutcome: number; extra: number; groupId: number };
    return {
      marketType: d.marketType,
      line: Number(d.line),
      maxOutcome: Number(d.maxOutcome),
      extra: Number(d.extra),
      groupId: Number(d.groupId),
    };
  }, [data]);

  return { spec, isLoading };
}

export function usePariMarketCore(
  matchAddress: Address | undefined,
  marketId: number | bigint | undefined,
) {
  const enabled = !!matchAddress && marketId !== undefined;
  // Core holds the market's MarketState, which changes whenever the admin
  // opens / suspends / closes / cancels / resolves the market. Poll so the
  // admin UI and the live page reflect those transitions without a manual
  // refresh.
  const { data, isLoading, refetch } = useFootballPariMatchReadGetMarketCore({
    address: matchAddress,
    args: marketId !== undefined ? [BigInt(marketId)] : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled, refetchInterval: 4_000 },
  });

  const core: MarketCore | undefined = useMemo(() => {
    if (!data) return undefined;
    const d = data as {
      state: number;
      result: bigint;
      createdAt: number | bigint;
      resolvedAt: number | bigint;
      resolvedNetPool: bigint;
    };
    return {
      state: d.state as MarketState,
      result: BigInt(d.result),
      createdAt: Number(d.createdAt),
      resolvedAt: Number(d.resolvedAt),
      resolvedNetPool: BigInt(d.resolvedNetPool),
    };
  }, [data]);

  return { core, isLoading, refetch };
}

export function usePariMarketTotalPool(
  matchAddress: Address | undefined,
  marketId: number | bigint | undefined,
) {
  const enabled = !!matchAddress && marketId !== undefined;
  const { data, refetch } = useFootballPariMatchReadGetTotalPool({
    address: matchAddress,
    args: marketId !== undefined ? [BigInt(marketId)] : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled, refetchInterval: 5_000 },
  });
  return { totalPool: (data as bigint | undefined) ?? 0n, refetch };
}

export function usePariMarketOutcomePool(
  matchAddress: Address | undefined,
  marketId: number | bigint | undefined,
  outcome: number | undefined,
) {
  const enabled =
    !!matchAddress && marketId !== undefined && outcome !== undefined;
  const { data, refetch } = useFootballPariMatchReadGetOutcomePool({
    address: matchAddress,
    args:
      marketId !== undefined && outcome !== undefined
        ? [BigInt(marketId), BigInt(outcome)]
        : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled, refetchInterval: 5_000 },
  });
  return { outcomePool: (data as bigint | undefined) ?? 0n, refetch };
}
