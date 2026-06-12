import { inject, injectable } from 'tsyringe';
import cron from 'node-cron';
import { SyncMatchesJob } from './jobs/SyncMatchesJob';
import { SyncLiveMatchesJob } from './jobs/SyncLiveMatchesJob';
import { ResolveMarketsJob } from './jobs/ResolveMarketsJob';
import { ResolveHalftimeMarketsJob } from './jobs/ResolveHalftimeMarketsJob';
import { CloseLiveMarketsJob } from './jobs/CloseLiveMarketsJob';
import { CleanupStreamsJob } from './jobs/CleanupStreamsJob';
import { StaleStreamCleanupJob } from './jobs/StaleStreamCleanupJob';
import { OldEndedStreamsCleanupJob } from './jobs/OldEndedStreamsCleanupJob';
import { SettlePredictionsJob } from './jobs/SettlePredictionsJob';
import { ViewerReconcileJob } from './jobs/ViewerReconcileJob';
import { CloudflareReconcileJob } from './jobs/CloudflareReconcileJob';
import { RefreshTokenPricesJob } from './jobs/RefreshTokenPricesJob';
import { AdvanceEpochJob } from './jobs/AdvanceEpochJob';
import { LiftExpiredBansJob } from './jobs/LiftExpiredBansJob';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import { JobLocks, type JobLockConfig } from './JobLockConfig';
import { logger } from '../logging/logger';

/**
 * Job Scheduler
 * Manages all scheduled jobs in the application. Each handler is wrapped in
 * a distributed lock so the second Fly worker instance silently skips when
 * the first is already running the job — required as soon as worker scale > 1.
 */
@injectable()
export class JobScheduler {
    private cronTasks: cron.ScheduledTask[] = [];
    private intervals: NodeJS.Timeout[] = [];
    /** Self-rescheduled timeouts (NOT setInterval). Tracked so `stop()` can cancel pending wake-ups. */
    private timeouts: NodeJS.Timeout[] = [];
    private stopped = false;

    constructor(
        private readonly syncMatchesJob: SyncMatchesJob,
        private readonly syncLiveMatchesJob: SyncLiveMatchesJob,
        private readonly resolveMarketsJob: ResolveMarketsJob,
        private readonly resolveHalftimeMarketsJob: ResolveHalftimeMarketsJob,
        private readonly closeLiveMarketsJob: CloseLiveMarketsJob,
        private readonly cleanupStreamsJob: CleanupStreamsJob,
        private readonly staleStreamCleanupJob: StaleStreamCleanupJob,
        private readonly oldEndedStreamsCleanupJob: OldEndedStreamsCleanupJob,
        private readonly settlePredictionsJob: SettlePredictionsJob,
        private readonly viewerReconcileJob: ViewerReconcileJob,
        private readonly cloudflareReconcileJob: CloudflareReconcileJob,
        private readonly refreshTokenPricesJob: RefreshTokenPricesJob,
        private readonly advanceEpochJob: AdvanceEpochJob,
        private readonly liftExpiredBansJob: LiftExpiredBansJob,
        @inject(TOKENS.ILockService) private readonly locks: ILockService,
    ) {}

    start(): void {
        logger.info('Starting job scheduler');

        this.startCronJob('SyncMatches', this.syncMatchesJob.getSchedule(), JobLocks.syncMatches,
            () => this.syncMatchesJob.execute());
        this.startCronJob('CleanupStreams', this.cleanupStreamsJob.getSchedule(), JobLocks.cleanupStreams,
            () => this.cleanupStreamsJob.execute());
        this.startCronJob('StaleStreamCleanup', this.staleStreamCleanupJob.getSchedule(), JobLocks.staleStreamCleanup,
            () => this.staleStreamCleanupJob.execute());
        this.startCronJob('OldEndedStreamsCleanup', this.oldEndedStreamsCleanupJob.getSchedule(), JobLocks.oldEndedStreams,
            () => this.oldEndedStreamsCleanupJob.execute());
        this.startCronJob('ViewerReconcile', this.viewerReconcileJob.getSchedule(), JobLocks.viewerReconcile,
            () => this.viewerReconcileJob.execute());
        this.startCronJob('CloudflareReconcile', this.cloudflareReconcileJob.getSchedule(), JobLocks.cloudflareReconcile,
            () => this.cloudflareReconcileJob.execute());
        this.startCronJob('AdvanceEpoch', this.advanceEpochJob.getSchedule(), JobLocks.advanceEpoch,
            () => this.advanceEpochJob.execute());

        this.startIntervalJob('ResolveMarkets', this.resolveMarketsJob.getIntervalMs(), JobLocks.resolveMarkets,
            () => this.resolveMarketsJob.execute());
        this.startIntervalJob('CloseLiveMarkets', this.closeLiveMarketsJob.getIntervalMs(), JobLocks.closeLiveMarkets,
            () => this.closeLiveMarketsJob.execute());
        this.startSelfRescheduledJob('SyncLiveMatches', this.syncLiveMatchesJob.getIntervalMs(), JobLocks.syncLiveMatches,
            () => this.syncLiveMatchesJob.execute());
        this.startSelfRescheduledJob('ResolveHalftimeMarkets', this.resolveHalftimeMarketsJob.getIntervalMs(), JobLocks.resolveHalftimeMarkets,
            () => this.resolveHalftimeMarketsJob.execute());
        this.startIntervalJob('RefreshTokenPrices', this.refreshTokenPricesJob.getIntervalMs(), JobLocks.refreshTokenPrices,
            () => this.refreshTokenPricesJob.execute());
        this.startIntervalJob('SettlePredictions', this.settlePredictionsJob.getIntervalMs(), JobLocks.settlePredictions,
            () => this.settlePredictionsJob.execute());
        this.startIntervalJob('LiftExpiredBans', this.liftExpiredBansJob.getIntervalMs(), JobLocks.liftExpiredBans,
            () => this.liftExpiredBansJob.execute());

        logger.info('Job scheduler started successfully');
    }

