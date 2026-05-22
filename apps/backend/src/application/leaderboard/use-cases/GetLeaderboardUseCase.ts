import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, type PublicClient } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../../infrastructure/config/chiliz.config';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ILeaderboardScoreRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardScoreRepository';
import type { ILeaderboardEpochRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardEpochRepository';
import type { IBetRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IBetRepository';
import type { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';

const LEADERBOARD_ABI = [
    {
        type: 'function',
        name: 'openPrizePool',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'epochIndex',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

export interface LeaderboardEntryDto {
    readonly rank: number;
    readonly userAddress: string;
    readonly totalScore: string;
}

export interface GetLeaderboardResult {
    readonly entries: ReadonlyArray<LeaderboardEntryDto>;
    readonly currentPrizePool: string;
    readonly currentEpochId: number | null;
    /** USDC raw — SUM(stake_amount) since the latest confirmed epoch close. */
    readonly currentEpochVolume: string;
}

const CACHE_TTL_SECONDS = 30;

@injectable()
export class GetLeaderboardUseCase {
    private readonly client: PublicClient;
    private readonly leaderboardAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.ILeaderboardScoreRepository)
        private readonly scoreRepo: ILeaderboardScoreRepository,
        @inject(TOKENS.ILeaderboardEpochRepository)
        private readonly epochRepo: ILeaderboardEpochRepository,
        @inject(TOKENS.IBetRepository)
        private readonly betRepo: IBetRepository,
        @inject(TOKENS.INetworkConfig)
        network: INetworkConfig,
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
    ) {
        this.client = createPublicClient({
            chain: chainFor(networkType),
            transport: http(network.rpcUrl),
        });
        this.leaderboardAddress = network.leaderboardRewardsAddress as `0x${string}`;
    }

    async execute(limit: number): Promise<GetLeaderboardResult> {
        const clampedLimit = Math.max(1, Math.min(limit, 500));
        const cacheKey = `leaderboard:top:${clampedLimit}`;
        const cached = await this.cache.get<GetLeaderboardResult>(cacheKey);
        if (cached.hit) return cached.value;

        const [topScores, prizePool, epochIndex, epochVolume] = await Promise.all([
            this.scoreRepo.getTopN(clampedLimit),
            this.readPrizePool(),
            this.readEpochIndex(),
            this.readCurrentEpochVolume(),
        ]);

        const result: GetLeaderboardResult = {
            entries: topScores.map((s) => ({
                rank: s.rank,
                userAddress: s.userAddress,
                totalScore: s.totalScore.toString(),
            })),
            currentPrizePool: prizePool.toString(),
            currentEpochId: epochIndex > BigInt(0) ? Number(epochIndex) : null,
            currentEpochVolume: epochVolume.toString(),
        };
        await this.cache.set(cacheKey, result, CACHE_TTL_SECONDS);
        return result;
    }

    /**
     * SUM(stake_amount) since the latest confirmed epoch close — or
     * all-time when no epoch has closed yet (epoch boundary = Unix epoch).
     */
    private async readCurrentEpochVolume(): Promise<bigint> {
        const since = (await this.epochRepo.findLatestConfirmedClosedAt()) ?? new Date(0);
        return this.betRepo.sumStakeAmountSince(since);
    }

    private async readPrizePool(): Promise<bigint> {
        try {
            return (await this.client.readContract({
                address: this.leaderboardAddress,
                abi: LEADERBOARD_ABI,
                functionName: 'openPrizePool',
            })) as bigint;
        } catch {
            return BigInt(0);
        }
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
