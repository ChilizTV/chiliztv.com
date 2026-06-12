'use client';

import { useQuery } from '@tanstack/react-query';

import { directoryApi, type PageQuery } from '@/lib/api/endpoints/directory';
import { queryKeys } from '@/lib/query/keys';

export function useStreamers(query: PageQuery) {
  return useQuery({
    queryKey: queryKeys.streamers.list(query),
    queryFn: () => directoryApi.listStreamers(query),
    select: (res) => res.data,
    staleTime: 60_000,
  });
}
