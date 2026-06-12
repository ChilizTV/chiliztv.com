'use client';

import { useQuery } from '@tanstack/react-query';

import { overviewApi } from '@/lib/api/endpoints/overview';
import { queryKeys } from '@/lib/query/keys';

// staleTime mirrors the backend Redis TTL (30s); refetch keeps the live
// chip and nav badge fresh during a match-day session.
export function useOverview() {
  return useQuery({
    queryKey: queryKeys.overview,
    queryFn: () => overviewApi.get(),
    select: (res) => res.data,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
