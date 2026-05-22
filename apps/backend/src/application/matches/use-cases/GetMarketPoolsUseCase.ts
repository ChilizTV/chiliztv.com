import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { ILogger } from '@chiliztv/domain/shared/ports/ILogger';
import type {
    IPariMatchPoolsReader,
    MarketPoolSnapshot,
} from '@chiliztv/domain/markets/ports/IPariMatchPoolsReader';
import type { MarketPoolsDto } from '@chiliztv/shared';
import { MarketPoolsCacheKeys, MarketPoolsCacheTtl } from '../MarketPoolsCacheKeys';

/**
 * Aggregates every market's pool state for a given PariMatch proxy via a
 * single multicall (round-trip RPC), cached in Redis ~5s. The indexer
 * invalidates the key on each PositionTaken / MarketResolved /
 * MarketCancelled so consumers see fresh data within the indexer cadence.
 */
@injectable()
export class GetMarketPoolsUseCase {
    constructor(
        @inject(TOKENS.IPariMatchPoolsReader)
        private readonly reader: IPariMatchPoolsReader,
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
        @inject(TOKENS.ILogger)
        private readonly logger: ILogger,
    ) {}

    async execute(contractAddress: string): Promise<MarketPoolsDto> {
        const addr = contractAddress.toLowerCase();
        const cacheKey = MarketPoolsCacheKeys.forAddress(addr);

        const cached = await this.cache.get<MarketPoolsDto>(cacheKey);
        if (cached.hit) return cached.value;

        try {
            const snapshots = await this.reader.readPools(addr);
            const dto: MarketPoolsDto = {
                contractAddress: addr,
                markets: snapshots.map(toDto),
            };
            await this.cache.set(cacheKey, dto, MarketPoolsCacheTtl.seconds);
            return dto;
        } catch (err) {
            this.logger.error('GetMarketPoolsUseCase: read failed', {
                contractAddress: addr,
                error: err instanceof Error ? err.message : String(err),
            });
            // Return empty snapshot rather than 500 — the frontend falls back
            // to its wagmi-direct read path when the endpoint is degraded.
            return { contractAddress: addr, markets: [] };
        }
    }
}

function toDto(s: MarketPoolSnapshot): MarketPoolsDto['markets'][number] {
    return {
        marketId: s.marketId.toString(),
        state: s.state,
        result: s.result.toString(),
        marketType: s.marketType,
        line: s.line,
        maxOutcome: s.maxOutcome,
        totalPool: s.totalPool.toString(),
        outcomePools: s.outcomePools.map((p) => p.toString()),
        impliedProbBps: [...s.impliedProbBps],
    };
}
