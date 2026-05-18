import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisWarmupService } from '../RedisWarmupService';
import type { ILockService, WithLockOptions } from '@chiliztv/domain/shared/ports/ILockService';
import type { ILogger } from '@chiliztv/domain/shared/ports/ILogger';

function silentLogger(): ILogger {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
}

function lockService(acquired: boolean): ILockService {
  return {
    acquire: vi.fn(),
    release: vi.fn(),
    renew: vi.fn(),
    withLock: vi.fn(async <T>(opts: WithLockOptions<T>) => {
      if (!acquired) return { ran: false as const, reason: 'taken' as const };
      const result = await opts.onAcquired();
      return { ran: true as const, result };
    }),
  };
}

function fakeUseCase(name: string, impl: () => Promise<unknown> = async () => undefined): { execute: ReturnType<typeof vi.fn>; name: string } {
  return { name, execute: vi.fn(impl) };
}

describe('RedisWarmupService', () => {
  let apy: ReturnType<typeof fakeUseCase>;
  let poolState: ReturnType<typeof fakeUseCase>;
  let prices: ReturnType<typeof fakeUseCase>;
  let browse: ReturnType<typeof fakeUseCase>;

  beforeEach(() => {
    apy = fakeUseCase('apy');
    poolState = fakeUseCase('poolState');
    prices = fakeUseCase('prices');
    browse = fakeUseCase('browse');
  });

  it('runs every hot surface in parallel when it owns the warmup lock', async () => {
    const locks = lockService(true);
    const svc = new RedisWarmupService(
      locks,
      silentLogger(),
      apy as never,
      poolState as never,
      prices as never,
      browse as never,
    );

    await svc.run();

    expect(locks.withLock).toHaveBeenCalledTimes(1);
    expect(apy.execute).toHaveBeenCalledTimes(1);
    expect(poolState.execute).toHaveBeenCalledTimes(1);
    expect(prices.execute).toHaveBeenCalledTimes(1);
    expect(browse.execute).toHaveBeenCalledTimes(1);
  });

  it('skips the warmup entirely when another instance already holds the lock', async () => {
    const locks = lockService(false);
    const svc = new RedisWarmupService(
      locks,
      silentLogger(),
      apy as never,
      poolState as never,
      prices as never,
      browse as never,
    );

    await svc.run();

    expect(locks.withLock).toHaveBeenCalledTimes(1);
    expect(apy.execute).not.toHaveBeenCalled();
    expect(poolState.execute).not.toHaveBeenCalled();
    expect(prices.execute).not.toHaveBeenCalled();
    expect(browse.execute).not.toHaveBeenCalled();
  });

  it('continues warming other surfaces when one of them throws', async () => {
    apy = fakeUseCase('apy', async () => {
      throw new Error('rpc timeout');
    });
    const locks = lockService(true);
    const svc = new RedisWarmupService(
      locks,
      silentLogger(),
      apy as never,
      poolState as never,
      prices as never,
      browse as never,
    );

    await expect(svc.run()).resolves.toBeUndefined();
    expect(poolState.execute).toHaveBeenCalledTimes(1);
    expect(prices.execute).toHaveBeenCalledTimes(1);
    expect(browse.execute).toHaveBeenCalledTimes(1);
  });
});
