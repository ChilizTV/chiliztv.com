/**
 * Pure mirror of PariMatchBase's payout formula (cf. PariMatchBase.sol:534) :
 *
 *   payout = (userWinStake * netPool) / winningPool
 *
 * with `userWinStake = existingStake + additionalStake` because the contract
 * reads `_userStake[marketId][user][winningOutcome]` which is the cumulative
 * — stakes accumulate per outcome instead of recording per-bet rows on-chain.
 *
 * Inputs come from the wagmi reads (totalPool, outcomePool, userStake on the
 * outcome) plus the user's new bet amount. Output is the USDC-raw payout the
 * user receives **if** the picked outcome wins.
 *
 * No JSX, no hooks — single pure function so unit tests can pin the formula
 * byte-for-byte against the Solidity logic.
 */
export interface ParimutuelPayoutPreviewInput {
    totalPool: bigint;
    outcomePool: bigint;
    /** Stake the user already holds on this outcome (sum of prior PositionTaken). */
    existingStake: bigint;
    /** Stake the user is about to add. */
    additionalStake: bigint;
    /** Fee in basis points (0..500). */
    feeBps: number;
}

export function parimutuelPayoutPreview(args: ParimutuelPayoutPreviewInput): bigint {
    const ZERO = BigInt(0);
    if (args.additionalStake <= ZERO) return ZERO;
    const newTotal = args.totalPool + args.additionalStake;
    const newOutcomePool = args.outcomePool + args.additionalStake;
    if (newOutcomePool === ZERO) return ZERO;
    const myWinStake = args.existingStake + args.additionalStake;
    const feeBpsClamped = Math.max(0, Math.min(500, args.feeBps));
    const netPool = (newTotal * BigInt(10_000 - feeBpsClamped)) / BigInt(10_000);
    return (myWinStake * netPool) / newOutcomePool;
}

/**
 * Convenience wrapper matching the `usePreview*` naming. Pure compute, no
 * hooks state — kept as a function for ergonomics.
 */
export function useParimutuelPayoutPreview(args: ParimutuelPayoutPreviewInput): bigint {
    return parimutuelPayoutPreview(args);
}
