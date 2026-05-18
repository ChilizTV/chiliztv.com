import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type {
  IRateLimitService,
  RateLimitCheckOptions,
  RateLimitDecision,
} from '@chiliztv/domain/shared/ports/IRateLimitService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';

/**
 * Open-everything fallback when REDIS_URL is absent. Always allows the
 * request. The HTTP rate-limit-redis middleware has its own fail-open path
 * for the same reason — keep degradation symmetric.
 */
@injectable()
export class NoopRateLimitService implements IRateLimitService {
  constructor(@inject(TOKENS.IClock) private readonly clock: IClock) {}

  async check(opts: RateLimitCheckOptions): Promise<RateLimitDecision> {
    return {
      allowed: true,
      remaining: opts.limit,
      resetAt: new Date(this.clock.now().getTime() + opts.windowSeconds * 1000),
    };
  }
}
