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

        for (const match of toResolve) {
            const json = match.toJSON();
            try {
                const count = await this.blockchainService.resolveMarkets(
                    json.bettingContractAddress!,
                    json.score!.home!,
                    json.score!.away!
                );
                marketsResolved += count;
            } catch {
                // Non-fatal: continue resolving other matches
            }
        }

        return { matchesProcessed: toResolve.length, marketsResolved };
    }
}
