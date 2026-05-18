import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IPoolApyRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IPoolApyRepository';
import { ApyWindow, PoolApySnapshot } from '@chiliztv/domain/blockchain-indexing/entities/PoolApySnapshot';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';

/**
 * Read-side use case: returns the most recent APY snapshot for each
 * supported window. The HTTP route ships these to the front, where they are
 * rendered on the PoolPanel.
 *
 * Cache strategy: per-window cache-aside, TTL 300s with ±10% jitter. The
 * `ComputeApyJob` runs every 15 min — a 300s TTL keeps three job cycles of
 * slack before a miss surfaces. Negative TTL 30s absorbs the cold-start
 * window before the first snapshot lands.
 */
@injectable()
export class GetLatestApyUseCase {
    private static readonly CACHE_TTL_SECONDS = 300;
    private static readonly NEGATIVE_TTL_SECONDS = 30;
    private static readonly JITTER_PCT = 10;

    constructor(
        @inject(TOKENS.IPoolApyRepository)
        private readonly apyRepo: IPoolApyRepository,
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
    ) {}

    async execute(): Promise<{ apy7d: PoolApySnapshot | null; apy30d: PoolApySnapshot | null }> {
        const [apy7d, apy30d] = await Promise.all([
            this.loadWindow('7d'),
            this.loadWindow('30d'),
        ]);
        return { apy7d, apy30d };
    }

    private loadWindow(window: ApyWindow): Promise<PoolApySnapshot | null> {
        return this.cache.getOrLoad<PoolApySnapshot>({
            key: `pool:apy:${window}`,
            ttlSeconds: GetLatestApyUseCase.CACHE_TTL_SECONDS,
            negativeTtlSeconds: GetLatestApyUseCase.NEGATIVE_TTL_SECONDS,
            jitterPct: GetLatestApyUseCase.JITTER_PCT,
            loader: () => this.apyRepo.findLatest(window),
        });
    }
}
