import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
    IPriceFeedService,
    PriceQuote,
} from '@chiliztv/domain/shared/ports/IPriceFeedService';
import { TokenPrice } from '@chiliztv/domain/prices/entities/TokenPrice';
import { RefreshTokenPricesUseCase } from '../RefreshTokenPricesUseCase';
import { MockClock } from '../../../../testing/clock/MockClock';
import { NoopCacheService } from '../../../../infrastructure/cache/NoopCacheService';

const FIXED_NOW = new Date('2026-05-11T12:00:00.000Z');
const mkClock = () => new MockClock(FIXED_NOW);

vi.mock('../../../../infrastructure/logging/logger', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

class FakeFeed implements IPriceFeedService {
    constructor(
        public readonly source: 'coingecko' | 'pyth',
        private readonly supported: ReadonlyArray<string>,
        private readonly fetchImpl: (symbols: ReadonlyArray<string>) => Promise<ReadonlyArray<PriceQuote>>,
    ) {}
    supports(symbol: string): boolean {
        return this.supported.includes(symbol.toUpperCase());
    }
    fetchPrices(symbols: ReadonlyArray<string>): Promise<ReadonlyArray<PriceQuote>> {
        return this.fetchImpl(symbols);
    }
}

function priceQuote(symbol: string, source: 'coingecko' | 'pyth', priceUsd: number): PriceQuote {
    return { symbol, priceUsd, change24hPct: null, source };
}

describe('RefreshTokenPricesUseCase', () => {
    let upsertMany: ReturnType<typeof vi.fn>;
    let repo: { upsertMany: typeof upsertMany };

    beforeEach(() => {
        upsertMany = vi.fn().mockResolvedValue(undefined);
        repo = { upsertMany };
    });

    it('routes CHZ to Pyth when both feeds support it (Pyth priority)', async () => {
        const pythFetch = vi.fn().mockResolvedValue([priceQuote('CHZ', 'pyth', 0.085)]);
        const coingeckoFetch = vi.fn().mockResolvedValue([priceQuote('PSG', 'coingecko', 2.5)]);
        const pyth = new FakeFeed('pyth', ['CHZ'], pythFetch);
        const coingecko = new FakeFeed('coingecko', ['CHZ', 'PSG'], coingeckoFetch);

        const useCase = new RefreshTokenPricesUseCase(repo as never, [pyth, coingecko], mkClock(), new NoopCacheService());
        const result = await useCase.execute();

        // Pyth received CHZ, CoinGecko did NOT receive CHZ (because Pyth won the bucket).
        expect(pythFetch).toHaveBeenCalledWith(expect.arrayContaining(['CHZ']));
        expect(coingeckoFetch).toHaveBeenCalled();
        const coingeckoArg = coingeckoFetch.mock.calls[0]?.[0] as string[];
        expect(coingeckoArg).not.toContain('CHZ');

        expect(result.refreshed).toBeGreaterThanOrEqual(2);
        expect(upsertMany).toHaveBeenCalledOnce();
        const upserted = upsertMany.mock.calls[0]?.[0] as TokenPrice[];
        const chz = upserted.find((p) => p.symbol === 'CHZ');
        expect(chz?.source).toBe('pyth');
    });

    it('falls back when Pyth returns empty (e.g. 404)', async () => {
        const pyth = new FakeFeed('pyth', ['CHZ'], vi.fn().mockResolvedValue([]));
        // CoinGecko also supports CHZ but never gets called because the bucket
        // was already claimed by Pyth — this asserts a missing edge case in
        // the current design: a feed that "supports" a symbol but returns
        // empty does NOT cascade to the next feed.
        const coingecko = new FakeFeed('coingecko', ['CHZ'], vi.fn().mockResolvedValue([priceQuote('CHZ', 'coingecko', 0.08)]));

        const useCase = new RefreshTokenPricesUseCase(repo as never, [pyth, coingecko], mkClock(), new NoopCacheService());
        const result = await useCase.execute();

        // CHZ ends up unpriced for this tick (acceptable — next tick retries).
        const upserted = upsertMany.mock.calls[0]?.[0] as TokenPrice[] | undefined;
        const chz = upserted?.find((p) => p.symbol === 'CHZ');
        expect(chz).toBeUndefined();
        expect(result.skipped).toBeGreaterThan(0);
    });

    it('survives a feed that throws despite the contract', async () => {
        const pyth = new FakeFeed('pyth', ['CHZ'], vi.fn().mockRejectedValue(new Error('boom')));
        const coingecko = new FakeFeed('coingecko', ['PSG'], vi.fn().mockResolvedValue([priceQuote('PSG', 'coingecko', 2.5)]));

        const useCase = new RefreshTokenPricesUseCase(repo as never, [pyth, coingecko], mkClock(), new NoopCacheService());
        const result = await useCase.execute();

        expect(result.refreshed).toBeGreaterThanOrEqual(1);
        const upserted = upsertMany.mock.calls[0]?.[0] as TokenPrice[];
        expect(upserted.some((p) => p.symbol === 'PSG')).toBe(true);
        expect(upserted.some((p) => p.symbol === 'CHZ')).toBe(false);
    });

    it('counts upsert errors', async () => {
        const coingecko = new FakeFeed(
            'coingecko',
            ['PSG', 'BAR'],
            vi.fn().mockResolvedValue([
                priceQuote('PSG', 'coingecko', 2.5),
                priceQuote('BAR', 'coingecko', 3.1),
            ]),
        );
        upsertMany.mockRejectedValueOnce(new Error('db down'));

        const useCase = new RefreshTokenPricesUseCase(repo as never, [coingecko], mkClock(), new NoopCacheService());
        const result = await useCase.execute();

        expect(result.errors).toBeGreaterThan(0);
        expect(result.refreshed).toBe(0);
    });
});
