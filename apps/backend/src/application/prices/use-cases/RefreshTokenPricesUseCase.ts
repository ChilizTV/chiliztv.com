import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { TokenPrice } from '@chiliztv/domain/prices/entities/TokenPrice';
import { ITokenPriceRepository } from '@chiliztv/domain/prices/repositories/ITokenPriceRepository';
import {
    IPriceFeedService,
    PRICE_FEEDS_TOKEN,
    PriceQuote,
} from '@chiliztv/domain/shared/ports/IPriceFeedService';
import { PRICE_CATALOG } from '@chiliztv/shared';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { logger } from '../../../infrastructure/logging/logger';

export interface RefreshTokenPricesResult {
    refreshed: number;
    skipped: number;
    errors: number;
}

@injectable()
export class RefreshTokenPricesUseCase {
    constructor(
        @inject(TOKENS.ITokenPriceRepository)
        private readonly repo: ITokenPriceRepository,
        @inject(PRICE_FEEDS_TOKEN)
        private readonly feeds: ReadonlyArray<IPriceFeedService>,
        @inject(TOKENS.IClock)
        private readonly clock: IClock,
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
    ) {}

    async execute(): Promise<RefreshTokenPricesResult> {
        const now = this.clock.now();

        // Bucket each catalog symbol into the first feed that supports it.
        // `feeds` is registered in priority order, so Pyth wins over CoinGecko
        // when both can serve the same symbol.
        const buckets = new Map<IPriceFeedService, string[]>();
        let unsupported = 0;
        for (const entry of PRICE_CATALOG) {
            const feed = this.feeds.find((f) => f.supports(entry.symbol));
            if (!feed) {
                unsupported++;
                continue;
            }
            const list = buckets.get(feed);
            if (list) list.push(entry.symbol);
            else buckets.set(feed, [entry.symbol]);
        }

        // Fan out — one parallel HTTP call per feed.
        const fetches = Array.from(buckets.entries()).map(async ([feed, symbols]) => {
            try {
                return await feed.fetchPrices(symbols);
            } catch (err) {
                // Adapters are supposed to swallow their errors; this is a
                // last-resort guard so a single bad feed cannot crash the job.
                logger.error('Price feed threw despite contract', {
                    source: feed.source,
                    error: err instanceof Error ? err.message : String(err),
                });
                return [] as ReadonlyArray<PriceQuote>;
            }
        });
        const results = await Promise.all(fetches);

        // Merge — same symbol from multiple feeds is impossible because
        // `buckets` already routes each symbol to a single feed. Still, keep
        // a Map for deterministic ordering and easy dedup if priority logic
        // changes later.
        const merged = new Map<string, PriceQuote>();
        for (const quotes of results) {
            for (const q of quotes) merged.set(q.symbol, q);
        }

        const prices = Array.from(merged.values()).map((q) =>
            TokenPrice.create({
                symbol: q.symbol,
                priceUsd: q.priceUsd,
                change24hPct: q.change24hPct,
                source: q.source,
                fetchedAt: now,
            }),
        );

        let errors = 0;
        if (prices.length > 0) {
            try {
                await this.repo.upsertMany(prices);
                // Invalidate the read-side cache so the next /prices call
                // reflects the fresh values without waiting for TTL drift.
                await Promise.allSettled([
                    this.cache.delete('price:list'),
                    ...prices.map((p) => this.cache.delete(`price:${p.symbol}`)),
                ]);
            } catch (err) {
                errors = prices.length;
                logger.error('Failed to upsert refreshed token prices', {
                    count: prices.length,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        return {
            refreshed: errors === 0 ? prices.length : 0,
            skipped: PRICE_CATALOG.length - prices.length - unsupported,
            errors,
        };
    }
}
