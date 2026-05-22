"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { marketsApi, type MarketPoolsDto } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/keys";
import { type FlatMatch } from "../domain";

/** Pre-bucketed match list + per-contract pool totals for the league headers. */
export interface MatchesByPoolStatus {
    readonly pooled: FlatMatch[];
    readonly empty: FlatMatch[];
    /** Live total-pool snapshot keyed by lowercased contract address. Sums
     *  every market on the contract (not just WINNER) so a match with bets
     *  on GOALS_TOTAL / BOTH_SCORE / etc. surfaces to the league header. */
    readonly poolByContract: ReadonlyMap<string, bigint>;
}

function sumAcrossMarkets(data: MarketPoolsDto | undefined): bigint {
    if (!data?.markets) return BigInt(0);
    let total = BigInt(0);
    for (const m of data.markets) {
        total += BigInt(m.totalPool);
    }
    return total;
}

const STALE_TIME_MS = 30_000;

/**
 * Batched pool-status partition for the discover surface. Issues a single
 * `useQueries` call across every visible match — React Query dedupes
 * against the per-card `useMarketPools` cache, so this adds no extra
 * network requests, just a synchronous fan-out for the parent to read.
 *
 * Loading semantics: while a match's query is in flight we treat it as
 * `pooled` to avoid a flash of "be the first" before the snapshot lands.
 * Matches without a `contractAddress` go straight to `empty`.
 */
export function useMatchesByPoolStatus(matches: FlatMatch[]): MatchesByPoolStatus {
    const queries = useQueries({
        queries: matches.map((m) => {
            const addr = m.contractAddress?.toLowerCase() ?? null;
            return {
                queryKey: addr
                    ? queryKeys.markets.pools(addr)
                    : (["markets", "pools", "none", m.id] as const),
                queryFn: (): Promise<MarketPoolsDto> => marketsApi.getPools(addr as string),
                enabled: !!addr,
                staleTime: STALE_TIME_MS,
                refetchOnWindowFocus: false,
            };
        }),
    });

    return useMemo<MatchesByPoolStatus>(() => {
        const pooled: FlatMatch[] = [];
        const empty: FlatMatch[] = [];
        const poolByContract = new Map<string, bigint>();

        matches.forEach((m, i) => {
            if (!m.contractAddress) {
                empty.push(m);
                return;
            }
            const q = queries[i];
            const totalAcrossMarkets = sumAcrossMarkets(q?.data);
            if (q?.data) {
                poolByContract.set(m.contractAddress.toLowerCase(), totalAcrossMarkets);
            }
            if (totalAcrossMarkets > BigInt(0)) {
                pooled.push(m);
                return;
            }
            if (q?.isLoading) {
                pooled.push(m);
            } else {
                empty.push(m);
            }
        });

        return { pooled, empty, poolByContract };
    }, [matches, queries]);
}
