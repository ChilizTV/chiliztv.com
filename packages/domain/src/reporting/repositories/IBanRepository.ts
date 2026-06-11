import type { Ban } from '../entities/Ban';

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
}
