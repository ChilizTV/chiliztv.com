"use client";

import { useMemo } from "react";
import type { BrowseMatchDto } from "@chiliztv/shared/dto/matches/BrowseMatchesDto";
import { useMarketPools } from "@/hooks/api";
import {
    pickWinnerSnapshot,
    sharesFromOddsRef,
    sharesFromSnapshot,
} from "../domain";

export type DistributionSource = "pool" | "oddsRef" | "empty";

/**
 * Read-model exposed to the donut card. `source` discriminates between
 * live pool data, the cosmetic sharp-book fallback, and the empty state
 * (both unavailable) — letting the JSX render the right caption without
 * recomputing the branching itself.
 */
export interface MatchPoolDistribution {
    readonly source: DistributionSource;
    readonly shares: readonly [number, number, number] | null;
    readonly favIdx: 0 | 1 | 2 | null;
    /** Raw USDC total — `BigInt(0)` when no pool yet. */
    readonly totalPool: bigint;
    readonly isLoading: boolean;
}

interface UseMatchPoolDistributionArgs {
    readonly contractAddress: string | null | undefined;
    readonly oddsRef: BrowseMatchDto["odds"];
}

/**
 * Composes `useMarketPools(contract)` with the cosmetic odds fallback so
 * the donut card stays purely presentational. `enabled` is gated on
 * `contractAddress` so matches without a deployed proxy never hit the RPC.
 *
 * Branch order:
 *   pool (totalPool > 0) → live shares
 *   pool empty / loading → sharp-book reference odds (italic caption)
 *   no contract + no odds → empty state ("Be first to stake")
 */
export function useMatchPoolDistribution(
    args: UseMatchPoolDistributionArgs,
): MatchPoolDistribution {
    const { contractAddress, oddsRef } = args;
    const query = useMarketPools(contractAddress ?? undefined);

    return useMemo<MatchPoolDistribution>(() => {
        const winner = pickWinnerSnapshot(query.data);
        const livePool = winner ? sharesFromSnapshot(winner) : null;
        if (livePool && winner) {
            return {
                source: "pool",
                shares: livePool.shares,
                favIdx: livePool.favIdx,
                totalPool: BigInt(winner.totalPool),
                isLoading: false,
            };
        }
        const refOdds = sharesFromOddsRef(oddsRef);
        if (refOdds) {
            return {
                source: "oddsRef",
                shares: refOdds.shares,
                favIdx: refOdds.favIdx,
                totalPool: BigInt(0),
                isLoading: query.isLoading,
            };
        }
        return {
            source: "empty",
            shares: null,
            favIdx: null,
            totalPool: BigInt(0),
            isLoading: query.isLoading,
        };
    }, [query.data, query.isLoading, oddsRef]);
}
