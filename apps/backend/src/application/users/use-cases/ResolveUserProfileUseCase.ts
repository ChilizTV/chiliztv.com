import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { UserProfile } from '@chiliztv/domain/users/entities/UserProfile';
import { IUserProfileRepository } from '@chiliztv/domain/users/repositories/IUserProfileRepository';
import { MultiSourceUserDisplayFallback } from '../../../infrastructure/persistence/repositories/MultiSourceUserDisplayFallback';
import { logger } from '../../../infrastructure/logging/logger';

/**
 * Resolve a wallet → display profile.
 *
 *  1. Read `users` (primary cache, PK lookup ~ 1 ms).
 *  2. On miss → ask `MultiSourceUserDisplayFallback` (chat → predictions → streams).
 *  3. On fallback hit → self-warm `users` async so the next call is a cache hit.
 *  4. Always returns a profile (possibly with `username: null`) so callers
 *     can render `displayName(profile, walletAddress)` without null-checking.
 */
@injectable()
export class ResolveUserProfileUseCase {
    constructor(
        @inject(TOKENS.IUserProfileRepository)
        private readonly users: IUserProfileRepository,
        @inject(MultiSourceUserDisplayFallback)
        private readonly fallback: MultiSourceUserDisplayFallback,
    ) {}

    async execute(walletAddress: string): Promise<UserProfile> {
        const addr = walletAddress.toLowerCase();
        const cached = await this.users.findByWalletAddress(addr);
        if (cached?.username) return cached;

        const hit = await this.fallback.lookup(addr);
        const profile = UserProfile.create({
            walletAddress: addr,
            username: hit?.username ?? null,
            avatarUrl: cached?.avatarUrl ?? null,
            updatedAt: new Date(),
        });

        // Self-warm cache when fallback succeeded. Fire-and-forget so the
        // hot path stays a single read on subsequent hits without blocking
        // the caller on a write.
        if (hit) {
            void this.users
                .upsert(profile)
                .catch((err) =>
                    logger.warn('ResolveUserProfileUseCase: self-warm upsert failed', {
                        wallet: addr,
                        error: err instanceof Error ? err.message : String(err),
                    }),
                );
        }
        return profile;
    }
}
