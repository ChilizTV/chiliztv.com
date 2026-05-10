'use client';

import { useEffect, useRef } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUpsertUserProfile } from '@/hooks/api';

interface DynamicMetadata {
    profilePicture?: string | null;
}

interface DynamicUserShape {
    username?: string | null;
    metadata?: DynamicMetadata | null;
}

/**
 * Side-effect hook — mount once at the app root. Whenever Dynamic Labs
 * reports an authenticated user with a wallet, we push their `username`
 * + `profilePicture` into the backend `users` cache. This is what powers
 * every server-side `wallet → username` resolution (chat events,
 * dashboard list views, etc.) for users who *do* authenticate via
 * Dynamic. Wallets that never auth fall through to the multi-source
 * fallback.
 *
 * The mutation is debounced via a ref: we only re-push when the
 * `(wallet, username, avatarUrl)` triple actually changes, so a re-render
 * cascade doesn't generate write traffic.
 */
export function useAutoUpsertProfile(): void {
    const { primaryWallet, user } = useDynamicContext() as {
        primaryWallet?: { address?: string };
        user?: DynamicUserShape;
    };
    const upsert = useUpsertUserProfile();
    const lastSyncedRef = useRef<string | null>(null);

    useEffect(() => {
        const wallet = primaryWallet?.address?.toLowerCase();
        if (!wallet) return;

        const username = sanitiseUsername(user?.username ?? null);
        const avatarUrl = user?.metadata?.profilePicture ?? null;
        const fingerprint = `${wallet}|${username ?? ''}|${avatarUrl ?? ''}`;
        if (lastSyncedRef.current === fingerprint) return;

        // Skip the write when Dynamic has no useful display data — keeps
        // the row free of placeholders so the multi-source fallback can
        // still find a name from chat/predictions/streams later.
        if (username === null && avatarUrl === null) return;

        lastSyncedRef.current = fingerprint;
        upsert.mutate({ username, avatarUrl });
        // We intentionally don't depend on `upsert` itself to avoid re-running
        // on every re-render of the upstream `useMutation` instance.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primaryWallet?.address, user?.username, user?.metadata?.profilePicture]);
}

function sanitiseUsername(raw: string | null): string | null {
    if (raw == null) return null;
    const trimmed = raw.trim();
    if (trimmed.length === 0) return null;
    // Dynamic Labs sometimes echoes the wallet as username when none is
    // set — filter that out so we don't poison the `users` cache.
    if (/^0x[0-9a-f]{40}$/i.test(trimmed)) return null;
    if (/^0x[0-9a-f]{6}…[0-9a-f]{4}$/i.test(trimmed)) return null;
    return trimmed;
}
