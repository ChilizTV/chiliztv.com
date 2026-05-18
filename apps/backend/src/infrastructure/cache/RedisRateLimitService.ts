import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type {
  IRateLimitService,
  RateLimitCheckOptions,
  RateLimitDecision,
} from '@chiliztv/domain/shared/ports/IRateLimitService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { ILogger } from '@chiliztv/domain/shared/ports/ILogger';
import type { RedisClient } from './RedisClient';
import { env } from '../config/environment';

/**
 * Fixed-window rate limiter via INCR + EXPIRE. Cheaper than sliding-window-log
 * for use-case-level checks (admin throttle, per-wallet writes). The HTTP
 * middleware path uses `rate-limit-redis` directly with its own algorithm and
 * does not consume this port.
 */
@injectable()
export class RedisRateLimitService implements IRateLimitService {
  private readonly prefix = `${env.NODE_ENV}:rate:`;

  constructor(
    @inject(TOKENS.RedisClient) private readonly redis: RedisClient,
    @inject(TOKENS.IClock) private readonly clock: IClock,
    @inject(TOKENS.ILogger) private readonly logger: ILogger,
  ) {}

  async check(opts: RateLimitCheckOptions): Promise<RateLimitDecision> {
    const { bucket, identifier, limit, windowSeconds } = opts;
    const key = `${this.prefix}${bucket}:${identifier}`;
    try {
      const count = await this.redis.incr(key);
      let ttl: number;
      if (count === 1) {
        await this.redis.expire(key, windowSeconds);
        ttl = windowSeconds;
      } else {
        ttl = await this.redis.ttl(key);
        if (ttl < 0) {
          await this.redis.expire(key, windowSeconds);
          ttl = windowSeconds;
        }
      }
      const resetAt = new Date(this.clock.now().getTime() + ttl * 1000);
      if (count > limit) {
        return { allowed: false, retryAfterSeconds: Math.max(1, ttl) };
      }
      return {
        allowed: true,
        remaining: Math.max(0, limit - count),
        resetAt,
      };
    } catch (err) {
      this.logger.warn('Rate limit check errored — failing open', {
        bucket,
        identifier,
        error: (err as Error).message,
      });
      return {
        allowed: true,
        remaining: limit,
        resetAt: new Date(this.clock.now().getTime() + windowSeconds * 1000),
      };
    }
  }
}
