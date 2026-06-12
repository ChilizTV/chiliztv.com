import { injectable } from 'tsyringe';
import { container } from '../../config/di-container';
import { AdvanceEpochUseCase } from '../../../application/leaderboard/use-cases/AdvanceEpochUseCase';
import { logger } from '../../logging/logger';

/**
 * Hourly upkeep for the V2 leaderboard: forces `advanceEpoch` past a quiet
 * boundary and sweeps expired claim windows via `rolloverEpoch`.
 */
@injectable()
export class AdvanceEpochJob {
    private readonly schedule = '7 * * * *';

    getSchedule(): string {
        return this.schedule;
    }

    async execute(): Promise<void> {
        try {
            const useCase = container.resolve(AdvanceEpochUseCase);
            const result = await useCase.execute();
            if (result.advanced || result.rolledOver > 0) {
                logger.info('AdvanceEpochJob: applied', result);
            }
        } catch (error) {
            logger.error('AdvanceEpochJob failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
