/** One `PrizeClaimed` event materialised in the DB. */
export interface LeaderboardClaim {
    readonly epochId: bigint;
    readonly userAddress: string;
    readonly amount: bigint;
    readonly claimedAt: Date;
    readonly txHash: string;
}
