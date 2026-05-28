import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { shouldCloseAt } from '@chiliztv/domain/leaderboard/policies/cycleSchedule';
import { CloseEpochUseCase } from '../../../application/leaderboard/use-cases/CloseEpochUseCase';
import { logger } from '../../logging/logger';

/**
 * Fires the leaderboard close-epoch tx on the last day of each month at
 * 23:55 UTC (cron `55 23 * * *`). The job runs daily but `shouldCloseAt`
 * only returns true within a 10-min window around the scheduled close,
 * so non-last-day ticks are cheap no-ops.
 *
 * First-cycle override: closes on 2026-06-30 regardless of when the code
 * is deployed in May/June. Subsequent cycles follow the rolling
 * last-day-of-month rule.
 *
 * `allowEmpty: true` — if the cycle has no winners, close anyway with
 * `merkleRoot = 0x0` so the pool rolls forward into the next cycle via
 * `rolloverEpoch` 7 days later. Keeps the monthly cadence strict.
 */
@injectable()
export class CloseMonthlyEpochJob {
    private readonly schedule = '55 23 * * *'; // 23:55 UTC daily

    constructor(
        @inject(TOKENS.IClock) private readonly clock: IClock,
        private readonly closeEpoch: CloseEpochUseCase,
    ) {}

    getSchedule(): string {
        return this.schedule;
    }

    async execute(): Promise<void> {
        const now = this.clock.now();
        if (!shouldCloseAt(now)) {
            logger.debug('CloseMonthlyEpochJob: outside close window, skipping', {
                now: now.toISOString(),
            });
            return;
        }
        logger.info('CloseMonthlyEpochJob: firing', { now: now.toISOString() });
        try {
            const result = await this.closeEpoch.execute({ allowEmpty: true });
            logger.info('CloseMonthlyEpochJob: epoch closed', {
                txHash: result.txHash,
                merkleRoot: result.merkleRoot,
                leavesCount: result.leavesCount,
            });
        } catch (err) {
            logger.error('CloseMonthlyEpochJob: failed', {
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
}
