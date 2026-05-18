import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'node:crypto';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type {
  ILockService,
  LockResult,
  WithLockOptions,
} from '@chiliztv/domain/shared/ports/ILockService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';

/**
 * Single-instance fallback when REDIS_URL is absent. Always acquires the lock,
 * so callers must understand that multi-instance correctness is NOT preserved.
 * Intended for local dev or a deliberate degradation where a single process
 * owns the workload.
 */
@injectable()
export class NoopLockService implements ILockService {
  constructor(@inject(TOKENS.IClock) private readonly clock: IClock) {}

  async acquire(_key: string, ttlSeconds: number): Promise<LockResult> {
    return {
      acquired: true,
      token: randomUUID(),
      expiresAt: new Date(this.clock.now().getTime() + ttlSeconds * 1000),
    };
  }

  async release(_key: string, _token: string): Promise<boolean> {
    return true;
  }

  async renew(_key: string, _token: string, _ttlSeconds: number): Promise<boolean> {
    return true;
  }

  async withLock<T>(opts: WithLockOptions<T>): Promise<
    | { ran: true; result: T }
    | { ran: false; reason: 'taken' }
  > {
    const result = await opts.onAcquired();
    return { ran: true, result };
  }
}
