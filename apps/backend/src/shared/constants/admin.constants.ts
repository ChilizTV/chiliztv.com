/** Redis cache for per-request RBAC lookups — revocation effective <= TTL. */
export const ADMIN_ROLE_CACHE_TTL_SECONDS = 60;

export function adminRoleKey(walletAddress: string): string {
    return `admin:role:${walletAddress.toLowerCase()}`;
}
