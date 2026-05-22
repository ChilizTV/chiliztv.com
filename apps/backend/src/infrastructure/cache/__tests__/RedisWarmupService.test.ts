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

function fakeUseCase(
    name: string,
    impl: () => Promise<unknown> = async () => undefined,
): { execute: ReturnType<typeof vi.fn>; name: string } {
    return { name, execute: vi.fn(impl) };
}

// Parimutuel migration trimmed warmup down to prices + matches.browse.
// LP-era surfaces (apy + poolState) were dropped with the LiquidityPool.
describe('RedisWarmupService', () => {
    let prices: ReturnType<typeof fakeUseCase>;
    let browse: ReturnType<typeof fakeUseCase>;

    beforeEach(() => {
        prices = fakeUseCase('prices');
        browse = fakeUseCase('browse');
    });

    it('runs every hot surface in parallel when it owns the warmup lock', async () => {
        const locks = lockService(true);
        const svc = new RedisWarmupService(
            locks,
            silentLogger(),
            prices as never,
            browse as never,
        );

        await svc.run();

        expect(locks.withLock).toHaveBeenCalledTimes(1);
        expect(prices.execute).toHaveBeenCalledTimes(1);
        expect(browse.execute).toHaveBeenCalledTimes(1);
    });

    it('skips the warmup entirely when another instance already holds the lock', async () => {
        const locks = lockService(false);
        const svc = new RedisWarmupService(
            locks,
            silentLogger(),
            prices as never,
            browse as never,
        );

        await svc.run();

        expect(locks.withLock).toHaveBeenCalledTimes(1);
        expect(prices.execute).not.toHaveBeenCalled();
        expect(browse.execute).not.toHaveBeenCalled();
    });

    it('continues warming other surfaces when one of them throws', async () => {
        prices = fakeUseCase('prices', async () => {
            throw new Error('rpc timeout');
        });
        const locks = lockService(true);
        const svc = new RedisWarmupService(
            locks,
            silentLogger(),
            prices as never,
            browse as never,
        );

        await expect(svc.run()).resolves.toBeUndefined();
        expect(browse.execute).toHaveBeenCalledTimes(1);
    });
});
