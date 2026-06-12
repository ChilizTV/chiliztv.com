import type { Ban, BanStatus } from '../entities/Ban';

export interface IBanRepository {
    /**
     * Inserts the ban. The DB partial unique index guarantees a single
     * active ban per wallet — implementations surface a violation as a
     * ConflictError.
     */
    save(ban: Ban): Promise<Ban>;

    /**
     * Active AND not yet expired at `now` — enforcement is time-derived, so
     * the expiry filter lives here, not in a cron.
     */
    findActiveBan(walletAddress: string, now: Date): Promise<Ban | null>;

    /** Bans counting toward escalation: status active|expired only. */
    countEscalating(walletAddress: string): Promise<number>;

    /** Subset of `wallets` having an active, unexpired ban at `now` — one bulk query. */
    findActiveWallets(wallets: string[], now: Date): Promise<string[]>;

    findToExpire(now: Date, limit: number): Promise<Ban[]>;

    markExpired(banIds: string[], now: Date): Promise<void>;

    /** Dashboard counters — active unexpired bans at `now`, split on permanent. */
    countActive(now: Date): Promise<{ total: number; permanent: number }>;

    /** Admin listing — keyset on (starts_at DESC, id DESC). */
    listForAdmin(filter: AdminBanFilter): Promise<AdminBanPage>;
    /** Lifts an ACTIVE ban. Null when no active row matched (409). */
    liftByAdmin(banId: string, liftedByWallet: string, note: string, at: Date): Promise<Ban | null>;
}

export interface AdminBanFilter {
    status?: BanStatus;
    walletAddress?: string;
    cursor?: string | null;
    limit: number;
}

export interface AdminBanPage {
    bans: ReadonlyArray<Ban>;
    nextCursor: string | null;
}
