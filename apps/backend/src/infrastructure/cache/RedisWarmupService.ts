import os from 'node:os';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import type { ILogger } from '@chiliztv/domain/shared/ports/ILogger';
import { GetTokenPricesUseCase } from '../../application/prices/use-cases/GetTokenPricesUseCase';
import { GetBrowseMatchesUseCase } from '../../application/matches/use-cases/GetBrowseMatchesUseCase';

const WARMUP_LOCK_TTL_SECONDS = 60;

/**
 * Pre-fills the hottest cache keys when the API process boots. Avoids the
 * cold-start latency spike on rolling deploys when N instances would race on
 * the same cache misses against Supabase / Chiliz RPC / API-Football.
 *
 * Concurrency: a short distributed lock (`lock:warmup`, 60s) lets the first
 * booting instance fill the cache while the others skip silently.
 *
 * Failure mode: every surface is best-effort. A miss here just means the
 * regular request path handles the cold read — warmup is an optimisation,
 * not a correctness layer. Pool / APY surfaces removed (parimutuel — no LP).
 */
@injectable()
export class RedisWarmupService {
    constructor(
        @inject(TOKENS.ILockService) private readonly locks: ILockService,
        @inject(TOKENS.ILogger) private readonly logger: ILogger,
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
