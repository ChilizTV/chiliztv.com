import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { IBetRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IBetRepository';
import { IPredictionRepository } from '@chiliztv/domain/predictions/repositories/IPredictionRepository';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';

/**
 * Cleanup Old Matches Use Case
 *
 * Removes matches older than `before` while preserving any match still
 * referenced by user activity:
 *  - on-chain `bets` (via `betting_contract_address`)
 *  - off-chain `predictions` (via `api_football_id`)
 *
 * Without this retention policy the dashboard's bet→match join (see
 * `SupabaseBetRepository.findByUserWithMatchInfo`) silently returns
 * `null` once a match is deleted, and the row degrades to "Unknown
 * match · Market · Home". Composing the three repos here is the
 * cheapest fix — single source of truth, no schema duplication.
 */
@injectable()
export class CleanupOldMatchesUseCase {
    constructor(
        @inject(TOKENS.IMatchRepository) private readonly matchRepository: IMatchRepository,
        @inject(TOKENS.IBetRepository) private readonly betRepository: IBetRepository,
        @inject(TOKENS.IPredictionRepository) private readonly predictionRepository: IPredictionRepository,
    ) {}

    async execute(before: Date): Promise<number> {
        // Compute the retention sets concurrently — both reads are
        // independent and bounded by the size of the bets / predictions
        // tables.
        const [contractAddresses, apiFootballIds] = await Promise.all([
            this.betRepository.listReferencedContractAddresses(),
            this.predictionRepository.listReferencedMatchIds(),
        ]);

        return this.matchRepository.deleteOldMatches(before, {
            contractAddresses,
            apiFootballIds,
        });
    }

    /**
     * Convenience method to delete matches outside 24h window.
     * Retention policy still applies — referenced matches are preserved.
     */
    async cleanupOutside24Hours(): Promise<number> {
        return this.execute(MatchFetchWindow.cleanupBefore(new Date()));
    }
}
