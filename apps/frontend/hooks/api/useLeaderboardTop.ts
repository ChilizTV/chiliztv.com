'use client';

import { useQuery } from '@tanstack/react-query';
import { leaderboardApi, type LeaderboardTopDto } from '@/lib/api/endpoints/leaderboard';
import { queryKeys } from '@/lib/query/keys';

const STALE_MS = 30_000;

/** Top-N ladder + current prize pool snapshot — refetches every 30s. */
export function useLeaderboardTop(limit = 100) {
    return useQuery<LeaderboardTopDto>({
        queryKey: queryKeys.leaderboard.top(limit),
        queryFn: () => leaderboardApi.getTop(limit),
        staleTime: STALE_MS,
        refetchOnWindowFocus: false,
    });
}
