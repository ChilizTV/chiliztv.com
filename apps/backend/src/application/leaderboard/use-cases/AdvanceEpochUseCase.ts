import { injectable, inject } from 'tsyringe';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount, nonceManager } from 'viem/accounts';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../../infrastructure/config/chiliz.config';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ILeaderboardEpochRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardEpochRepository';
import type { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { logger } from '../../../infrastructure/logging/logger';

const LEADERBOARD_ABI = [
    { type: 'function', name: 'epochStartTime', inputs: [], outputs: [{ type: 'uint64' }], stateMutability: 'view' },
    { type: 'function', name: 'epochDuration', inputs: [], outputs: [{ type: 'uint64' }], stateMutability: 'view' },
    { type: 'function', name: 'advanceEpoch', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'rolloverEpoch', inputs: [{ name: 'epochId', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'nonpayable' },
] as const;

export interface AdvanceEpochResult {
    readonly advanced: boolean;
    readonly rolledOver: number;
}

/**
 * V2 epoch upkeep. `advanceEpoch` is permissionless and lazily triggered by
 * `recordWin`, but a quiet period after the boundary would leave the epoch
 * open — this call forces the advance. Also sweeps `rolloverEpoch` on closed
 * epochs whose claim window expired (unclaimed funds return to the pool).
 */
@injectable()
export class AdvanceEpochUseCase {
    private readonly publicClient: PublicClient;
    private readonly walletClient;
    private readonly leaderboardAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.ILeaderboardEpochRepository)
        private readonly epochRepo: ILeaderboardEpochRepository,
        @inject(TOKENS.INetworkConfig)
        network: INetworkConfig,
        @inject(TOKENS.IClock)
        private readonly clock: IClock,
    ) {
        const chain = chainFor(networkType);
        this.publicClient = createPublicClient({ chain, transport: http(network.rpcUrl) });
        const account = privateKeyToAccount(network.adminPrivateKey as `0x${string}`, { nonceManager });
        this.walletClient = createWalletClient({ account, chain, transport: http(network.rpcUrl) });
        this.leaderboardAddress = network.leaderboardRewardsAddress as `0x${string}`;
    }

    async execute(): Promise<AdvanceEpochResult> {
        const advanced = await this.advanceIfDue();
        const rolledOver = await this.rolloverExpired();
        return { advanced, rolledOver };
    }

    private async advanceIfDue(): Promise<boolean> {
        const [start, duration] = await Promise.all([
            this.publicClient.readContract({ address: this.leaderboardAddress, abi: LEADERBOARD_ABI, functionName: 'epochStartTime' }),
            this.publicClient.readContract({ address: this.leaderboardAddress, abi: LEADERBOARD_ABI, functionName: 'epochDuration' }),
        ]);
        const boundary = (Number(start) + Number(duration)) * 1000;
        if (this.clock.now().getTime() < boundary) return false;

        const { request } = await this.publicClient.simulateContract({
            account: this.walletClient.account,
            address: this.leaderboardAddress,
            abi: LEADERBOARD_ABI,
            functionName: 'advanceEpoch',
        });
        const hash = await this.walletClient.writeContract(request);
        await this.publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
        logger.info('Leaderboard epoch advanced', { txHash: hash });
        return true;
    }

    /** Rollover every confirmed epoch whose claim window expired. The indexer
     *  flips the DB status on EpochRolledOver, removing it from this sweep. */
    private async rolloverExpired(): Promise<number> {
        const expired = await this.epochRepo.findExpiredConfirmed(this.clock.now());
        let rolled = 0;
        for (const epoch of expired) {
            if (epoch.epochId === null) continue;
            try {
                const { request } = await this.publicClient.simulateContract({
                    account: this.walletClient.account,
                    address: this.leaderboardAddress,
                    abi: LEADERBOARD_ABI,
                    functionName: 'rolloverEpoch',
                    args: [epoch.epochId],
                });
                const hash = await this.walletClient.writeContract(request);
                await this.publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
                rolled++;
                logger.info('Leaderboard epoch rolled over', { epochId: epoch.epochId.toString(), txHash: hash });
            } catch (err) {
                // Nothing to roll or already rolled — simulation rejects, skip.
                logger.debug('rolloverEpoch skipped', {
                    epochId: epoch.epochId.toString(),
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
        return rolled;
    }
}
