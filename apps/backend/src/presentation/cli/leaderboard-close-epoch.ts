import 'reflect-metadata';
import { config } from 'dotenv';
config();

import { setupDependencyInjection, container } from '../../di/container';
setupDependencyInjection();

import { CloseEpochUseCase } from '../../application/leaderboard/use-cases/CloseEpochUseCase';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Manual close-epoch CLI. Wraps `CloseEpochUseCase` with `allowEmpty: false`
 * so the operator gets a hard error when there's nothing to distribute —
 * the monthly cron uses the same use case with `allowEmpty: true`.
 */
async function main(): Promise<void> {
    const useCase = container.resolve(CloseEpochUseCase);
    const result = await useCase.execute({ allowEmpty: false });
    logger.info('leaderboard:close-epoch done', {
        txHash: result.txHash,
        merkleRoot: result.merkleRoot,
        leavesCount: result.leavesCount,
    });
    process.exit(0);
}

main().catch((err) => {
    logger.error('leaderboard:close-epoch failed', {
        error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
});
