'use client';

import { useEffect } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { supabase } from '@/lib/supabase';
import type { BetFilter, MyBetsResponse } from '../domain/bets';

interface FetchArgs {
    readonly user: string;
    readonly filter?: BetFilter;
    readonly limit?: number;
    readonly offset?: number;
}

async function fetchUserBets({ user, filter, limit = 5, offset = 0 }: FetchArgs): Promise<MyBetsResponse> {
    const params = new URLSearchParams({ user, limit: String(limit), offset: String(offset) });
    if (filter && filter !== 'all') params.set('filter', filter);
    return apiClient.get<MyBetsResponse>(`/bets?${params.toString()}`);
}

export interface UseMyBetsOptions {
    readonly user: string | undefined;
    readonly filter?: BetFilter;
    /** Default page size = 5 — matches the dashboard pagination default. */
    readonly limit?: number;
    readonly offset?: number;
}

const SAFETY_REFETCH_MS = 5 * 60_000;

/**
 * Realtime-driven bets feed. The Supabase subscription below invalidates the
 * query on every insert/update for the user; the 5-min refetch is a safety
 * net for missed events (publication lag, transient disconnect).
 */
export function useMyBets(options: UseMyBetsOptions) {
    const { user, filter, limit, offset } = options;
    const qc = useQueryClient();
    const userLower = user?.toLowerCase();

    useEffect(() => {
        if (!userLower) return;
        // Unique per mount: supabase-js v2 reuses channels by topic, so
        // StrictMode's double-mount would return the previous (already
        // subscribed) channel and `.on()` would throw.
        const topic = `bets_user_${userLower}_${Math.random().toString(36).slice(2, 10)}`;
        const channel = supabase
            .channel(topic)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'bets', filter: `user_address=eq.${userLower}` },
                () => qc.invalidateQueries({ queryKey: ['my-bets', userLower] }),
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'bets', filter: `user_address=eq.${userLower}` },
                () => qc.invalidateQueries({ queryKey: ['my-bets', userLower] }),
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [userLower, qc]);

    return useQuery<MyBetsResponse, Error>({
        queryKey: ['my-bets', userLower, filter ?? 'all', limit ?? 5, offset ?? 0],
        queryFn: () => fetchUserBets({ user: user as string, filter, limit, offset }),
        enabled: !!user,
        staleTime: 15_000,
        refetchInterval: SAFETY_REFETCH_MS,
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData,
    });
}

/** Refetch every cached `my-bets` query (used after a claim tx). */
export function useInvalidateMyBets(): () => void {
    const qc = useQueryClient();
    return () => {
        qc.invalidateQueries({ queryKey: ['my-bets'] });
    };
}
