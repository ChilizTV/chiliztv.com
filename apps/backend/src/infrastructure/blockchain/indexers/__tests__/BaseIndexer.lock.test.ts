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
  /** When set, the chunk starting at this block throws. */
  public failOn: bigint | null = null;
  constructor(opts: BaseIndexerOptions) {
    super(opts);
  }
  protected async processBatch(from: bigint, to: bigint): Promise<void> {
    if (this.failOn !== null && from === this.failOn) throw new Error('chunk failure injected');
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

describe('BaseIndexer tail overlap', () => {
  it('re-scans the overlap window behind the checkpoint when caught up', async () => {
    const checkpoints = fakeCheckpoints(3098n);
    const indexer = new TestIndexer({
      name: 'Test',
      client: fakeClient(3106n),
      checkpoints,
      lockService: lockService(true),
      reorgDepth: 6,
      tailOverlapBlocks: 100,
    });
    await indexer.tick();

    // safeHead 3100, overlap 100 → fromBlock pulled back to 3000.
    expect(indexer.processed).toEqual([{ from: 3000n, to: 3100n }]);
    expect(await checkpoints.getLastBlock('Test')).toBe(3100n);
  });

  it('never pulls fromBlock forward during a deep catch-up', async () => {
    const checkpoints = fakeCheckpoints(2000n);
    const indexer = new TestIndexer({
      name: 'Test',
      client: fakeClient(3106n),
      checkpoints,
      lockService: lockService(true),
      reorgDepth: 6,
      tailOverlapBlocks: 100,
    });
    await indexer.tick();

    expect(indexer.processed[0]).toEqual({ from: 2001n, to: 2900n });
    expect(await checkpoints.getLastBlock('Test')).toBe(3100n);
  });

  it('keeps the strict checkpoint+1 cursor when overlap is not opted in', async () => {
    const checkpoints = fakeCheckpoints(3098n);
    const indexer = new TestIndexer({
      name: 'Test',
      client: fakeClient(3106n),
      checkpoints,
      lockService: lockService(true),
      reorgDepth: 6,
    });
    await indexer.tick();

    expect(indexer.processed).toEqual([{ from: 3099n, to: 3100n }]);
  });
});

describe('BaseIndexer chunked catch-up', () => {
  // Default MAX_BLOCKS_PER_BATCH = 900 (module-level, read at import).
  it('splits a large backlog into capped chunks and checkpoints after each', async () => {
    const checkpoints = fakeCheckpoints(100n);
    const indexer = new TestIndexer({
      name: 'Test',
      client: fakeClient(3006n),
      checkpoints,
      lockService: lockService(true),
      reorgDepth: 6,
    });
    await indexer.tick();

    expect(indexer.processed).toEqual([
      { from: 101n, to: 1000n },
      { from: 1001n, to: 1900n },
      { from: 1901n, to: 2800n },
      { from: 2801n, to: 3000n },
    ]);
    expect(checkpoints.setLastBlock).toHaveBeenCalledTimes(4);
    expect(await checkpoints.getLastBlock('Test')).toBe(3000n);
  });

  it('resumes from the last completed chunk when a chunk fails mid-backlog', async () => {
    const checkpoints = fakeCheckpoints(100n);
    const indexer = new TestIndexer({
      name: 'Test',
      client: fakeClient(3006n),
      checkpoints,
      lockService: lockService(true),
      reorgDepth: 6,
    });
    indexer.failOn = 1901n;
    await indexer.tick(); // runBatch swallows + logs the error

    expect(await checkpoints.getLastBlock('Test')).toBe(1900n);

    indexer.failOn = null;
    await indexer.tick();
    expect(await checkpoints.getLastBlock('Test')).toBe(3000n);
    expect(indexer.processed.at(-1)).toEqual({ from: 2801n, to: 3000n });
  });
});
