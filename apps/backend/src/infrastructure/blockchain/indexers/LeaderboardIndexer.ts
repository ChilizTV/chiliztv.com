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

// Signatures MUST match LeaderboardRewards.sol V2 — a drifted parameter
// list changes topic0 and the getLogs filter silently matches nothing
// (incident 2026-06-11: V1 WinRecorded signature, empty board after claims).
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
 * Reads `LeaderboardRewards` V2 events into the three leaderboard tables.
 *
 *  - WinRecorded     → increment `leaderboard_scores` (lifetime + per-epoch;
 *                      the cycle comes from the event's own `epochId`)
 *  - EpochAdvanced   → record the closed epoch as confirmed (V2 advanceEpoch
 *                      is permissionless — no pending CLI row, no merkle)
 *  - PrizeClaimed    → INSERT into `leaderboard_claims`
 *  - EpochRolledOver → flip the epoch row to `status='rolled_over'`
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

        // CRITICAL: viem does not guarantee cross-block ordering. Sort explicitly
        // so EpochClosed events are processed in chain order vs WinRecorded events
        // from the same / adjacent blocks — otherwise cycle_id attribution drifts.
        logs.sort((a, b) => {
            const blockDiff = a.blockNumber !== b.blockNumber
                ? Number((a.blockNumber ?? 0n) - (b.blockNumber ?? 0n))
                : 0;
            if (blockDiff !== 0) return blockDiff;
            return (a.logIndex ?? 0) - (b.logIndex ?? 0);
        });

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
                        await this.handleEpochAdvanced(log, args);
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
        // V2 scopes scores per epoch on-chain — the event carries its epochId,
        // so cycle attribution never depends on read-at-batch-start state.
        const epochId = BigInt(args.epochId as bigint);
        // Dual-write: lifetime cumulative + per-cycle. The lifetime row is
        // kept for an eventual Hall of Fame surface (cf. plan §1 context).
        await this.scoreRepo.upsertScore(user, delta);
        await this.scoreRepo.upsertCycleScore(epochId, user, delta);
    }

    private async handleEpochAdvanced(
        log: Log,
        args: Record<string, unknown>,
    ): Promise<void> {
        const txHash = (log.transactionHash ?? '').toLowerCase();
        const closedId = BigInt(args.closedId as bigint);
        const prizePool = BigInt(args.prizePool as bigint);
        const claimExpiry = new Date(Number(args.claimExpiry as bigint) * 1000);
        const closedAt = new Date(Number(args.closedAt as bigint) * 1000);

        // V2 advanceEpoch is permissionless: there is never a pending CLI row.
        // Insert-then-confirm reuses the V1 schema's ghost path; the insert is
        // wrapped so a re-indexed range (tx_hash PK conflict) stays idempotent.
        try {
            await this.epochRepo.insertPending({ txHash, merkleRoot: '0x', leaves: [] });
        } catch {
            // Row already exists — re-indexed range.
        }
        await this.epochRepo.markConfirmed({
            txHash,
            epochId: closedId,
            prizePool,
            claimExpiry,
            closedAt,
        });
        logger.info(`${this.indexerName}: epoch advanced`, { epochId: closedId.toString(), txHash });
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
