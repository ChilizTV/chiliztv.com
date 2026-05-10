'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UpsertProfileBody, type UserProfileDto } from '@/lib/api/endpoints';

const STALE_MS = 5 * 60_000;

function normaliseWallet(w: string | undefined | null): string | null {
    if (!w) return null;
    return w.toLowerCase();
}

/**
 * Resolve a single wallet to its display profile.
 * `staleTime` is generous (5 min) because profiles change rarely; the
 * upsert mutation invalidates this same key on success so writes still
 * propagate immediately.
 */
export function useUserProfile(walletAddress: string | undefined | null) {
    const wallet = normaliseWallet(walletAddress);
    return useQuery({
        queryKey: ['user-profile', wallet],
        queryFn: async () => {
            const { profile } = await usersApi.getByWallet(wallet!);
            return profile;
        },
        enabled: !!wallet,
        staleTime: STALE_MS,
    });
}

/**
 * Batch resolve — feed it a list of wallets and get back a `Map<addr, profile>`.
 * Empty input short-circuits to an empty map without hitting the network.
 */
export function useUserProfilesBatch(walletAddresses: ReadonlyArray<string | undefined | null>) {
    const wallets = Array.from(
        new Set(walletAddresses.map((w) => normaliseWallet(w)).filter((w): w is string => !!w)),
    ).sort();

    return useQuery({
        queryKey: ['user-profiles-batch', wallets],
        queryFn: async (): Promise<ReadonlyMap<string, UserProfileDto>> => {
            if (wallets.length === 0) return new Map();
            const { profiles } = await usersApi.getByWallets(wallets);
            const map = new Map<string, UserProfileDto>();
            for (const [addr, profile] of Object.entries(profiles)) {
                map.set(addr, profile);
            }
            return map;
        },
        enabled: wallets.length > 0,
        staleTime: STALE_MS,
    });
}

/**
 * Upsert the connected user's profile from Dynamic Labs metadata. On
 * success we invalidate the single-profile cache for that wallet so any
 * mounted hook re-renders with the fresh username/avatar.
 */
export function useUpsertUserProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: UpsertProfileBody) => usersApi.upsertProfile(body),
        onSuccess: (resp) => {
            const wallet = resp.profile.walletAddress.toLowerCase();
            qc.invalidateQueries({ queryKey: ['user-profile', wallet] });
            qc.invalidateQueries({ queryKey: ['user-profiles-batch'] });
        },
    });
}
