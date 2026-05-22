'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { marketsApi, type MarketPoolsDto } from '@/lib/api/endpoints/markets';
import { queryKeys } from '@/lib/query/keys';
import { supabase } from '@/lib/supabase';

const STALE_TIME_MS = 30_000;

/**
 * Per-PariMatch outcome pool snapshot, sourced from the backend multicall
 * endpoint (Redis-cached ~5s). Realtime invalidation:
 *  - `bets` INSERT (new PositionTaken) → invalidate pools (new outcome ratio)
 *  - `market_events` INSERT (MarketResolved/Cancelled/StateChanged) → invalidate
 *    pools (the state field changes; the front decides bet vs claim UI from it)
 *
 * Falls back to a 30s stale window if Realtime is unavailable (e.g. test
 * harness).
 */
export function useMarketPools(contractAddress: string | undefined): UseQueryResult<MarketPoolsDto> {
    const qc = useQueryClient();
    const addr = contractAddress?.toLowerCase();

    useEffect(() => {
        if (!addr) return;
        // Unique channel per mount: supabase-js v2 reuses channels by topic,
        // so StrictMode's double-mount would otherwise return the previous
        // (already-subscribed) channel and `.on()` would throw.
        const topic = `market_pools_${addr}_${Math.random().toString(36).slice(2, 10)}`;
        const channel = supabase
            .channel(topic)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'bets', filter: `contract_address=eq.${addr}` },
                () => qc.invalidateQueries({ queryKey: queryKeys.markets.pools(addr) }),
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'market_events', filter: `contract_address=eq.${addr}` },
                () => qc.invalidateQueries({ queryKey: queryKeys.markets.pools(addr) }),
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [addr, qc]);

    return useQuery<MarketPoolsDto, Error>({
        queryKey: addr ? queryKeys.markets.pools(addr) : ['markets', 'pools', 'none'],
        queryFn: () => marketsApi.getPools(addr as string),
        enabled: !!addr,
        staleTime: STALE_TIME_MS,
        refetchOnWindowFocus: false,
    });
}
