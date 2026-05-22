'use client';

import { useQuery } from '@tanstack/react-query';
import {
    leaderboardApi,
    type MyClaimableEpochsDto,
} from '@/lib/api/endpoints/leaderboard';
import { queryKeys } from '@/lib/query/keys';

const STALE_MS = 15_000;

/**
 * Confirmed, claim-window-still-open epochs in which the wallet has a leaf,
 * each with the merkle proof reconstructed server-side. Empty when there's
 * nothing to claim.
 */
export function useMyClaimableEpochs(wallet: string | undefined) {
    return useQuery<MyClaimableEpochsDto>({
        queryKey: wallet
            ? queryKeys.leaderboard.claimable(wallet)
            : ['leaderboard', 'me', 'none', 'claimable'],
        queryFn: () => leaderboardApi.getMyClaimable(wallet as string),
        enabled: !!wallet,
        staleTime: STALE_MS,
        refetchOnWindowFocus: false,
    });
}
