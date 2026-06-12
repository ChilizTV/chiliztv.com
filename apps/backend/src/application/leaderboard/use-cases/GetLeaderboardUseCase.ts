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
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { ResolveUserProfilesBatchUseCase } from '../../users/use-cases/ResolveUserProfilesBatchUseCase';

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
    { type: 'function', name: 'epochStartTime', inputs: [], outputs: [{ type: 'uint64' }], stateMutability: 'view' },
    { type: 'function', name: 'epochDuration', inputs: [], outputs: [{ type: 'uint64' }], stateMutability: 'view' },
] as const;

export interface LeaderboardEntryDto {
    readonly rank: number;
    readonly userAddress: string;
    readonly totalScore: string;
    readonly username: string | null;
    readonly avatarUrl: string | null;
}

export interface GetLeaderboardResult {
    readonly entries: ReadonlyArray<LeaderboardEntryDto>;
    readonly currentPrizePool: string;
    readonly currentEpochId: number | null;
    /** USDC raw — SUM(stake_amount) since the latest confirmed epoch close. */
    readonly currentEpochVolume: string;
    /** Number of top-N winners the CLI distributes to — mirror of LEADERBOARD_TOP_N. */
    readonly topN: number;
    /** Claim window length applied at the next closeEpoch — mirror of LEADERBOARD_CLAIM_DURATION_DAYS. */
    readonly claimDurationDays: number;
    /** ISO 8601 UTC timestamp of the next scheduled cycle close. */
    readonly cycleEndsAt: string;
}

const CACHE_TTL_SECONDS = 30;

// Mirror of the CLI defaults (apps/backend/src/presentation/cli/leaderboard-close-epoch.ts).
// Reading env here keeps front, CLI, and backend in lockstep without an extra config service.
const DEFAULT_TOP_N = 10;
const DEFAULT_CLAIM_DURATION_DAYS = 7;

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
        @inject(TOKENS.IClock)
        private readonly clock: IClock,
        @inject(ResolveUserProfilesBatchUseCase)
        private readonly profiles: ResolveUserProfilesBatchUseCase,
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

        // Read current cycle first; per-cycle top-N depends on it.
        const epochIndex = await this.readEpochIndex();
        const currentCycle = epochIndex;

        const [topScores, prizePool, epochVolume] = await Promise.all([
            this.scoreRepo.getTopNForCycle(currentCycle, clampedLimit),
            this.readPrizePool(),
            this.readCurrentEpochVolume(),
        ]);

        const profileMap = topScores.length > 0
            ? await this.profiles.execute(topScores.map((s) => s.userAddress))
            : new Map();

        const result: GetLeaderboardResult = {
            entries: topScores.map((s) => {
                const profile = profileMap.get(s.userAddress.toLowerCase());
                return {
                    rank: s.rank,
                    userAddress: s.userAddress,
                    totalScore: s.totalScore.toString(),
                    username: profile?.username ?? null,
                    avatarUrl: profile?.avatarUrl ?? null,
                };
            }),
            currentPrizePool: prizePool.toString(),
            currentEpochId: Number(epochIndex),
            currentEpochVolume: epochVolume.toString(),
            topN: Number(process.env.LEADERBOARD_TOP_N ?? DEFAULT_TOP_N),
            claimDurationDays: Number(process.env.LEADERBOARD_CLAIM_DURATION_DAYS ?? DEFAULT_CLAIM_DURATION_DAYS),
            cycleEndsAt: (await this.readCycleEnd()).toISOString(),
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

    /** On-chain epoch boundary — V2 cycles are epochStartTime + epochDuration. */
    private async readCycleEnd(): Promise<Date> {
        try {
            const [start, duration] = await Promise.all([
                this.client.readContract({ address: this.leaderboardAddress, abi: LEADERBOARD_ABI, functionName: 'epochStartTime' }),
                this.client.readContract({ address: this.leaderboardAddress, abi: LEADERBOARD_ABI, functionName: 'epochDuration' }),
            ]);
            return new Date((Number(start) + Number(duration)) * 1000);
        } catch {
            // 30-day default duration from an unknown anchor — degraded estimate.
            return new Date(this.clock.now().getTime() + 30 * 24 * 60 * 60 * 1000);
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
