import { injectable, inject } from 'tsyringe';
import type { Hex } from 'viem';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ILeaderboardEpochRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardEpochRepository';
import type { ILeaderboardClaimRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardClaimRepository';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { buildMerkleArtifacts } from '../merkle/merkleTree';

export interface ClaimableEpochEntry {
    readonly epochId: number;
    readonly amount: string;
    readonly proof: ReadonlyArray<string>;
    readonly claimExpiry: string;
    readonly alreadyClaimed: boolean;
}

export interface GetMyClaimableEpochsResult {
    readonly userAddress: string;
    readonly epochs: ReadonlyArray<ClaimableEpochEntry>;
}

@injectable()
export class GetMyClaimableEpochsUseCase {
    constructor(
        @inject(TOKENS.ILeaderboardEpochRepository)
        private readonly epochRepo: ILeaderboardEpochRepository,
        @inject(TOKENS.ILeaderboardClaimRepository)
        private readonly claimRepo: ILeaderboardClaimRepository,
        @inject(TOKENS.IClock)
        private readonly clock: IClock,
    ) {}

    async execute(userAddress: string): Promise<GetMyClaimableEpochsResult> {
        const normalized = userAddress.toLowerCase();
        const now = this.clock.now();
        const claimable = await this.epochRepo.findClaimableForUser(normalized, now);

        const entries = await Promise.all(
            claimable.map(async (epoch) => {
                if (epoch.epochId === null) return null;
                // Reconstruct proofs from the full leaf set persisted in DB.
                const entries = epoch.leaves.map((l) => ({
                    user: l.userAddress as Hex,
                    amount: l.amount,
                }));
                const userIdx = epoch.leaves.findIndex((l) => l.userAddress === normalized);
                if (userIdx === -1) return null;
                const { proofs } = buildMerkleArtifacts(entries);
                const proof = proofs[userIdx];
                const alreadyClaimed = await this.claimRepo.hasClaimed(epoch.epochId, normalized);
                const expiry = epoch.claimExpiry ?? now;
                return {
                    epochId: Number(epoch.epochId),
                    amount: epoch.leaves[userIdx].amount.toString(),
                    proof: proof as ReadonlyArray<string>,
                    claimExpiry: expiry.toISOString(),
                    alreadyClaimed,
                } satisfies ClaimableEpochEntry;
            }),
        );

        return {
            userAddress: normalized,
            epochs: entries.filter((e): e is ClaimableEpochEntry => e !== null),
        };
    }
}
