import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { UserProfile, type UserProfileProps } from '@chiliztv/domain/users/entities/UserProfile';
import { IUserProfileRepository } from '@chiliztv/domain/users/repositories/IUserProfileRepository';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { MultiSourceUserDisplayFallback } from '../../../infrastructure/persistence/repositories/MultiSourceUserDisplayFallback';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { UserCacheKeys, UserCacheTtl } from '../UserCacheKeys';
import { logger } from '../../../infrastructure/logging/logger';

const MAX_BATCH = 50;

/**
 * Batch sibling of `ResolveUserProfileUseCase`. Strategy:
 *  1. MGET on Redis for every requested wallet (one pipelined round-trip).
 *  2. For wallets the cache doesn't know, fall back to the primary table
 *     and the multi-source resolver, exactly like the single-wallet path.
 *  3. MSET the freshly-resolved profiles back into Redis so subsequent
 *     batches hit the cache.
 *
 * Stays under MAX_BATCH (50) per call to keep the pipeline payload sane
 * and the Supabase batch query bounded.
 */
@injectable()
export class ResolveUserProfilesBatchUseCase {
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

    async execute(
        walletAddresses: ReadonlyArray<string>,
    ): Promise<ReadonlyMap<string, UserProfile>> {
        const lowered = Array.from(new Set(walletAddresses.map((a) => a.toLowerCase())))
            .slice(0, MAX_BATCH);
        if (lowered.length === 0) return new Map();

        const cacheKeys = lowered.map((a) => UserCacheKeys.profile(a));
        const cached = await this.cache.mget<UserProfileProps>(cacheKeys);

        const result = new Map<string, UserProfile>();
        const misses: string[] = [];
        for (const addr of lowered) {
            const props = cached.get(UserCacheKeys.profile(addr));
            if (props) {
                result.set(addr, UserProfile.create(props));
            } else {
                misses.push(addr);
            }
        }

        if (misses.length === 0) return result;

        const primary = await this.users.findManyByWalletAddresses(misses);
        const toCache: Array<{ key: string; value: UserProfileProps; ttl: number }> = [];
        for (const addr of misses) {
            const primaryHit = primary.get(addr);
            let profile: UserProfile;
            if (primaryHit?.username) {
                profile = primaryHit;
            } else {
                const hit = await this.fallback.lookup(addr);
                profile = UserProfile.create({
                    walletAddress: addr,
                    username: hit?.username ?? primaryHit?.username ?? null,
                    avatarUrl: primaryHit?.avatarUrl ?? null,
                    updatedAt: this.clock.now(),
                });
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
            result.set(addr, profile);
            toCache.push({
                key: UserCacheKeys.profile(addr),
                value: profile.toJSON(),
                ttl: UserCacheTtl.profileSeconds,
            });
        }
        if (toCache.length > 0) await this.cache.mset(toCache);
        return result;
    }
}
