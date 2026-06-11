import type { PublicClient, Log } from 'viem';
import { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import { indexerLockConfig } from '../../scheduling/JobLockConfig';
import { logger } from '../../logging/logger';

const POLLING_INTERVAL_MS = 6_000;
/**
 * Re-org safety margin. CLAUDE.md §7.7 requires ≥6 on Chiliz so UPDATE-style
 * indexer writes (settleMarket, recordClaim, cancelMarket) land on confirmed
 * blocks and don't need an on-chain state re-verify per event.
 */
const REORG_DEPTH = Number(process.env.INDEXER_REORG_DEPTH ?? 6);
/**
 * Default lookback when an indexer starts with no checkpoint row. Keeps the
 * RPC bill in check at boot — the BlockchainEventListener separately runs
 * a one-shot full backfill if the deployer asks for it.
 */
const DEFAULT_LOOKBACK_BLOCKS = BigInt(process.env.INDEXER_DEFAULT_LOOKBACK ?? 1_000);
/**
 * Max blocks per `eth_getLogs` call. Public RPCs cap the range (Ankr mainnet
 * rejects >~1 000 blocks), so catch-up after a rewind or downtime walks the
 * backlog in capped chunks, persisting the checkpoint after each one.
 */
const MAX_BLOCKS_PER_BATCH = BigInt(process.env.INDEXER_MAX_BLOCK_RANGE ?? 900);

export interface BaseIndexerOptions {
    /** Stable indexer name persisted in `indexer_checkpoints.indexer_name`. */
    readonly name: string;
    /** Optional contract address to record alongside the checkpoint (info only). */
    readonly contractAddress?: string;
    readonly client: PublicClient;
    readonly checkpoints: IIndexerCheckpointRepository;
    /** Distributed lock so only one worker instance advances the cursor at a time. */
    readonly lockService: ILockService;
    readonly pollingIntervalMs?: number;
    readonly reorgDepth?: number;
}

/**
 * Common scaffolding for every event indexer:
 *  - boot from the persisted checkpoint (or `head - DEFAULT_LOOKBACK` on first run)
 *  - poll new blocks, leaving `REORG_DEPTH` blocks under the head untouched
 *  - split the backlog into `MAX_BLOCKS_PER_BATCH` chunks (public RPC caps)
 *  - hand each chunk's logs to `processBatch`, which subclasses implement
 *  - persist the new checkpoint after each successful chunk
 *
 * Crash recovery: a failure in the middle of a batch leaves the checkpoint
 * unchanged, so the next tick replays the same range. Combined with the
 * (txHash, logIndex) idempotency on every domain row, the reprocess is safe.
 */
export abstract class BaseIndexer {
    protected readonly client: PublicClient;
    protected readonly checkpoints: IIndexerCheckpointRepository;
    protected readonly indexerName: string;
    protected readonly contractAddress: string | undefined;
    private readonly pollingIntervalMs: number;
    private readonly reorgDepth: number;
    private readonly lockService: ILockService;
    private readonly lockKey: string;
    private readonly lockTtlSeconds: number;
    private isRunning = false;
    private pollingTimer: ReturnType<typeof setInterval> | null = null;
    private inFlight = false;

    protected constructor(options: BaseIndexerOptions) {
        this.client            = options.client;
        this.checkpoints       = options.checkpoints;
        this.indexerName       = options.name;
        this.contractAddress   = options.contractAddress;
        this.pollingIntervalMs = options.pollingIntervalMs ?? POLLING_INTERVAL_MS;
        this.reorgDepth        = options.reorgDepth ?? REORG_DEPTH;
        this.lockService       = options.lockService;
        const lockConfig       = indexerLockConfig(options.name);
        this.lockKey           = lockConfig.key;
        this.lockTtlSeconds    = lockConfig.ttlSeconds;
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            logger.warn(`${this.indexerName}: already running`);
            return;
        }
        this.isRunning = true;
        logger.info(`${this.indexerName}: starting`, { contractAddress: this.contractAddress });

        try {
            await this.runBatch();
        } catch (err) {
            logger.error(`${this.indexerName}: initial batch failed`, {
                error: err instanceof Error ? err.message : String(err),
            });
        }
        this.pollingTimer = setInterval(() => {
            void this.runBatch();
        }, this.pollingIntervalMs);
    }

    stop(): void {
        if (!this.isRunning) return;
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        }
        this.isRunning = false;
        logger.info(`${this.indexerName}: stopped`);
    }

    /** Subclass hook: process a batch of logs. May be empty. */
    protected abstract processBatch(fromBlock: bigint, toBlock: bigint): Promise<void>;

    private async runBatch(): Promise<void> {
        if (this.inFlight) return;
        this.inFlight = true;
        try {
            // Distributed guard: under multi-instance worker scale, two
            // processes ticking at the same time would race on the cursor.
            // The lock's watchdog renews automatically while we work.
            const outcome = await this.lockService.withLock({
                key: this.lockKey,
                ttlSeconds: this.lockTtlSeconds,
                onContention: 'skip',
                onAcquired: async () => this.advanceCursorOnce(),
            });
            if (!outcome.ran) {
                logger.debug(`${this.indexerName}: lock taken by another instance, skipping tick`);
            }
        } catch (err) {
            logger.error(`${this.indexerName}: batch failed`, {
                error: err instanceof Error ? err.message : String(err),
            });
        } finally {
            this.inFlight = false;
        }
    }

    private async advanceCursorOnce(): Promise<void> {
        const head = await this.client.getBlockNumber();
        const safeHead = head > BigInt(this.reorgDepth) ? head - BigInt(this.reorgDepth) : BigInt(0);

        const stored = await this.checkpoints.getLastBlock(this.indexerName);
        const fromBlock = stored > BigInt(0)
            ? stored + BigInt(1)
            : (safeHead > DEFAULT_LOOKBACK_BLOCKS ? safeHead - DEFAULT_LOOKBACK_BLOCKS : BigInt(0));

        if (fromBlock > safeHead) return;

        const backlog = safeHead - fromBlock + BigInt(1);
        if (backlog > MAX_BLOCKS_PER_BATCH) {
            logger.info(`${this.indexerName}: catching up in chunks`, {
                fromBlock: fromBlock.toString(),
                safeHead: safeHead.toString(),
                backlogBlocks: backlog.toString(),
            });
        }

        // A failure mid-backlog leaves the checkpoint at the last completed
        // chunk; the next tick resumes from there.
        let from = fromBlock;
        while (from <= safeHead) {
            const chunkEnd = from + MAX_BLOCKS_PER_BATCH - BigInt(1);
            const to = chunkEnd < safeHead ? chunkEnd : safeHead;
            await this.processBatch(from, to);
            await this.checkpoints.setLastBlock(this.indexerName, to, this.contractAddress);
            from = to + BigInt(1);
        }
    }

    /**
     * Helper for subclasses: read the block timestamp once per tx, cached
     * inside a single batch (a typical batch has many logs from few blocks).
     */
    protected async resolveBlockTimestamps(logs: ReadonlyArray<Log>): Promise<Map<bigint, Date>> {
        const seen = new Set<bigint>();
        for (const log of logs) {
            if (log.blockNumber !== null && log.blockNumber !== undefined) seen.add(log.blockNumber);
        }
        const out = new Map<bigint, Date>();
        await Promise.all(
            Array.from(seen).map(async (blockNumber) => {
                const block = await this.client.getBlock({ blockNumber });
                out.set(blockNumber, new Date(Number(block.timestamp) * 1000));
            }),
        );
        return out;
    }
}
