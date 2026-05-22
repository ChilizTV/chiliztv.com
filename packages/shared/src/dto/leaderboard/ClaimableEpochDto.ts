import { z } from 'zod';

export const ClaimableEpochDtoSchema = z.object({
    epochId: z.number().int(),
    /** USDC raw — the user's allocation in this epoch. */
    amount: z.string(),
    /** Hex-encoded `bytes32[]` proof matching the contract's `MerkleProof` lib. */
    proof: z.array(z.string()),
    /** ISO timestamp — claim window cutoff (`block.timestamp + claimDuration`). */
    claimExpiry: z.string(),
    /** True once `PrizeClaimed(epochId, user, …)` has been indexed. */
    alreadyClaimed: z.boolean(),
});
export type ClaimableEpochDto = z.infer<typeof ClaimableEpochDtoSchema>;

export const MyClaimableEpochsDtoSchema = z.object({
    userAddress: z.string(),
    epochs: z.array(ClaimableEpochDtoSchema),
});
export type MyClaimableEpochsDto = z.infer<typeof MyClaimableEpochsDtoSchema>;
