import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { TokenPrice, type TokenPriceProps } from '@chiliztv/domain/prices/entities/TokenPrice';
import { ITokenPriceRepository } from '@chiliztv/domain/prices/repositories/ITokenPriceRepository';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';

const TTL_SECONDS = 60;
const JITTER_PCT = 15;
const NEGATIVE_TTL_SECONDS = 10;

/**
 * Read-side aggregator for token prices. The `RefreshTokenPricesJob` writes
 * the rows every 5 min; this layer caches the read for 60 s, well below the
 * job cadence, so the front polling at 60 s + a fan-out of N users still
 * hits at most one Supabase read per minute per symbol.
 */
@injectable()
export class GetTokenPricesUseCase {
    constructor(
        @inject(TOKENS.ITokenPriceRepository)
        private readonly repo: ITokenPriceRepository,
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
    ) {}

    async execute(): Promise<TokenPrice[]> {
        const cached = await this.cache.getOrLoad<TokenPriceProps[]>({
            key: 'price:list',
            ttlSeconds: TTL_SECONDS,
            jitterPct: JITTER_PCT,
            loader: async () => {
                const list = await this.repo.findAll();
                return list.map((p) => p.toJSON());
            },
        });
        return (cached ?? []).map((p) => TokenPrice.reconstitute(p));
    }

    async executeBySymbols(symbols: ReadonlyArray<string>): Promise<ReadonlyMap<string, TokenPrice>> {
        // The all-symbols list is already cached by `execute()`; routing
        // multi-symbol callers through it is cheaper than caching every
        // ad-hoc subset.
        const all = await this.execute();
        const wanted = new Set(symbols.map((s) => s.toUpperCase()));
        const out = new Map<string, TokenPrice>();
        for (const price of all) {
            if (wanted.has(price.symbol)) out.set(price.symbol, price);
        }
        return out;
    }

    async executeBySymbol(symbol: string): Promise<TokenPrice | null> {
        const upper = symbol.toUpperCase();
        const cached = await this.cache.getOrLoad<TokenPriceProps>({
            key: `price:${upper}`,
            ttlSeconds: TTL_SECONDS,
            negativeTtlSeconds: NEGATIVE_TTL_SECONDS,
            jitterPct: JITTER_PCT,
            loader: async () => {
                const price = await this.repo.findBySymbol(upper);
                return price ? price.toJSON() : null;
            },
        });
        return cached ? TokenPrice.reconstitute(cached) : null;
    }
}
