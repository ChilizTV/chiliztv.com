import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { UserProfile } from '@chiliztv/domain/users/entities/UserProfile';
import { IUserProfileRepository } from '@chiliztv/domain/users/repositories/IUserProfileRepository';
import { MultiSourceUserDisplayFallback } from '../../../infrastructure/persistence/repositories/MultiSourceUserDisplayFallback';
import { logger } from '../../../infrastructure/logging/logger';

const MAX_BATCH = 50;

/**
 * Batch sibling of `ResolveUserProfileUseCase` — used by list views
 * (recent donations, activity feed) to avoid an N+1 fetch.
 *
 * The primary table is queried in one shot; misses are then funnelled
 * through the fallback one wallet at a time (rare path on a warmed
 * cache). All hits are merged into the returned Map keyed by lowercase
 * address.
 */
@injectable()
export class ResolveUserProfilesBatchUseCase {
    constructor(
        @inject(TOKENS.IUserProfileRepository)
        private readonly users: IUserProfileRepository,
        @inject(MultiSourceUserDisplayFallback)
        private readonly fallback: MultiSourceUserDisplayFallback,
    ) {}

    async execute(
        walletAddresses: ReadonlyArray<string>,
    ): Promise<ReadonlyMap<string, UserProfile>> {
        const lowered = Array.from(new Set(walletAddresses.map((a) => a.toLowerCase())))
            .slice(0, MAX_BATCH);
        if (lowered.length === 0) return new Map();

        const cached = await this.users.findManyByWalletAddresses(lowered);
        const result = new Map<string, UserProfile>(cached);

        // Fallback for wallets the primary cache doesn't know yet.
        const misses = lowered.filter((a) => !cached.has(a) || !cached.get(a)?.username);
        for (const addr of misses) {
            const hit = await this.fallback.lookup(addr);
            const profile = UserProfile.create({
                walletAddress: addr,
                username: hit?.username ?? cached.get(addr)?.username ?? null,
                avatarUrl: cached.get(addr)?.avatarUrl ?? null,
                updatedAt: new Date(),
            });
            result.set(addr, profile);
            if (hit) {
                void this.users
                    .upsert(profile)
                    .catch((err) =>
                        logger.warn('ResolveUserProfilesBatchUseCase: self-warm upsert failed', {
                            wallet: addr,
                            error: err instanceof Error ? err.message : String(err),
                        }),
                    );
            }
        }
        return result;
    }
}
