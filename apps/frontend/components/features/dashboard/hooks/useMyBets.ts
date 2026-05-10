'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { MyBetsResponse, BetFilter, BetStatus } from '../domain/bets';

interface FetchArgs {
    readonly user: string;
    readonly status?: BetStatus;
    readonly limit?: number;
    readonly offset?: number;
}

const FILTER_TO_STATUS: Partial<Record<BetFilter, BetStatus>> = {
    pending: 'PENDING',
    won:     'WON',
    lost:    'LOST',
    // claimable / refundable / all are derived client-side.
};

/** Hits `GET /bets` via the shared axios client (auto-injects the JWT). */
async function fetchUserBets({ user, status, limit = 50, offset = 0 }: FetchArgs): Promise<MyBetsResponse> {
    const params = new URLSearchParams({ user, limit: String(limit), offset: String(offset) });
    if (status) params.set('status', status);
    return apiClient.get<MyBetsResponse>(`/bets?${params.toString()}`);
}

export interface UseMyBetsOptions {
    readonly user: string | undefined;
    readonly filter?: BetFilter;
    readonly limit?: number;
    readonly offset?: number;
}

/**
 * On-chain bets feed. 30s polling, refetch on focus. Server-side filter for
 * `pending|won|lost`; `claimable|refundable|all` are filtered client-side
 * because they're derived from `claimedAt` / `refundedAt`.
 */
export function useMyBets(options: UseMyBetsOptions) {
    const { user, filter, limit, offset } = options;
    const status = filter ? FILTER_TO_STATUS[filter] : undefined;

    return useQuery<MyBetsResponse, Error>({
        queryKey: ['my-bets', user?.toLowerCase(), status ?? 'all', limit ?? 50, offset ?? 0],
        queryFn: () => fetchUserBets({ user: user as string, status, limit, offset }),
        enabled: !!user,
        staleTime: 15_000,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });
}

/** Refetch every cached `my-bets` query (used after a claim tx). */
export function useInvalidateMyBets(): () => void {
    const qc = useQueryClient();
    return () => {
        qc.invalidateQueries({ queryKey: ['my-bets'] });
    };
}

// `useStampLocalClaimed` was replaced by the persistent locally-claimed
// pub/sub store at `domain/locallyClaimedStore.ts` (consumed via
// `hooks/useLocallyClaimed.ts`). Mutating react-query's cache in place
// was unsafe: the next refetch would overwrite the optimistic stamp
// before the indexer had recorded the on-chain Payout/Refund event,
// re-showing the Claim button (which then reverted on a second click).