    stop(): void {
        logger.info('Stopping job scheduler');
        this.stopped = true;
        this.cronTasks.forEach(task => task.stop());
        this.cronTasks = [];
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts = [];
        logger.info('Job scheduler stopped');
    }

    /**
     * Runs `handler` under a distributed lock. Acquired-and-run is logged at
     * info level; contention is logged at debug since under normal multi-
     * instance operation, every job sees N-1 skipped attempts per tick.
     */
    private async runLocked(name: string, lock: JobLockConfig, handler: () => Promise<void>): Promise<void> {
        const result = await this.locks.withLock({
            key: lock.key,
            ttlSeconds: lock.ttlSeconds,
            onAcquired: handler,
            onContention: 'skip',
        });
        if (!result.ran) {
            logger.debug(`Job ${name}: lock taken by another instance, skipping this tick`);
        }
    }

    private startCronJob(name: string, schedule: string, lock: JobLockConfig, handler: () => Promise<void>): void {
        logger.info(`Starting cron job: ${name}`, { schedule, lockKey: lock.key });

        const task = cron.schedule(schedule, async () => {
            try {
                await this.runLocked(name, lock, handler);
            } catch (error) {
                logger.error(`Cron job ${name} failed`, {
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }, {
            scheduled: true,
            timezone: 'UTC',
        });

        this.cronTasks.push(task);

        logger.info(`Executing initial run for: ${name}`);
        this.runLocked(name, lock, handler).catch(error => {
            logger.error(`Initial run of ${name} failed`, {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        });
    }

    /**
     * Self-rescheduling alternative to `startIntervalJob`. The next tick is
     * scheduled ONLY after the current one finishes (success or failure), so
     * a slow tick (Supabase lag, slow upstream) can never overlap with itself
     * — eliminating the lock-contention storm that `setInterval` would cause
     * when ticks drift past their cadence.
     *
     * Trade-off vs `setInterval`: the effective period becomes
     * `tick_duration + intervalMs`, not strict `intervalMs`. For a 30s cadence
     * with sub-second ticks this is invisible; if you needed strict periodicity
     * (e.g. a heartbeat), use `setInterval` instead.
     */
    private startSelfRescheduledJob(name: string, intervalMs: number, lock: JobLockConfig, handler: () => Promise<void>): void {
        logger.info(`Starting self-rescheduled job: ${name}`, { intervalMs, lockKey: lock.key });

        logger.info(`Executing initial run for: ${name}`);
        const tick = async (): Promise<void> => {
            try {
                await this.runLocked(name, lock, handler);
            } catch (error) {
                logger.error(`Self-rescheduled job ${name} failed`, {
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            } finally {
                if (this.stopped) return;
                const timeout = setTimeout(() => { void tick(); }, intervalMs);
                this.timeouts.push(timeout);
            }
        };
        void tick();
    }

    private startIntervalJob(name: string, intervalMs: number, lock: JobLockConfig, handler: () => Promise<void>): void {
        logger.info(`Starting interval job: ${name}`, { intervalMinutes: intervalMs / 1000 / 60, lockKey: lock.key });

        logger.info(`Executing initial run for: ${name}`);
        this.runLocked(name, lock, handler).catch(error => {
            logger.error(`Initial run of ${name} failed`, {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        });

        const interval = setInterval(async () => {
            try {
                await this.runLocked(name, lock, handler);
            } catch (error) {
                logger.error(`Interval job ${name} failed`, {
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }, intervalMs);

        this.intervals.push(interval);
    }
}
