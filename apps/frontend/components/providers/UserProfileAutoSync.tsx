'use client';

import { useAutoUpsertProfile } from '@/hooks/useAutoUpsertProfile';

/**
 * Side-effect-only component — mounts the `useAutoUpsertProfile` hook
 * inside the Dynamic Labs provider tree so any sign-in event pushes the
 * user's display name + avatar into the backend `users` cache. Renders
 * nothing.
 */
export function UserProfileAutoSync(): null {
    useAutoUpsertProfile();
    return null;
}
