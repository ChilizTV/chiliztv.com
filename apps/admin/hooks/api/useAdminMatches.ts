'use client';

import { useQuery } from '@tanstack/react-query';

import { directoryApi } from '@/lib/api/endpoints/directory';
import { queryKeys } from '@/lib/query/keys';

export function useAdminMatches() {
  return useQuery({
    queryKey: queryKeys.adminMatches,
    queryFn: () => directoryApi.listMatches(),
    select: (res) => res.data.items,
    staleTime: 60_000,
  });
}
