import type { AdminRole } from '../types';

/** Per-request RBAC lookup — cached, revocation effective within the TTL. */
export interface IAdminAccessService {
    getActiveRole(walletAddress: string): Promise<AdminRole | null>;
    /** Drops the cache entry — call on every grant/revoke. */
    invalidate(walletAddress: string): Promise<void>;
}
