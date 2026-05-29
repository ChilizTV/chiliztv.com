import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Match } from '@chiliztv/domain/matches/entities/Match';
import { CloseLiveMatchesMarketsUseCase } from '../CloseLiveMatchesMarketsUseCase';
import { MockClock } from '../../../../testing/clock/MockClock';

vi.mock('../../../../infrastructure/logging/logger', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

function makeMatch(opts: {
    id: number;
    status: string;
    minutesFromNow: number;
    contract?: string | null;
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
        matchDate: new Date(now + opts.minutesFromNow * 60_000),
        bettingContractAddress: opts.contract === undefined ? '0xCONTRACT' + opts.id : (opts.contract ?? undefined),
        createdAt: new Date(now),
        updatedAt: new Date(now),
    });
}

describe('CloseLiveMatchesMarketsUseCase', () => {
    let matchRepository: { findOpenContractsCandidates: ReturnType<typeof vi.fn> };
    let blockchainService: {
        closeOpenMarketsForMatch: ReturnType<typeof vi.fn>;
        cancelOpenMarketsForMatch: ReturnType<typeof vi.fn>;
    };
    let useCase: CloseLiveMatchesMarketsUseCase;

    beforeEach(() => {
        matchRepository = { findOpenContractsCandidates: vi.fn() };
        blockchainService = {
            closeOpenMarketsForMatch: vi.fn().mockResolvedValue({ closed: 1, skipped: 0 }),
            cancelOpenMarketsForMatch: vi.fn().mockResolvedValue({ cancelled: 1, skipped: 0 }),
        };
        // Bypass tsyringe — invoke the constructor directly with mocks.
        useCase = new CloseLiveMatchesMarketsUseCase(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            matchRepository as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            blockchainService as any,
            new MockClock(new Date()),
        );
    });

    it('closes a match in 1H (live)', async () => {
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 1, status: '1H', minutesFromNow: -10 }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.closeOpenMarketsForMatch).toHaveBeenCalledOnce();
        expect(r.closed).toBe(1);
        expect(r.scanned).toBe(1);
    });

    it('closes a match in HT (halftime)', async () => {
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 2, status: 'HT', minutesFromNow: -50 }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.closeOpenMarketsForMatch).toHaveBeenCalledOnce();
        expect(r.closed).toBe(1);
    });

    it('closes NS at T-90s (within 120s kickoff buffer)', async () => {
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 3, status: 'NS', minutesFromNow: 1.5 }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.closeOpenMarketsForMatch).toHaveBeenCalledOnce();
        expect(r.closed).toBe(1);
    });

    it('does NOT close NS at T-3min (outside buffer)', async () => {
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 4, status: 'NS', minutesFromNow: 3 }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.closeOpenMarketsForMatch).not.toHaveBeenCalled();
        expect(r.scanned).toBe(0);
        expect(r.closed).toBe(0);
    });

    it('does NOT close a match in FT (handled by ResolveFinishedMatchesUseCase)', async () => {
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 5, status: 'FT', minutesFromNow: -120 }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.closeOpenMarketsForMatch).not.toHaveBeenCalled();
        expect(r.scanned).toBe(0);
    });

    it('skips matches without a betting contract', async () => {
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 6, status: '1H', minutesFromNow: -10, contract: null }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.closeOpenMarketsForMatch).not.toHaveBeenCalled();
        expect(r.scanned).toBe(0);
    });

    it('cancels (not closes) a CANC match', async () => {
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 7, status: 'CANC', minutesFromNow: -10 }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.cancelOpenMarketsForMatch).toHaveBeenCalledOnce();
        expect(blockchainService.closeOpenMarketsForMatch).not.toHaveBeenCalled();
        expect(r.cancelled).toBe(1);
    });

    it('cancels an ABD match', async () => {
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 8, status: 'ABD', minutesFromNow: -10 }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.cancelOpenMarketsForMatch).toHaveBeenCalledOnce();
        expect(r.cancelled).toBe(1);
    });

    it('closes (not cancels) a PST match — manual cancel left to admin', async () => {
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 9, status: 'PST', minutesFromNow: -10 }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.closeOpenMarketsForMatch).toHaveBeenCalledOnce();
        expect(blockchainService.cancelOpenMarketsForMatch).not.toHaveBeenCalled();
        expect(r.closed).toBe(1);
    });

    it('handles mixed scenarios in one tick', async () => {
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 10, status: '1H', minutesFromNow: -10 }),
            makeMatch({ id: 11, status: 'NS', minutesFromNow: 30 }), // way upcoming
            makeMatch({ id: 12, status: 'FT', minutesFromNow: -120 }),
            makeMatch({ id: 13, status: 'CANC', minutesFromNow: -10 }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.closeOpenMarketsForMatch).toHaveBeenCalledTimes(1);
        expect(blockchainService.cancelOpenMarketsForMatch).toHaveBeenCalledTimes(1);
        expect(r.scanned).toBe(2); // 1H + CANC
        expect(r.closed).toBe(1);
        expect(r.cancelled).toBe(1);
    });

    it('continues processing after a per-match error', async () => {
        blockchainService.closeOpenMarketsForMatch
            .mockRejectedValueOnce(new Error('RPC down'))
            .mockResolvedValueOnce({ closed: 1, skipped: 0 });
        matchRepository.findOpenContractsCandidates.mockResolvedValue([
            makeMatch({ id: 14, status: '1H', minutesFromNow: -10 }),
            makeMatch({ id: 15, status: 'HT', minutesFromNow: -50 }),
        ]);
        const r = await useCase.execute();
        expect(blockchainService.closeOpenMarketsForMatch).toHaveBeenCalledTimes(2);
        expect(r.errors).toBe(1);
        expect(r.closed).toBe(1);
    });
});
