import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, type PublicClient } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../../infrastructure/config/chiliz.config';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ILeaderboardEpochRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardEpochRepository';
import type { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';

const LEADERBOARD_ABI = [
    {
        type: 'function',
        name: 'pendingClaim',
        inputs: [{ name: 'epochId', type: 'uint256' }, { name: 'user', type: 'address' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'hasClaimed',
        inputs: [{ name: 'epochId', type: 'uint256' }, { name: 'user', type: 'address' }],
        outputs: [{ type: 'bool' }],
        stateMutability: 'view',
    },
] as const;

export interface ClaimableEpochEntry {
    readonly epochId: number;
    /** USDC raw — on-chain pro-rata preview from `pendingClaim`. */
    readonly amount: string;
    readonly claimExpiry: string;
    readonly alreadyClaimed: boolean;
}

export interface GetMyClaimableEpochsResult {
    readonly userAddress: string;
    readonly epochs: ReadonlyArray<ClaimableEpochEntry>;
}

/**
 * V2 claimables: eligibility lives on-chain (`pendingClaim` / `hasClaimed`),
 * no merkle proofs. The DB only narrows the candidate set to confirmed
 * epochs whose claim window is still open.
 */
@injectable()
export class GetMyClaimableEpochsUseCase {
    private readonly client: PublicClient;
    private readonly leaderboardAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.ILeaderboardEpochRepository)
        private readonly epochRepo: ILeaderboardEpochRepository,
        @inject(TOKENS.INetworkConfig)
        network: INetworkConfig,
        @inject(TOKENS.IClock)
        private readonly clock: IClock,
    ) {
        this.client = createPublicClient({
            chain: chainFor(networkType),
            transport: http(network.rpcUrl),
        });
        this.leaderboardAddress = network.leaderboardRewardsAddress as `0x${string}`;
    }

    async execute(userAddress: string): Promise<GetMyClaimableEpochsResult> {
        const normalized = userAddress.toLowerCase() as `0x${string}`;
        const now = this.clock.now();
        const windows = await this.epochRepo.findOpenClaimWindows(now);

        const entries = await Promise.all(
            windows.map(async (epoch) => {
                if (epoch.epochId === null) return null;
                const [pending, claimed] = await Promise.all([
                    this.client.readContract({
                        address: this.leaderboardAddress,
                        abi: LEADERBOARD_ABI,
                        functionName: 'pendingClaim',
                        args: [epoch.epochId, normalized],
                    }),
                    this.client.readContract({
                        address: this.leaderboardAddress,
                        abi: LEADERBOARD_ABI,
                        functionName: 'hasClaimed',
                        args: [epoch.epochId, normalized],
                    }),
                ]);
                if (pending === BigInt(0) && !claimed) return null;
                return {
                    epochId: Number(epoch.epochId),
                    amount: pending.toString(),
                    claimExpiry: (epoch.claimExpiry ?? now).toISOString(),
                    alreadyClaimed: Boolean(claimed),
                } satisfies ClaimableEpochEntry;
            }),
        );

        return {
            userAddress: normalized,
            epochs: entries.filter((e): e is ClaimableEpochEntry => e !== null),
        };
    }
}
