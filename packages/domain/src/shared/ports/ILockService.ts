/**
 * Distributed lock port for serializing job execution across multiple worker
 * instances. Production binds to `RedisLockService` (SET NX PX + Lua release).
 * Environments without `REDIS_URL` bind to `NoopLockService` (single-instance
 * dev only — always acquires).
 */
export type LockResult =
  | { acquired: true; token: string; expiresAt: Date }
  | { acquired: false; reason: 'taken' | 'error' };

export interface WithLockOptions<T> {
  key: string;
  ttlSeconds: number;
  onAcquired: () => Promise<T>;
  /** Whether to skip when the lock is taken or wait until released. Default 'skip'. */
  onContention?: 'skip' | 'wait';
  /** Upper bound on `wait` polling. Default 30_000. */
  maxWaitMs?: number;
}

export interface ILockService {
  acquire(key: string, ttlSeconds: number): Promise<LockResult>;
  /** Returns true if release was successful (caller still owned the lock). */
  release(key: string, token: string): Promise<boolean>;
  /** Refresh the TTL while the work is ongoing. Returns false if the lock was lost. */
  renew(key: string, token: string, ttlSeconds: number): Promise<boolean>;
  /** Acquire → run → release with automatic watchdog renewal for long-running work. */
  withLock<T>(opts: WithLockOptions<T>): Promise<
    | { ran: true; result: T }
    | { ran: false; reason: 'taken' }
  >;
}
