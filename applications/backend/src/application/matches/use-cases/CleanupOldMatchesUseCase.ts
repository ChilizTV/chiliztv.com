import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';
/**
 * Cleanup Old Matches Use Case
 * Removes matches that are older than a specified date.
 */
@injectable()
export class CleanupOldMatchesUseCase {
    constructor(
        @inject(TOKENS.IMatchRepository) private readonly matchRepository: IMatchRepository
    ) {}

    async execute(before: Date): Promise<number> {
        return this.matchRepository.deleteOldMatches(before);
    }

    /**
     * Convenience method to delete matches outside 24h window
     */
    async cleanupOutside24Hours(): Promise<number> {
        return this.execute(MatchFetchWindow.cleanupBefore(new Date()));
    }
}
