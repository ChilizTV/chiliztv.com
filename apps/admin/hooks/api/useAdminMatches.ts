'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

export function useDeployMatchContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matchId: number) => directoryApi.deployContract(matchId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminMatches });
    },
  });
}

export function useCloseMatchMarkets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matchId: number) => directoryApi.closeMarkets(matchId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminMatches });
    },
  });
}
