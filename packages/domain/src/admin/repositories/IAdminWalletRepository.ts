import type { AdminRole } from '../types';

export interface AdminGrant {
    readonly walletAddress: string;
    readonly role: AdminRole;
    readonly grantedByWallet: string;
    readonly note?: string;
}

export interface IAdminWalletRepository {
    /** Role of the single active grant for this wallet — null when none. */
    findActiveRole(walletAddress: string): Promise<AdminRole | null>;
    /** Inserts a new active grant. Throws on conflict with an existing active grant. */
    grant(input: AdminGrant): Promise<void>;
    /** Revokes the active grant. Returns false when no active grant existed. */
    revoke(walletAddress: string, revokedByWallet: string, note?: string): Promise<boolean>;
}
