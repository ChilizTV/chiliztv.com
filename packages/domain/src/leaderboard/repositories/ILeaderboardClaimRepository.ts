import { LeaderboardClaim } from '../entities/LeaderboardClaim';

/**
 * One row per on-chain `PrizeClaimed(epochId, user, amount)` event. PK
 * `(epochId, userAddress)` matches the contract's `claimedAt[epoch][user]`
 * idempotency map.
 */
export interface ILeaderboardClaimRepository {
    insertIfAbsent(claim: LeaderboardClaim): Promise<boolean>;

    findByUser(userAddress: string): Promise<ReadonlyArray<LeaderboardClaim>>;

    hasClaimed(epochId: bigint, userAddress: string): Promise<boolean>;
}
