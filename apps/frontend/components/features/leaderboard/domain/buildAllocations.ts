/**
 * Byte-for-byte clone of `buildAllocations` from
 * apps/backend/src/presentation/cli/leaderboard-close-epoch.ts:53-63.
 *
 * MUST stay in sync — the value returned here is exactly what the CLI writes
 * to `leaves_json`, which becomes the `amount` returned by `useMyClaimableEpochs`.
 * Drift between the two surfaces means the projection shown in the UI won't
 * match the actual claim amount, breaking user trust. Dual tests in
 * `__tests__/buildAllocations.test.ts` (front) and the matching CLI test
 * keep the two implementations honest.
 *
 * Scale is fixed at 1e18 by the CLI (notional unit), not the actual pool size.
 */

export interface AllocationRow {
    readonly userAddress: string;
    readonly totalScore: bigint;
}

export interface Allocation {
    readonly user: string;
    readonly amount: bigint;
}

export function buildAllocations(rows: ReadonlyArray<AllocationRow>): Allocation[] {
    const totalScore = rows.reduce((acc, r) => acc + r.totalScore, BigInt(0));
    if (totalScore === BigInt(0)) return [];
    const scale = BigInt(10) ** BigInt(18);
    return rows.map((r) => ({
        user: r.userAddress,
        amount: (r.totalScore * scale) / totalScore,
    }));
}

/** Display share in basis points (0-10000). Floored integer division. */
export function shareBps(userScore: bigint, totalScore: bigint): number {
    if (totalScore === BigInt(0)) return 0;
    return Number((userScore * BigInt(10_000)) / totalScore);
}
