import os from 'node:os';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import type { ILogger } from '@chiliztv/domain/shared/ports/ILogger';
import { GetLatestApyUseCase } from '../../application/pool/use-cases/GetLatestApyUseCase';
import { GetPoolStateUseCase } from '../../application/pool/use-cases/GetPoolStateUseCase';
import { GetTokenPricesUseCase } from '../../application/prices/use-cases/GetTokenPricesUseCase';
import { GetBrowseMatchesUseCase } from '../../application/matches/use-cases/GetBrowseMatchesUseCase';

const WARMUP_LOCK_TTL_SECONDS = 60;

/**
 * Pre-fills the hottest cache keys when the API process boots. Without this,
 * a Fly rolling deploy of N machines causes N parallel misses against the
 * data sources at restart (Supabase, Chiliz RPC, API-Football) before the
 * single-flight protection kicks in — a small but visible "cold start"
 * latency spike.
 *
 * Concurrency: under a multi-instance rolling deploy, every instance would
 * race on the same warmup work. A short distributed lock (`lock:warmup`,
 * SETNX 60 s) lets the first booting instance fill the cache while the
 * others skip and read whatever it has just written.
 *
 * Failure mode: every use case here is best-effort. A failure on one surface
 * (RPC timeout, Supabase blip) is logged and the warmup continues — the
 * regular request path already handles a cold key, the warmup is just an
 * optimisation, not a correctness layer.
 */
@injectable()
export class RedisWarmupService {
    constructor(
        @inject(TOKENS.ILockService) private readonly locks: ILockService,
        @inject(TOKENS.ILogger) private readonly logger: ILogger,
        @inject(GetLatestApyUseCase) private readonly apy: GetLatestApyUseCase,
        @inject(GetPoolStateUseCase) private readonly poolState: GetPoolStateUseCase,
        @inject(GetTokenPricesUseCase) private readonly prices: GetTokenPricesUseCase,
        @inject(GetBrowseMatchesUseCase) private readonly browseMatches: GetBrowseMatchesUseCase,
    ) {}

    async run(): Promise<void> {
        const hostname = os.hostname();
        const outcome = await this.locks.withLock({
            key: 'lock:warmup',
            ttlSeconds: WARMUP_LOCK_TTL_SECONDS,
            onContention: 'skip',
            onAcquired: () => this.warmAll(hostname),
        });
        if (!outcome.ran) {
            this.logger.info('Cache warmup skipped: another instance is already running it', { hostname });
        }
    }

    private async warmAll(hostname: string): Promise<void> {
        this.logger.info('Cache warmup starting', { hostname });
        const started = Date.now();
        const tasks = [
            this.tryWarm('pool.apy', () => this.apy.execute()),
            this.tryWarm('pool.state', () => this.poolState.execute()),
            this.tryWarm('prices.list', () => this.prices.execute()),
            this.tryWarm('matches.browse', () => this.browseMatches.execute()),
        ];
        const results = await Promise.allSettled(tasks);
        const ok = results.filter((r) => r.status === 'fulfilled').length;
        this.logger.info('Cache warmup finished', {
            hostname,
            durationMs: Date.now() - started,
            warmed: ok,
            total: tasks.length,
        });
    }

    private async tryWarm(surface: string, exec: () => Promise<unknown>): Promise<void> {
        try {
            await exec();
        } catch (err) {
            this.logger.warn('Cache warmup surface failed (non-fatal)', {
                surface,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
}
