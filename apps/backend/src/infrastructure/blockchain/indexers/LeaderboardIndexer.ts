import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../config/chiliz.config';
import { logger } from '../../logging/logger';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import type { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import type { ILeaderboardScoreRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardScoreRepository';
import type { ILeaderboardEpochRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardEpochRepository';
import type { ILeaderboardClaimRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardClaimRepository';
import { BaseIndexer } from './BaseIndexer';

// V2 (post `UpgradeLeaderboard.s.sol`) event signatures. The contract no
// longer emits merkle roots or cumulative `newScore` — scores are per-epoch
// and the contract self-advances at the boundary.
const WIN_RECORDED = parseAbiItem(
    'event WinRecorded(address indexed match_, address indexed user, uint256 indexed epochId, uint256 delta, uint256 newEpochScore)',
);
const EPOCH_ADVANCED = parseAbiItem(
    'event EpochAdvanced(uint256 indexed closedId, uint256 prizePool, uint256 totalScore, uint64 closedAt, uint64 claimExpiry)',
);
const PRIZE_CLAIMED = parseAbiItem(
    'event PrizeClaimed(uint256 indexed epochId, address indexed user, uint256 amount)',
);
const EPOCH_ROLLED_OVER = parseAbiItem(
    'event EpochRolledOver(uint256 indexed epochId, uint256 rolledOver)',
);

const ALL_EVENTS = [WIN_RECORDED, EPOCH_ADVANCED, PRIZE_CLAIMED, EPOCH_ROLLED_OVER];

/**
 * Reads `LeaderboardRewards` V2 events into the leaderboard tables.
 *
 *  - WinRecorded     → increment `leaderboard_scores` for the user (the V1
 *                      cumulative `total_score` semantics are kept for the
 *                      ladder display; per-epoch isolation is enforced by
 *                      the contract via auto-advance and pro-rata claims).
 *  - EpochAdvanced   → upsert the epoch row as `confirmed` with the
 *                      contract-supplied `prizePool` / `totalScore` /
 *                      `claimExpiry`. There is no pre-CLI pending row in V2;
 *                      the contract is the sole source of truth.
 *  - PrizeClaimed    → INSERT into `leaderboard_claims`.
 *  - EpochRolledOver → mark the epoch `rolled_over`.
 *
 * Pro-rata claim amounts are NOT computed by this indexer — they're derived
 * on the fly by `GetMyClaimableEpochsUseCase` from `(epochScore, totalScore,
 * prizePool)`, all of which are exposed by view functions on the contract.
 */
@injectable()
export class LeaderboardIndexer extends BaseIndexer {
    private readonly leaderboardAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.IIndexerCheckpointRepository)
        checkpoints: IIndexerCheckpointRepository,
        @inject(TOKENS.INetworkConfig)
        private readonly network: INetworkConfig,
        @inject(TOKENS.ILockService)
        lockService: ILockService,
        @inject(TOKENS.ILeaderboardScoreRepository)
        private readonly scoreRepo: ILeaderboardScoreRepository,
        @inject(TOKENS.ILeaderboardEpochRepository)
        private readonly epochRepo: ILeaderboardEpochRepository,
        @inject(TOKENS.ILeaderboardClaimRepository)
        private readonly claimRepo: ILeaderboardClaimRepository,
    ) {
        const address = network.leaderboardRewardsAddress as `0x${string}`;
        super({
            name: 'Leaderboard',
            contractAddress: address,
            client: createPublicClient({
                chain: chainFor(networkType),
                transport: http(network.rpcUrl),
            }),
            checkpoints,
            lockService,
        });
        this.leaderboardAddress = address;
    }

    protected async processBatch(fromBlock: bigint, toBlock: bigint): Promise<void> {
        const logs = await this.client.getLogs({
            address: this.leaderboardAddress,
            events: ALL_EVENTS,
            fromBlock,
            toBlock,
        });
        if (logs.length === 0) return;

        const tsCache = await this.resolveBlockTimestamps(logs);

        for (const log of logs) {
            const eventName = (log as { eventName?: string }).eventName;
            const args = (log as { args?: Record<string, unknown> }).args;
            if (!eventName || !args) continue;
            try {
                switch (eventName) {
                    case 'WinRecorded':
                        await this.handleWinRecorded(args);
                        break;
                    case 'EpochAdvanced':
                        await this.handleEpochAdvanced(log, args, tsCache);
                        break;
                    case 'PrizeClaimed':
                        await this.handlePrizeClaimed(log, args, tsCache);
                        break;
                    case 'EpochRolledOver':
                        await this.handleEpochRolledOver(args, log, tsCache);
                        break;
                }
            } catch (err) {
                logger.error(`${this.indexerName}: failed to process log`, {
                    eventName,
                    txHash: log.transactionHash,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }

    private async handleWinRecorded(args: Record<string, unknown>): Promise<void> {
        const user = (args.user as string).toLowerCase();
        const delta = BigInt(args.delta as bigint);
        await this.scoreRepo.upsertScore(user, delta);
    }

    private async handleEpochAdvanced(
        log: Log,
        args: Record<string, unknown>,
        tsCache: Map<bigint, Date>,
    ): Promise<void> {
        const txHash = (log.transactionHash ?? '').toLowerCase();
        const epochId = BigInt(args.closedId as bigint);
        const prizePool = BigInt(args.prizePool as bigint);
        const claimExpirySec = Number(args.claimExpiry as bigint);
        // V2 contract has no pending state. Synthesize a pending row first so
        // `markConfirmed` (which patches an existing PK) succeeds. The
        // synthetic row carries the V2 `total_score` in the `merkle_root`
        // text column until the schema migration moves it to a dedicated
        // column — the repo layer still treats this as opaque.
        const totalScore = BigInt(args.totalScore as bigint);
        const closedAt = log.blockNumber !== null && log.blockNumber !== undefined
            ? tsCache.get(log.blockNumber) ?? new Date()
            : new Date();

        try {
            await this.epochRepo.markConfirmed({
                txHash,
                epochId,
                prizePool,
                claimExpiry: new Date(claimExpirySec * 1000),
                closedAt,
            });
            logger.info(`${this.indexerName}: epoch advanced`, {
                epochId: epochId.toString(),
                txHash,
                totalScore: totalScore.toString(),
            });
        } catch (err) {
            // No matching pending row — V2 contract self-advances without a
            // CLI step, so we always need to insert before patching.
            logger.warn(`${this.indexerName}: synthesising pending row before confirm`, {
                epochId: epochId.toString(),
                txHash,
                error: err instanceof Error ? err.message : String(err),
            });
            await this.epochRepo.insertPending({
                txHash,
                // Stash totalScore in the merkle_root text column until the
                // V2 schema migration adds a dedicated total_score column.
                merkleRoot: `v2:totalScore=${totalScore.toString()}`,
                leaves: [],
            });
            await this.epochRepo.markConfirmed({
                txHash,
                epochId,
                prizePool,
                claimExpiry: new Date(claimExpirySec * 1000),
                closedAt,
            });
        }
    }

    private async handlePrizeClaimed(
        log: Log,
        args: Record<string, unknown>,
        tsCache: Map<bigint, Date>,
    ): Promise<void> {
        const epochId = BigInt(args.epochId as bigint);
        const user = (args.user as string).toLowerCase();
        const amount = BigInt(args.amount as bigint);
        const claimedAt = log.blockNumber !== null && log.blockNumber !== undefined
            ? tsCache.get(log.blockNumber) ?? new Date()
            : new Date();

        await this.claimRepo.insertIfAbsent({
            epochId,
            userAddress: user,
            amount,
            claimedAt,
            txHash: (log.transactionHash ?? '').toLowerCase(),
        });
    }

    private async handleEpochRolledOver(
        args: Record<string, unknown>,
        log: Log,
        tsCache: Map<bigint, Date>,
    ): Promise<void> {
        const epochId = BigInt(args.epochId as bigint);
        const rolledOver = BigInt(args.rolledOver as bigint);
        const ts = log.blockNumber !== null && log.blockNumber !== undefined
            ? tsCache.get(log.blockNumber) ?? new Date()
            : new Date();
        await this.epochRepo.markRolledOver(epochId, rolledOver, ts);
    }
}
