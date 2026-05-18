import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseIndexer, type BaseIndexerOptions } from '../BaseIndexer';
import type { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import type {
  ILockService,
  LockResult,
  WithLockOptions,
} from '@chiliztv/domain/shared/ports/ILockService';

class TestIndexer extends BaseIndexer {
  public processed: Array<{ from: bigint; to: bigint }> = [];
  constructor(opts: BaseIndexerOptions) {
    super(opts);
  }
  protected async processBatch(from: bigint, to: bigint): Promise<void> {
    this.processed.push({ from, to });
  }
  /** Test hook to invoke the private cursor loop directly. */
  async tick(): Promise<void> {
    await (this as unknown as { runBatch: () => Promise<void> }).runBatch();
  }
}

function fakeCheckpoints(stored: bigint = 0n): IIndexerCheckpointRepository {
  let last = stored;
  return {
    getLastBlock: vi.fn(async () => last),
    setLastBlock: vi.fn(async (_n, b) => {
      last = b;
    }),
  };
}

function fakeClient(blockNumber: bigint) {
  return { getBlockNumber: vi.fn(async () => blockNumber) } as unknown as BaseIndexerOptions['client'];
}

function lockService(acquired: boolean): ILockService {
  return {
    acquire: vi.fn(async () => (acquired
      ? { acquired: true, token: 't', expiresAt: new Date(Date.now() + 60_000) }
      : { acquired: false, reason: 'taken' as const }) as LockResult),
    release: vi.fn(async () => true),
    renew: vi.fn(async () => true),
    withLock: vi.fn(async <T>(opts: WithLockOptions<T>) => {
      if (!acquired) return { ran: false as const, reason: 'taken' as const };
      const result = await opts.onAcquired();
      return { ran: true as const, result };
    }),
  };
}

describe('BaseIndexer.runBatch under distributed lock', () => {
  let checkpoints: IIndexerCheckpointRepository;
  let client: BaseIndexerOptions['client'];

  beforeEach(() => {
    checkpoints = fakeCheckpoints(0n);
    client = fakeClient(100n);
  });

  it('advances the cursor when the lock is acquired', async () => {
    const locks = lockService(true);
    const indexer = new TestIndexer({
      name: 'Test',
      client,
      checkpoints,
      lockService: locks,
      reorgDepth: 5,
    });
    await indexer.tick();

    expect(locks.withLock).toHaveBeenCalledTimes(1);
    const call = (locks.withLock as ReturnType<typeof vi.fn>).mock.calls[0]![0] as WithLockOptions<void>;
    expect(call.key).toBe('lock:indexer:test');
    expect(call.ttlSeconds).toBe(60);
    expect(indexer.processed).toHaveLength(1);
    expect(checkpoints.setLastBlock).toHaveBeenCalled();
  });

  it('skips the batch (no cursor advance) when the lock is taken by another instance', async () => {
    const locks = lockService(false);
    const indexer = new TestIndexer({
      name: 'Test',
      client,
      checkpoints,
      lockService: locks,
      reorgDepth: 5,
    });
    await indexer.tick();

    expect(locks.withLock).toHaveBeenCalledTimes(1);
    expect(indexer.processed).toHaveLength(0);
    expect(checkpoints.setLastBlock).not.toHaveBeenCalled();
  });
});
