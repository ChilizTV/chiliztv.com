/**
 * Read-only directory aggregates for the admin panel (lot 3).
 * Amounts are raw decimal strings as returned by the SQL functions —
 * USDC 6dp for bets, CHZ-denominated decimals for donations/subs.
 */

export interface PlayerAggregate {
    readonly wallet: string;
    readonly betCount: number;
    readonly totalStaked: string;
    readonly totalPayout: string;
    readonly wonCount: number;
    readonly lostCount: number;
    readonly pendingCount: number;
    readonly lastBetAt: Date | null;
}

export interface StreamerAggregate {
    readonly wallet: string;
    readonly donationCount: number;
    readonly donationTotal: string;
    readonly subCount: number;
    readonly subRevenue: string;
    readonly lastActivityAt: Date | null;
}

export interface MatchVolume {
    readonly contractAddress: string;
    readonly betCount: number;
    readonly totalStaked: string;
}

export interface AggregatePage<T> {
    readonly items: T[];
    readonly total: number;
}

export interface IAdminDirectoryRepository {
    listPlayers(limit: number, offset: number): Promise<AggregatePage<PlayerAggregate>>;
    getPlayer(wallet: string): Promise<PlayerAggregate | null>;
    listStreamers(limit: number, offset: number): Promise<AggregatePage<StreamerAggregate>>;
    /** Per-contract bet volume keyed by lowercase contract address. */
    matchVolumes(): Promise<ReadonlyMap<string, MatchVolume>>;
}
