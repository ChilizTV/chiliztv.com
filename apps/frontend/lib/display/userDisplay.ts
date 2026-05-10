import type { UserProfileDto } from '@/lib/api/endpoints/users';

/**
 * Display name shown anywhere a wallet would otherwise be truncated.
 * Prefers the resolved username; falls back to the canonical
 * `0x1234…abcd` shape when no profile is available.
 */
export function displayName(
    profile: UserProfileDto | null | undefined,
    walletAddress: string | null | undefined,
): string {
    if (profile?.username) return profile.username;
    if (!walletAddress) return '—';
    if (walletAddress.length < 11) return walletAddress;
    return `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
}

/**
 * 1-2 char initial used as the avatar fallback when no image is
 * available. Derived from the username when possible (so `maxime` →
 * `MA`), otherwise the wallet hex prefix (`0x` stripped).
 */
export function displayInitials(
    profile: UserProfileDto | null | undefined,
    walletAddress: string | null | undefined,
): string {
    const source = profile?.username ?? walletAddress ?? '';
    const cleaned = source.startsWith('0x') ? source.slice(2) : source;
    if (cleaned.length === 0) return '??';
    return cleaned.slice(0, 2).toUpperCase();
}

/** True when the row should be considered "anonymous" (no resolved name). */
export function isAnonymous(profile: UserProfileDto | null | undefined): boolean {
    return !profile?.username;
}
