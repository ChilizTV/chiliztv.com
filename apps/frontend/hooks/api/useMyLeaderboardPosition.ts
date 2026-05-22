'use client';

import { useQuery } from '@tanstack/react-query';
import {
    leaderboardApi,
    type MyLeaderboardPositionDto,
} from '@/lib/api/endpoints/leaderboard';
import { queryKeys } from '@/lib/query/keys';

const STALE_MS = 30_000;

/** Rank + cumulative score for the connected wallet. */
export function useMyLeaderboardPosition(wallet: string | undefined) {
    return useQuery<MyLeaderboardPositionDto>({
        queryKey: wallet ? queryKeys.leaderboard.me(wallet) : ['leaderboard', 'me', 'none'],
        queryFn: () => leaderboardApi.getMyPosition(wallet as string),
        enabled: !!wallet,
        staleTime: STALE_MS,
        refetchOnWindowFocus: false,
    });
}
