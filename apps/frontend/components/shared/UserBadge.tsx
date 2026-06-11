'use client';

import Image from 'next/image';
import { useUserProfile } from '@/hooks/api';
import type { UserProfileDto } from '@/lib/api/endpoints/users';
import { displayInitials, displayName } from '@/lib/display/userDisplay';

/** Minimum profile surface the badge needs — full DTOs are accepted too. */
export type UserProfileLike = Pick<UserProfileDto, 'username' | 'avatarUrl'>;

interface UserBadgeProps {
    readonly walletAddress: string;
    /**
     * Optionally pre-resolved profile (saves a round-trip when the parent
     * already loaded a batch via `useUserProfilesBatch`).
     */
    readonly profile?: UserProfileLike | null;
    readonly size?: number;
    readonly className?: string;
    /** Render the avatar only (used by lists where the label is shown elsewhere). */
    readonly avatarOnly?: boolean;
}

/**
 * Single source of truth for rendering a user across the app:
 * avatar tile (image or initials) + readable display name.
 *
 * Resolves on-demand via `useUserProfile` when no `profile` prop is passed —
 * cached 5 minutes by react-query so list views with many badges stay
 * cheap. Falls back to `truncate(walletAddress)` when no profile exists.
 */
export function UserBadge({
    walletAddress,
    profile: preloaded,
    size = 32,
    className = '',
    avatarOnly = false,
}: UserBadgeProps) {
    const { data: fetched } = useUserProfile(preloaded ? undefined : walletAddress);
    const profile = preloaded ?? fetched ?? null;
    const name = displayName(profile, walletAddress);
    const initials = displayInitials(profile, walletAddress);

    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <Avatar
                profile={profile}
                initials={initials}
                size={size}
                seed={walletAddress}
            />
            {!avatarOnly && (
                <span
                    className="font-mono-ctv text-[12px] tabular-nums text-white/85"
                    title={walletAddress}
                >
                    {name}
                </span>
            )}
        </span>
    );
}

interface AvatarProps {
    profile: UserProfileLike | null;
    initials: string;
    size: number;
    seed: string;
}

/**
 * Image when `avatarUrl` is populated, else a deterministic-gradient tile
 * with initials. The gradient palette is keyed off the wallet hex so two
 * tiles with the same `??` never look identical.
 */
function Avatar({ profile, initials, size, seed }: AvatarProps) {
    if (profile?.avatarUrl) {
        return (
            <Image
                src={profile.avatarUrl}
                alt=""
                width={size}
                height={size}
                className="rounded-full object-cover"
                style={{ width: size, height: size }}
                // Avatar URLs can come from Supabase Storage with no Next.js
                // image-domain whitelist entry — `unoptimized` skips the
                // remote-image rewriter and avoids 400s while we're still
                // wiring `next.config` allowlist (out of scope for this PR).
                unoptimized
            />
        );
    }
    const [bg1, bg2] = paletteFor(seed);
    return (
        <span
            aria-hidden
            className="font-display inline-flex items-center justify-center rounded-full text-[11px] font-extrabold uppercase tracking-tight text-white"
            style={{
                width: size,
                height: size,
                fontSize: Math.max(10, Math.round(size * 0.4)),
                background: `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)`,
            }}
        >
            {initials}
        </span>
    );
}

const PALETTES: ReadonlyArray<readonly [string, string]> = [
    ['#E8001D', '#7B0010'],
    ['#0072CE', '#003D6E'],
    ['#F5C518', '#7A6109'],
    ['#2dd4a4', '#0d6f55'],
    ['#A855F7', '#4C1D95'],
    ['#FF6B9D', '#7E2147'],
    ['#FB923C', '#7C2D12'],
];

function paletteFor(seed: string): readonly [string, string] {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = (h * 16777619) >>> 0;
    }
    return PALETTES[h % PALETTES.length];
}
