"use client";

import { useMemo } from "react";
import type { BrowseMatchDto } from "@chiliztv/shared/dto/matches/BrowseMatchesDto";
import { useMarketPools } from "@/hooks/api";
import { getMarketSpec } from "@/lib/contracts/markets";
import {
    pickRichestMarketSnapshot,
    sharesFromOddsRef,
    sharesFromSnapshot,
} from "../domain";

export type DistributionSource = "pool" | "oddsRef" | "empty";

/**
 * Read-model exposed to the donut card. `source` discriminates between
 * live pool data, the cosmetic sharp-book fallback, and the empty state.
 * `marketKey` + `marketLabel` + `outcomeLabels` describe which market the
 * donut is currently showing — the picker promotes the WINNER (1X2) when it
 * has liquidity, otherwise falls back to the first non-empty market on the
 * contract (e.g. Total Goals 2.5 or BTTS) so a bet on any market still
 * surfaces on the discover card.
 */
export interface MatchPoolDistribution {
    readonly source: DistributionSource;
    readonly shares: readonly number[] | null;
    readonly favIdx: number | null;
    /** Raw USDC total of the selected market — `BigInt(0)` when no pool yet. */
    readonly totalPool: bigint;
    readonly isLoading: boolean;
    /** Stable spec key — `'winner' | 'goalstotal' | 'bothscore' | …`. */
    readonly marketKey: string;
    /** Human-readable market title — `'Match Result'`, `'Total Goals 2.5'`, … */
    readonly marketLabel: string;
    /** Per-segment labels aligned with `shares`. Defaults to home/draw/away. */
    readonly outcomeLabels: readonly string[];
}

interface UseMatchPoolDistributionArgs {
    readonly contractAddress: string | null | undefined;
    readonly oddsRef: BrowseMatchDto["odds"];
    readonly homeTeam?: string;
    readonly awayTeam?: string;
}

const WINNER_FALLBACK_LABELS = ["Home", "Draw", "Away"] as const;

function specOutcomes(
    marketTypeHash: string | undefined,
    line: number,
    homeTeam?: string,
    awayTeam?: string,
): { key: string; label: string; outcomeLabels: string[] } | null {
    const spec = getMarketSpec(marketTypeHash);
    if (!spec) return null;
    const outcomes = spec.getOutcomes(line, homeTeam, awayTeam);
    return {
        key: spec.key,
        label: spec.hasLine ? `${spec.label} ${(line / 10).toFixed(1)}` : spec.label,
        outcomeLabels: outcomes.map((o) => o.label),
    };
}

export function useMatchPoolDistribution(
    args: UseMatchPoolDistributionArgs,
): MatchPoolDistribution {
    const { contractAddress, oddsRef, homeTeam, awayTeam } = args;
    const query = useMarketPools(contractAddress ?? undefined);

    return useMemo<MatchPoolDistribution>(() => {
        const snapshot = pickRichestMarketSnapshot(query.data);
        const live = snapshot ? sharesFromSnapshot(snapshot) : null;
        if (snapshot && live) {
            const meta = specOutcomes(snapshot.marketType, snapshot.line, homeTeam, awayTeam);
            return {
                source: "pool",
                shares: live.shares,
                favIdx: live.favIdx,
                totalPool: BigInt(snapshot.totalPool),
                isLoading: false,
                marketKey: meta?.key ?? "winner",
                marketLabel: meta?.label ?? "Match Result",
                outcomeLabels: meta?.outcomeLabels ?? Array.from(WINNER_FALLBACK_LABELS),
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
                marketKey: "winner",
                marketLabel: "Match Result",
                outcomeLabels: Array.from(WINNER_FALLBACK_LABELS),
            };
        }
        return {
            source: "empty",
            shares: null,
            favIdx: null,
            totalPool: BigInt(0),
            isLoading: query.isLoading,
            marketKey: "winner",
            marketLabel: "Match Result",
            outcomeLabels: Array.from(WINNER_FALLBACK_LABELS),
        };
    }, [query.data, query.isLoading, oddsRef, homeTeam, awayTeam]);
}
