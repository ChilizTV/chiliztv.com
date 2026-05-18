import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IPoolStateReader, PoolState } from '@chiliztv/domain/shared/ports/IPoolStateReader';

/**
 * Read-side aggregator for the LiquidityPool global state. Cached so the
 * front can poll `/pool/state` from many clients without burning the public
 * Chiliz RPC quota (~50 req/s). TTL aligned with Chiliz block time (3 s) ×
 * acceptable staleness — 15 s tolerates ~5 blocks of drift, which is well
 * within what an LP dashboard surfaces.
 */
@injectable()
export class GetPoolStateUseCase {
    private static readonly CACHE_TTL_SECONDS = 15;
    private static readonly JITTER_PCT = 20;
    private static readonly KEY = 'pool:state';

    constructor(
        @inject(TOKENS.IPoolStateReader)
        private readonly reader: IPoolStateReader,
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
    ) {}

    async execute(): Promise<PoolState> {
        const cached = await this.cache.getOrLoad<PoolState>({
            key: GetPoolStateUseCase.KEY,
            ttlSeconds: GetPoolStateUseCase.CACHE_TTL_SECONDS,
            jitterPct: GetPoolStateUseCase.JITTER_PCT,
            loader: () => this.reader.read(),
        });
        // The reader always resolves with a `PoolState` (RPC error throws),
        // so a `null` here means the loader itself returned null — treat as
        // a transient failure and bubble up as a domain error.
        if (!cached) {
            throw new Error('Pool state unavailable');
        }
        return cached;
    }
}
