import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { IBlockchainService } from '@chiliztv/domain/shared/ports/IBlockchainService';

export interface ResolveFinishedMatchesResult {
    matchesProcessed: number;
    marketsResolved: number;
}

/**
 * ResolveFinishedMatchesUseCase
 * Resolves on-chain betting markets for finished matches.
 * Uses IBlockchainService port — no infrastructure imports.
 */
@injectable()
export class ResolveFinishedMatchesUseCase {
    /** Per-contract guard — SyncMatchesJob and ResolveMarketsJob both fire on startup and race on `resolveMarketsBatch`. */
    private readonly inFlight = new Set<string>();

    constructor(
        @inject(TOKENS.IMatchRepository)
        private readonly matchRepository: IMatchRepository,
        @inject(TOKENS.IBlockchainService)
        private readonly blockchainService: IBlockchainService
    ) {}

    async execute(): Promise<ResolveFinishedMatchesResult> {
        const allMatches = await this.matchRepository.findAll();

        const toResolve = allMatches.filter(match => {
            const json = match.toJSON();
            return (
                json.status === 'FT' &&
                json.score?.home != null &&
                json.score?.away != null &&
                json.bettingContractAddress &&
                String(json.bettingContractAddress).trim() !== ''
            );
        });

        if (toResolve.length === 0) {
            return { matchesProcessed: 0, marketsResolved: 0 };
        }

        let marketsResolved = 0;
        let matchesProcessed = 0;

        for (const match of toResolve) {
            const json = match.toJSON();
            const addr = json.bettingContractAddress!.toLowerCase();
            if (this.inFlight.has(addr)) continue;
            this.inFlight.add(addr);
            try {
                const count = await this.blockchainService.resolveMarketsByScore(
                    json.bettingContractAddress!,
                    {
                        homeGoals: json.score!.home!,
                        awayGoals: json.score!.away!,
                        // Halftime + first-scorer not exposed by API-Football's
                        // basic fixture endpoint; HALFTIME / FIRST_SCORER
                        // markets either stay Closed or auto-cancel via
                        // PariMatchBase's void protection.
                        htHomeGoals: 0,
                        htAwayGoals: 0,
                        firstScorerId: 0,
                    },
                );
                marketsResolved += count;
                matchesProcessed += 1;
            } catch {
                // Non-fatal: continue resolving other matches
            } finally {
                this.inFlight.delete(addr);
            }
        }

        return { matchesProcessed, marketsResolved };
    }
}
