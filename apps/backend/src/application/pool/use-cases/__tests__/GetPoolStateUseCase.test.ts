import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPoolStateUseCase } from '../GetPoolStateUseCase';
import { InMemoryCache } from '../../../../testing/cache/InMemoryCache';
import type { IPoolStateReader, PoolState } from '@chiliztv/domain/shared/ports/IPoolStateReader';

function stubState(overrides: Partial<PoolState> = {}): PoolState {
  return {
    totalAssets: 1_000_000n,
    totalSupply: 950_000n,
    freeBalance: 750_000n,
    totalLiabilities: 250_000n,
    utilization: 2500n,
    protocolFeeBps: 100,
    treasuryShareBps: 4000,
    lpWithdrawalFeeBps: 25,
    maxBetAmount: 10_000n,
    maxLiabilityPerMarketBps: 1000,
    maxLiabilityPerMatchBps: 3000,
    depositCooldownSeconds: 86_400,
    paused: false,
    accruedTreasury: 1_234n,
    treasury: '0xTREASURY',
    pendingTreasury: '0x0000000000000000000000000000000000000000',
    ...overrides,
  };
}

function fakeReader(impl: () => Promise<PoolState>): IPoolStateReader {
  return { read: vi.fn(impl) };
}

describe('GetPoolStateUseCase', () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    cache = new InMemoryCache();
  });

  it('reads on-chain on cold cache and serves the same value on warm path', async () => {
    const reader = fakeReader(async () => stubState({ totalAssets: 5_000_000n }));
    const uc = new GetPoolStateUseCase(reader, cache);

    const first = await uc.execute();
    (reader.read as ReturnType<typeof vi.fn>).mockClear();
    const second = await uc.execute();

    expect(first.totalAssets).toBe(5_000_000n);
    expect(second.totalAssets).toBe(5_000_000n);
    expect(reader.read).not.toHaveBeenCalled();
  });

  it('round-trips bigint fields losslessly through the cache codec', async () => {
    const reader = fakeReader(async () =>
      stubState({
        totalAssets: 9_007_199_254_740_993n,
        accruedTreasury: 42n,
      }),
    );
    const uc = new GetPoolStateUseCase(reader, cache);

    await uc.execute();
    const cached = await uc.execute();

    expect(cached.totalAssets).toBe(9_007_199_254_740_993n);
    expect(cached.accruedTreasury).toBe(42n);
  });

  it('dedupes concurrent reads to a single RPC call (single-flight)', async () => {
    let resolveRead!: (s: PoolState) => void;
    const deferred = new Promise<PoolState>((r) => {
      resolveRead = r;
    });
    const reader: IPoolStateReader = { read: vi.fn().mockReturnValue(deferred) };
    const uc = new GetPoolStateUseCase(reader, cache);

    const a = uc.execute();
    const b = uc.execute();
    await new Promise((r) => setTimeout(r, 5));
    resolveRead(stubState());
    const [r1, r2] = await Promise.all([a, b]);

    expect(r1.totalAssets).toBe(r2.totalAssets);
    expect(reader.read).toHaveBeenCalledTimes(1);
  });
});
