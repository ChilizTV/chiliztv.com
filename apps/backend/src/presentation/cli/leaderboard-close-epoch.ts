import 'reflect-metadata';
import { config } from 'dotenv';
config();

import { setupDependencyInjection, container } from '../../di/container';
setupDependencyInjection();

import {
    createPublicClient,
    createWalletClient,
    http,
    type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { chainFor } from '@chiliztv/blockchain';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import type { ILeaderboardScoreRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardScoreRepository';
import type { ILeaderboardEpochRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardEpochRepository';
import { networkType } from '../../infrastructure/config/chiliz.config';
import { logger } from '../../infrastructure/logging/logger';
import { buildMerkleArtifacts } from '../../application/leaderboard/merkle/merkleTree';

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
] as const;

/**
 * Distribution policy — top-N pro-rata of `total_score`. Tweak by editing
 * `TOP_N` / the weighting curve. The CLI is admin-only and the contract
 * snapshots the prize pool from its own balance at `closeEpoch` time, so
 * mis-allocations here only affect the distribution proportions, never the
 * total amount transferred.
 */
const TOP_N = Number(process.env.LEADERBOARD_TOP_N ?? 10);
const CLAIM_DURATION_DAYS = Number(process.env.LEADERBOARD_CLAIM_DURATION_DAYS ?? 7);

import { buildAllocations } from '../../application/leaderboard/buildAllocations';

async function main(): Promise<void> {
    const network = container.resolve<INetworkConfig>(TOKENS.INetworkConfig);
    const scoreRepo = container.resolve<ILeaderboardScoreRepository>(TOKENS.ILeaderboardScoreRepository);
    const epochRepo = container.resolve<ILeaderboardEpochRepository>(TOKENS.ILeaderboardEpochRepository);

    const pk = network.adminPrivateKey;
    if (!pk || !pk.startsWith('0x') || pk.length !== 66) {
        throw new Error('ADMIN_PRIVATE_KEY missing or malformed');
    }
    const leaderboardAddress = network.leaderboardRewardsAddress as Hex;
    if (!leaderboardAddress) {
        throw new Error('LEADERBOARD_REWARDS_ADDRESS missing in env');
    }

    const account = privateKeyToAccount(pk as Hex);
    const chain = chainFor(networkType);
    const publicClient = createPublicClient({ chain, transport: http(network.rpcUrl) });
    const walletClient = createWalletClient({ chain, transport: http(network.rpcUrl), account });

    logger.info('leaderboard:close-epoch — building distribution', { topN: TOP_N });

    // 1. Snapshot the top-N scores.
    const top = await scoreRepo.getTopN(TOP_N);
    if (top.length === 0) {
        logger.warn('No scores to distribute — aborting');
        process.exit(1);
    }

    // 2. Pro-rata distribution.
    const allocations = buildAllocations(
        top.map((s) => ({ userAddress: s.userAddress, totalScore: s.totalScore })),
    );
    if (allocations.length === 0) {
        logger.warn('All scores are zero — aborting');
        process.exit(1);
    }

    // 3. Build the merkle tree.
    const artifacts = buildMerkleArtifacts(allocations);
    logger.info('Merkle artifacts built', {
        leaves: allocations.length,
        root: artifacts.root,
    });

    const claimDurationSec = BigInt(CLAIM_DURATION_DAYS * 24 * 60 * 60);

    // 4. Sign + send the closeEpoch tx (no wait yet).
    const txHash = await walletClient.writeContract({
        address: leaderboardAddress,
        abi: LEADERBOARD_ABI,
        functionName: 'closeEpoch',
        args: [artifacts.root, claimDurationSec],
        chain,
    });
    logger.info('closeEpoch tx broadcast', { txHash });

    // 5. INSERT pending row immediately so a tx revert doesn't make us lose
    //    the leaves (we need them to rebuild proofs even if it rolls over).
    await epochRepo.insertPending({
        txHash,
        merkleRoot: artifacts.root,
        leaves: allocations.map((a) => ({ userAddress: a.user, amount: a.amount })),
    });
    logger.info('pending epoch row inserted', { txHash });

    // 6. Wait for confirmation. The indexer flips status='confirmed' on
    //    `EpochClosed` — we don't update here to avoid a write race.
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') {
        logger.error('closeEpoch tx reverted', { txHash, status: receipt.status });
        process.exit(1);
    }

    logger.info('closeEpoch tx confirmed — indexer will flip status to confirmed', {
        txHash,
        blockNumber: receipt.blockNumber.toString(),
    });
    process.exit(0);
}

main().catch((err) => {
    logger.error('leaderboard:close-epoch failed', {
        error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
});
