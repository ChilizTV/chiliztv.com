import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env.local') });
config({ path: resolve(__dirname, '../../../.env') });

import { setupDependencyInjection, container } from '../../di/container';
setupDependencyInjection();
import { AdvanceEpochUseCase } from '../../application/leaderboard/use-cases/AdvanceEpochUseCase';
import { logger } from '../../infrastructure/logging/logger';

/** Manual epoch upkeep — same path as AdvanceEpochJob, for ops use. */
async function main(): Promise<void> {
    const useCase = container.resolve(AdvanceEpochUseCase);
    const result = await useCase.execute();
    logger.info('leaderboard:advance-epoch done', result);
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        logger.error('leaderboard:advance-epoch failed', {
            error: err instanceof Error ? err.message : String(err),
        });
        process.exit(1);
    });
