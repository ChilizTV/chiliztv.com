import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Match } from '@chiliztv/domain/matches/entities/Match';
import { ResolveFinishedMatchesUseCase } from '../ResolveFinishedMatchesUseCase';

function makeMatch(opts: {
    id: number;
    status: string;
    home?: number;
    away?: number;
    contract?: string | null;
    htHome?: number | null;
    htAway?: number | null;
}): Match {
    const now = Date.now();
    return Match.reconstitute({
        id: opts.id,
        apiFootballId: 100 + opts.id,
        homeTeamId: 1,
        homeTeamName: 'Home',
        awayTeamId: 2,
        awayTeamName: 'Away',
        leagueId: 1,
        leagueName: 'Test League',
        season: 2026,
        status: opts.status,
        matchDate: new Date(now - 60 * 60_000),
        homeScore: opts.home,
        awayScore: opts.away,
        htHomeScore: opts.htHome ?? null,
        htAwayScore: opts.htAway ?? null,
        bettingContractAddress:
            opts.contract === undefined ? `0xCONTRACT${opts.id}` : (opts.contract ?? undefined),
        createdAt: new Date(now),
        updatedAt: new Date(now),
    });
}

describe('ResolveFinishedMatchesUseCase', () => {
    let matchRepository: { findAll: ReturnType<typeof vi.fn> };
    let blockchainService: { resolveMarketsByScore: ReturnType<typeof vi.fn> };
    let useCase: ResolveFinishedMatchesUseCase;

    beforeEach(() => {
        matchRepository = { findAll: vi.fn() };
        blockchainService = { resolveMarketsByScore: vi.fn().mockResolvedValue(1) };
        useCase = new ResolveFinishedMatchesUseCase(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            matchRepository as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            blockchainService as any,
        );
    });

    it('resolves a finished FT match with a 90\' score', async () => {
        matchRepository.findAll.mockResolvedValue([
            makeMatch({ id: 1, status: 'FT', home: 2, away: 1 }),
        ]);

        const r = await useCase.execute();

        expect(blockchainService.resolveMarketsByScore).toHaveBeenCalledOnce();
        expect(blockchainService.resolveMarketsByScore).toHaveBeenCalledWith(
            '0xCONTRACT1',
            expect.objectContaining({ homeGoals: 2, awayGoals: 1 }),
        );
        expect(r).toEqual({ matchesProcessed: 1, marketsResolved: 1 });
    });

    it('resolves an AET match using the 90\' score (WINNER market convention)', async () => {
        // Match went to extra time: 1-1 at 90', then 3-2 after AET.
        // The on-chain WINNER market resolves on 90' score (Draw), not AET (Home).
        matchRepository.findAll.mockResolvedValue([
            makeMatch({ id: 2, status: 'AET', home: 1, away: 1 }),
        ]);

        const r = await useCase.execute();

        expect(blockchainService.resolveMarketsByScore).toHaveBeenCalledOnce();
        expect(blockchainService.resolveMarketsByScore).toHaveBeenCalledWith(
            '0xCONTRACT2',
            expect.objectContaining({ homeGoals: 1, awayGoals: 1 }),
        );
        expect(r.matchesProcessed).toBe(1);
    });

    it('resolves a PEN match using the 90\' score', async () => {
        // 1-1 at 90', 1-1 after AET, home won 5-4 on penalties.
        // WINNER market resolves Draw on 90'; PEN goals are NOT sent here.
        matchRepository.findAll.mockResolvedValue([
            makeMatch({ id: 3, status: 'PEN', home: 1, away: 1 }),
        ]);

        const r = await useCase.execute();

        expect(blockchainService.resolveMarketsByScore).toHaveBeenCalledOnce();
        expect(blockchainService.resolveMarketsByScore).toHaveBeenCalledWith(
            '0xCONTRACT3',
            expect.objectContaining({ homeGoals: 1, awayGoals: 1 }),
        );
        expect(r.matchesProcessed).toBe(1);
    });

    it('forwards HT scores when available so HALFTIME market resolves in the fallback path', async () => {
        matchRepository.findAll.mockResolvedValue([
            makeMatch({ id: 4, status: 'AET', home: 1, away: 1, htHome: 0, htAway: 1 }),
        ]);

        await useCase.execute();

        expect(blockchainService.resolveMarketsByScore).toHaveBeenCalledWith(
            '0xCONTRACT4',
            expect.objectContaining({ htHomeGoals: 0, htAwayGoals: 1 }),
        );
    });

    it('skips live matches (1H, HT, 2H, ET, BT, P)', async () => {
        matchRepository.findAll.mockResolvedValue([
            makeMatch({ id: 5, status: '1H', home: 0, away: 0 }),
            makeMatch({ id: 6, status: 'HT', home: 1, away: 0 }),
            makeMatch({ id: 7, status: '2H', home: 2, away: 0 }),
            makeMatch({ id: 8, status: 'ET', home: 2, away: 2 }),
            makeMatch({ id: 9, status: 'P', home: 2, away: 2 }),
        ]);

        const r = await useCase.execute();

        expect(blockchainService.resolveMarketsByScore).not.toHaveBeenCalled();
        expect(r).toEqual({ matchesProcessed: 0, marketsResolved: 0 });
    });

    it('skips finished matches with no score', async () => {
        matchRepository.findAll.mockResolvedValue([
            makeMatch({ id: 10, status: 'FT' }), // home/away undefined
        ]);

        const r = await useCase.execute();

        expect(blockchainService.resolveMarketsByScore).not.toHaveBeenCalled();
        expect(r.matchesProcessed).toBe(0);
    });

    it('skips matches with no betting contract address', async () => {
        matchRepository.findAll.mockResolvedValue([
            makeMatch({ id: 11, status: 'FT', home: 2, away: 1, contract: null }),
        ]);

        const r = await useCase.execute();

        expect(blockchainService.resolveMarketsByScore).not.toHaveBeenCalled();
        expect(r.matchesProcessed).toBe(0);
    });

    it('continues processing other matches when one resolve throws', async () => {
        blockchainService.resolveMarketsByScore
            .mockRejectedValueOnce(new Error('rpc timeout'))
            .mockResolvedValueOnce(2);

        matchRepository.findAll.mockResolvedValue([
            makeMatch({ id: 12, status: 'FT', home: 1, away: 0 }),
            makeMatch({ id: 13, status: 'AET', home: 2, away: 2 }),
        ]);

        const r = await useCase.execute();

        expect(blockchainService.resolveMarketsByScore).toHaveBeenCalledTimes(2);
        expect(r).toEqual({ matchesProcessed: 1, marketsResolved: 2 });
    });
});
