import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, type PublicClient } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { networkType } from '../../../infrastructure/config/chiliz.config';

/**
 * Minimal V2 ABI surface needed to compute claimable amounts from chain.
 * Inlined here rather than imported so this file stays decoupled from the
 * frontend's wagmi-generated artifacts.
 */
const LEADERBOARD_ABI = [
    {
        type: 'function',
        name: 'currentEpoch',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'epoch',
        inputs: [{ name: 'epochId', type: 'uint256' }],
        outputs: [
            {
                type: 'tuple',
                components: [
                    { name: 'startTime',   type: 'uint64' },
                    { name: 'closedAt',    type: 'uint64' },
                    { name: 'claimExpiry', type: 'uint64' },
                    { name: 'closed',      type: 'bool'   },
                    { name: 'prizePool',   type: 'uint256' },
                    { name: 'totalClaimed', type: 'uint256' },
                    { name: 'merkleRoot',  type: 'bytes32' },
                ],
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'pendingClaim',
        inputs: [
            { name: 'epochId', type: 'uint256' },
            { name: 'user',    type: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'hasClaimed',
        inputs: [
            { name: 'epochId', type: 'uint256' },
            { name: 'user',    type: 'address' },
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
    },
] as const;

export interface ClaimableEpochEntry {
    readonly epochId: number;
    /** Pro-rata payout in USDC base units (string-encoded bigint). */
    readonly amount: string;
    readonly claimExpiry: string;
    readonly alreadyClaimed: boolean;
}

export interface GetMyClaimableEpochsResult {
    readonly userAddress: string;
    readonly epochs: ReadonlyArray<ClaimableEpochEntry>;
}

/**
 * V2 implementation — reads the user's pro-rata share directly from the
 * `LeaderboardRewards` proxy. The contract is the source of truth for
 * amounts, expiry and claim state; the backend's role is purely to
 * enumerate the closed epochs to query and to surface the results in a
 * JSON-shaped DTO. No DB read required.
 *
 * Scan window: the last `MAX_LOOKBACK_EPOCHS` epochs preceding the open one.
 * For a 30-day epoch this covers ~10 months of history without spamming the
 * RPC; older epochs would have rolled over already and have nothing to claim.
 */
@injectable()
export class GetMyClaimableEpochsUseCase {
    private static readonly MAX_LOOKBACK_EPOCHS = 12;
    private readonly client: PublicClient;
    private readonly leaderboard: `0x${string}`;

    constructor(
        @inject(TOKENS.INetworkConfig)
        network: INetworkConfig,
    ) {
        this.leaderboard = network.leaderboardRewardsAddress as `0x${string}`;
        this.client = createPublicClient({
            chain: chainFor(networkType),
            transport: http(network.rpcUrl),
        });
    }

    async execute(userAddress: string): Promise<GetMyClaimableEpochsResult> {
        const normalized = userAddress.toLowerCase();
        const userAddr = normalized as `0x${string}`;

        const currentEpoch = (await this.client.readContract({
            address: this.leaderboard,
            abi: LEADERBOARD_ABI,
            functionName: 'currentEpoch',
        })) as bigint;

        // No closed epochs yet.
        if (currentEpoch === 0n) {
            return { userAddress: normalized, epochs: [] };
        }

        const lookback = BigInt(GetMyClaimableEpochsUseCase.MAX_LOOKBACK_EPOCHS);
        const firstId = currentEpoch > lookback ? currentEpoch - lookback : 0n;

        const entries: ClaimableEpochEntry[] = [];
        for (let id = firstId; id < currentEpoch; id++) {
            // `pendingClaim` already returns 0 for expired / claimed / no-score
            // entries, so we only consult `epoch` for the expiry timestamp
            // when the amount is non-zero.
            const pending = (await this.client.readContract({
                address: this.leaderboard,
                abi: LEADERBOARD_ABI,
                functionName: 'pendingClaim',
                args: [id, userAddr],
            })) as bigint;
            if (pending === 0n) continue;

            const ep = (await this.client.readContract({
                address: this.leaderboard,
                abi: LEADERBOARD_ABI,
                functionName: 'epoch',
                args: [id],
            })) as {
                claimExpiry: bigint | number;
            };
            const claimExpirySec = typeof ep.claimExpiry === 'bigint'
                ? Number(ep.claimExpiry)
                : ep.claimExpiry;

            entries.push({
                epochId: Number(id),
                amount: pending.toString(),
                claimExpiry: new Date(claimExpirySec * 1000).toISOString(),
                // pendingClaim returns 0 once claimed, so any non-zero entry
                // here implies the user has not yet claimed.
                alreadyClaimed: false,
            });
        }

        return { userAddress: normalized, epochs: entries };
    }
}
