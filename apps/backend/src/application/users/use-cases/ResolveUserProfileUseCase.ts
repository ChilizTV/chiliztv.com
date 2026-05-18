import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { UserProfile, type UserProfileProps } from '@chiliztv/domain/users/entities/UserProfile';
import { IUserProfileRepository } from '@chiliztv/domain/users/repositories/IUserProfileRepository';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { MultiSourceUserDisplayFallback } from '../../../infrastructure/persistence/repositories/MultiSourceUserDisplayFallback';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { UserCacheKeys, UserCacheTtl } from '../UserCacheKeys';
import { logger } from '../../../infrastructure/logging/logger';

/**
 * Resolve a wallet → display profile.
 *
 *  1. Read from Redis cache (per-wallet key, ~1 ms).
 *  2. On miss → read `users` table (primary cache, PK lookup ~ 1 ms).
 *  3. On secondary miss → ask `MultiSourceUserDisplayFallback`
 *     (chat → predictions → streams).
 *  4. On fallback hit → self-warm `users` async.
 *  5. Cache the resulting profile (incl. `username: null`) for 300 s.
 *     A subsequent `UpsertUserProfileUseCase` DELs the key, so a wallet
 *     that signs up after being looked up appears immediately on next read.
 */
@injectable()
export class ResolveUserProfileUseCase {
    constructor(
        @inject(TOKENS.IUserProfileRepository)
        private readonly users: IUserProfileRepository,
        @inject(MultiSourceUserDisplayFallback)
        private readonly fallback: MultiSourceUserDisplayFallback,
        @inject(TOKENS.IClock)
        private readonly clock: IClock,
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
    ) {}

    async execute(walletAddress: string): Promise<UserProfile> {
        const addr = walletAddress.toLowerCase();
        const props = await this.cache.getOrLoad<UserProfileProps>({
            key: UserCacheKeys.profile(addr),
            ttlSeconds: UserCacheTtl.profileSeconds,
            jitterPct: UserCacheTtl.jitterPct,
            // Honor the freshness marker set by UpsertUserProfileUseCase so
            // post-signup reads always go to the primary, even if a Supabase
            // read replica hasn't caught up yet.
            bypassIfFreshnessMarker: true,
            loader: () => this.loadFresh(addr),
        });
        if (!props) {
            // loader can't return null because we always synthesise a profile;
            // keep the guard for the strict-null path so callers can rely on
            // the `Promise<UserProfile>` contract.
            return this.synthesiseEmpty(addr);
        }
        return UserProfile.create(props);
    }

    private async loadFresh(addr: string): Promise<UserProfileProps> {
        const cached = await this.users.findByWalletAddress(addr);
        if (cached?.username) return cached.toJSON();

        const hit = await this.fallback.lookup(addr);
        const profile = UserProfile.create({
            walletAddress: addr,
            username: hit?.username ?? null,
            avatarUrl: cached?.avatarUrl ?? null,
            updatedAt: this.clock.now(),
        });

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
        return profile.toJSON();
    }

    private synthesiseEmpty(addr: string): UserProfile {
        return UserProfile.create({
            walletAddress: addr,
            username: null,
            avatarUrl: null,
            updatedAt: this.clock.now(),
        });
    }
}
