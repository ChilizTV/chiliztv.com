'use client';

import { useQuery } from '@tanstack/react-query';

import { directoryApi, type PageQuery } from '@/lib/api/endpoints/directory';
import { queryKeys } from '@/lib/query/keys';

// staleTime mirrors the backend Redis TTL (60s).
export function usePlayers(query: PageQuery) {
  return useQuery({
    queryKey: queryKeys.players.list(query),
    queryFn: () => directoryApi.listPlayers(query),
    select: (res) => res.data,
    staleTime: 60_000,
  });
}

export function usePlayerDetail(wallet: string) {
  return useQuery({
    queryKey: queryKeys.players.detail(wallet),
    queryFn: () => directoryApi.getPlayer(wallet),
    select: (res) => res.data,
    staleTime: 30_000,
    enabled: wallet.length > 0,
  });
}
