import { injectable, inject } from 'tsyringe';
import {
    createPublicClient,
    createWalletClient,
    http,
    type Hex,
    type PublicClient,
    type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { chainFor } from '@chiliztv/blockchain';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import type { ILeaderboardScoreRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardScoreRepository';
import type { ILeaderboardEpochRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardEpochRepository';
import { networkType } from '../../../infrastructure/config/chiliz.config';
import { logger } from '../../../infrastructure/logging/logger';
import { buildAllocations } from '../buildAllocations';
import { buildMerkleArtifacts } from '../merkle/merkleTree';

const LEADERBOARD_ABI = [
    {
        type: 'function',
        name: 'closeEpoch',
        inputs: [
            { name: 'merkleRoot', type: 'bytes32' },
            { name: 'claimDuration', type: 'uint256' },
        ],
        outputs: [{ name: 'closedId', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'epochIndex',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

const ZERO_ROOT = ('0x' + '0'.repeat(64)) as Hex;

export interface CloseEpochInput {
    /** When true, close even if the current cycle has no winners (cron path). */
    readonly allowEmpty: boolean;
}

export interface CloseEpochResult {
    readonly txHash: Hex;
    readonly merkleRoot: Hex;
    readonly leavesCount: number;
}

/**
 * Snapshot the current cycle's top-N from `leaderboard_cycle_scores`, build
 * the merkle distribution, broadcast `closeEpoch` on-chain, and persist a
 * pending row so the indexer can promote it to `confirmed` on `EpochClosed`.
 *
 * Shared by the manual CLI (`pnpm leaderboard:close-epoch`, allowEmpty=false)
 * and the monthly cron (`CloseMonthlyEpochJob`, allowEmpty=true). The cron
 * path closes with `merkleRoot = 0x0` when no winners exist, so the unused
 * pool rolls forward to the next cycle via `rolloverEpoch` 7 days later.
 */
@injectable()
export class CloseEpochUseCase {
    private readonly topN = Number(process.env.LEADERBOARD_TOP_N ?? 10);
    private readonly claimDurationDays = Number(process.env.LEADERBOARD_CLAIM_DURATION_DAYS ?? 7);

    constructor(
        @inject(TOKENS.ILeaderboardScoreRepository)
        private readonly scoreRepo: ILeaderboardScoreRepository,
        @inject(TOKENS.ILeaderboardEpochRepository)
        private readonly epochRepo: ILeaderboardEpochRepository,
        @inject(TOKENS.INetworkConfig)
        private readonly network: INetworkConfig,
    ) {}

    async execute(input: CloseEpochInput): Promise<CloseEpochResult> {
        const { publicClient, walletClient, address } = this.makeClients();

        const currentCycle = await this.readEpochIndex(publicClient, address);
        const top = await this.scoreRepo.getTopNForCycle(currentCycle, this.topN);

        if (top.length === 0) {
            if (!input.allowEmpty) {
                throw new Error(
                    `No scores to distribute for cycle ${currentCycle.toString()} — aborting`,
                );
            }
            // Cron path: close with empty root so the pool rolls forward.
            logger.info('CloseEpoch: no winners — closing with zero root', {
                cycleId: currentCycle.toString(),
            });
            return this.broadcastAndPersist(walletClient, publicClient, address, ZERO_ROOT, []);
        }

        const allocations = buildAllocations(
            top.map((s) => ({ userAddress: s.userAddress, totalScore: s.totalScore })),
        );
        if (allocations.length === 0) {
            if (!input.allowEmpty) {
                throw new Error('All cycle scores are zero — aborting');
            }
            logger.info('CloseEpoch: all scores zero — closing with zero root', {
                cycleId: currentCycle.toString(),
            });
            return this.broadcastAndPersist(walletClient, publicClient, address, ZERO_ROOT, []);
        }

        const artifacts = buildMerkleArtifacts(allocations);
        logger.info('CloseEpoch: merkle artifacts built', {
            cycleId: currentCycle.toString(),
            leaves: allocations.length,
            root: artifacts.root,
        });

        return this.broadcastAndPersist(
            walletClient,
            publicClient,
            address,
            artifacts.root,
            allocations.map((a) => ({ userAddress: a.user, amount: a.amount })),
        );
    }

    private makeClients(): { publicClient: PublicClient; walletClient: WalletClient; address: Hex } {
        const pk = this.network.adminPrivateKey;
        if (!pk || !pk.startsWith('0x') || pk.length !== 66) {
            throw new Error('ADMIN_PRIVATE_KEY missing or malformed');
        }
        const address = this.network.leaderboardRewardsAddress as Hex;
        if (!address) {
            throw new Error('LEADERBOARD_REWARDS_ADDRESS missing in env');
        }
        const chain = chainFor(networkType);
        const account = privateKeyToAccount(pk as Hex);
        return {
            publicClient: createPublicClient({ chain, transport: http(this.network.rpcUrl) }),
            walletClient: createWalletClient({ chain, transport: http(this.network.rpcUrl), account }),
            address,
        };
    }

    private async readEpochIndex(client: PublicClient, address: Hex): Promise<bigint> {
        return (await client.readContract({
            address,
            abi: LEADERBOARD_ABI,
            functionName: 'epochIndex',
        })) as bigint;
    }

    private async broadcastAndPersist(
        walletClient: WalletClient,
        publicClient: PublicClient,
        address: Hex,
        merkleRoot: Hex,
        leaves: ReadonlyArray<{ userAddress: string; amount: bigint }>,
    ): Promise<CloseEpochResult> {
        const claimDurationSec = BigInt(this.claimDurationDays * 24 * 60 * 60);

        const txHash = await walletClient.writeContract({
            address,
            abi: LEADERBOARD_ABI,
            functionName: 'closeEpoch',
            args: [merkleRoot, claimDurationSec],
            chain: chainFor(networkType),
            account: walletClient.account!,
        });
        logger.info('CloseEpoch: tx broadcast', { txHash });

        // INSERT pending row before waiting — leaves must survive a revert.
        await this.epochRepo.insertPending({ txHash, merkleRoot, leaves });

        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        if (receipt.status !== 'success') {
            throw new Error(`closeEpoch tx reverted: ${txHash}`);
        }
        logger.info('CloseEpoch: confirmed', {
            txHash,
            blockNumber: receipt.blockNumber.toString(),
            leavesCount: leaves.length,
        });

        return { txHash, merkleRoot, leavesCount: leaves.length };
    }
}
