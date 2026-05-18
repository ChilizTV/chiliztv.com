import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'node:crypto';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type {
  ILockService,
  LockResult,
  WithLockOptions,
} from '@chiliztv/domain/shared/ports/ILockService';
import type { ILogger } from '@chiliztv/domain/shared/ports/ILogger';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { RedisClient } from './RedisClient';
import { env } from '../config/environment';

const WAIT_POLL_MS = 200;

@injectable()
export class RedisLockService implements ILockService {
  private readonly prefix = `${env.NODE_ENV}:`;

  constructor(
    @inject(TOKENS.RedisClient) private readonly redis: RedisClient,
    @inject(TOKENS.ILogger) private readonly logger: ILogger,
    @inject(TOKENS.IClock) private readonly clock: IClock,
  ) {}

  async acquire(key: string, ttlSeconds: number): Promise<LockResult> {
    const full = this.prefix + key;
    const token = randomUUID();
    try {
      const result = await this.redis.set(full, token, 'PX', ttlSeconds * 1000, 'NX');
      if (result === 'OK') {
        return {
          acquired: true,
          token,
          expiresAt: new Date(this.clock.now().getTime() + ttlSeconds * 1000),
        };
      }
      return { acquired: false, reason: 'taken' };
    } catch (err) {
      this.logger.error('Lock acquire failed', { key, error: (err as Error).message });
      return { acquired: false, reason: 'error' };
    }
  }

  async release(key: string, token: string): Promise<boolean> {
    try {
      const released = await this.redis.releaseCacheLock(this.prefix + key, token);
      return released === 1;
    } catch (err) {
      this.logger.warn('Lock release errored', { key, error: (err as Error).message });
      return false;
    }
  }

  async renew(key: string, token: string, ttlSeconds: number): Promise<boolean> {
    try {
      const renewed = await this.redis.renewCacheLock(this.prefix + key, token, ttlSeconds * 1000);
      return renewed === 1;
    } catch (err) {
      this.logger.warn('Lock renew errored', { key, error: (err as Error).message });
      return false;
    }
  }

  async withLock<T>(opts: WithLockOptions<T>): Promise<
    | { ran: true; result: T }
    | { ran: false; reason: 'taken' }
  > {
    const { key, ttlSeconds, onAcquired, onContention = 'skip', maxWaitMs = 30_000 } = opts;
    const deadline = this.clock.now().getTime() + maxWaitMs;

    let acquired = await this.acquire(key, ttlSeconds);
    while (!acquired.acquired) {
      if (onContention === 'skip') {
        return { ran: false, reason: 'taken' };
      }
      if (this.clock.now().getTime() >= deadline) {
        return { ran: false, reason: 'taken' };
      }
      await sleep(WAIT_POLL_MS);
      acquired = await this.acquire(key, ttlSeconds);
    }

    const watchdog = this.startWatchdog(key, acquired.token, ttlSeconds);
    try {
      const result = await onAcquired();
      return { ran: true, result };
    } finally {
      clearInterval(watchdog);
      await this.release(key, acquired.token);
    }
  }

  private startWatchdog(key: string, token: string, ttlSeconds: number): NodeJS.Timeout {
    const intervalMs = Math.max(1_000, Math.floor((ttlSeconds * 1000) / 3));
    return setInterval(() => {
      void this.renew(key, token, ttlSeconds).then((ok) => {
        if (!ok) {
          this.logger.warn('Lock lost during execution (watchdog)', { key });
        }
      });
    }, intervalMs);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
