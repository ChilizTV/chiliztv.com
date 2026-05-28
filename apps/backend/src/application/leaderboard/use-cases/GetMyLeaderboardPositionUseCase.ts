import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, type PublicClient } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ILeaderboardScoreRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardScoreRepository';
import type { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { networkType } from '../../../infrastructure/config/chiliz.config';

const LEADERBOARD_ABI = [
    {
        type: 'function',
        name: 'epochIndex',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

export interface MyLeaderboardPositionResult {
    readonly userAddress: string;
    readonly rank: number | null;
    /** Score for the current cycle (resets at each cycle close). */
    readonly totalScore: string;
}

@injectable()
export class GetMyLeaderboardPositionUseCase {
    private readonly client: PublicClient;
    private readonly leaderboardAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.ILeaderboardScoreRepository)
        private readonly scoreRepo: ILeaderboardScoreRepository,
        @inject(TOKENS.INetworkConfig)
        network: INetworkConfig,
    ) {
        this.client = createPublicClient({
            chain: chainFor(networkType),
            transport: http(network.rpcUrl),
        });
        this.leaderboardAddress = network.leaderboardRewardsAddress as `0x${string}`;
    }

    async execute(userAddress: string): Promise<MyLeaderboardPositionResult> {
        const normalized = userAddress.toLowerCase();
        const currentCycle = await this.readEpochIndex();
        const [score, rank] = await Promise.all([
            this.scoreRepo.getCycleScoreForUser(currentCycle, normalized),
            this.scoreRepo.getCycleRank(currentCycle, normalized),
        ]);
        return {
            userAddress: normalized,
            rank,
            totalScore: (score?.totalScore ?? BigInt(0)).toString(),
        };
    }

    private async readEpochIndex(): Promise<bigint> {
        try {
            return (await this.client.readContract({
                address: this.leaderboardAddress,
                abi: LEADERBOARD_ABI,
                functionName: 'epochIndex',
            })) as bigint;
        } catch {
            return BigInt(0);
        }
    }
}
