'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moderationApi, type BanStatus } from '@/lib/api/endpoints/moderation';
import { queryKeys } from '@/lib/query/keys';

export function useBans(filter: { status?: BanStatus; wallet?: string; cursor?: string | null }) {
  return useQuery({
    queryKey: queryKeys.bans.list(filter),
    queryFn: () => moderationApi.listBans(filter),
    select: (res) => res.data,
    staleTime: 15_000,
  });
}

export function useCreateBan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      walletAddress,
      reason,
      durationHours,
    }: {
      walletAddress: string;
      reason: string;
      durationHours?: number | null;
    }) => moderationApi.createBan(walletAddress, reason, durationHours),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.bans.all });
    },
  });
}

export function useLiftBan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ banId, note }: { banId: string; note: string }) => moderationApi.liftBan(banId, note),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.bans.all });
    },
  });
}
