import { UserProfile } from '../entities/UserProfile';

export interface IUserProfileRepository {
    /**
     * Lookup the cached profile for a wallet. Returns null on miss — the
     * caller (typically `ResolveUserProfileUseCase`) is responsible for
     * delegating to the multi-source fallback when needed.
     */
    findByWalletAddress(walletAddress: string): Promise<UserProfile | null>;

    /**
     * Batch lookup for list views (recent donations, activity feed).
     * Returns a `Map` keyed by lowercase address. Missing addresses are
     * simply absent from the map.
     */
    findManyByWalletAddresses(
        walletAddresses: ReadonlyArray<string>,
    ): Promise<ReadonlyMap<string, UserProfile>>;

    /**
     * Insert-or-update by `wallet_address`. The repo always normalises the
     * address to lowercase before writing. Concurrent upserts converge to
     * the latest `updatedAt`.
     */
    upsert(profile: UserProfile): Promise<void>;
}
