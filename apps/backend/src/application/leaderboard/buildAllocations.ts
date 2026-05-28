import type { Hex } from 'viem';

/**
 * Pro-rata distribution over a notional 1e18 unit pool. The contract snapshots
 * its own USDC balance at `closeEpoch`, so the absolute scale chosen here only
 * affects the distribution proportions — the actual amount transferred is the
 * leaf value verified against the merkle root.
 *
 * Mirrored byte-for-byte by the frontend at
 * apps/frontend/components/features/leaderboard/domain/buildAllocations.ts —
 * dual tests in `__tests__` keep both implementations in lockstep.
 */

export interface AllocationRow {
    readonly userAddress: string;
    readonly totalScore: bigint;
}

export interface Allocation {
    readonly user: Hex;
    readonly amount: bigint;
}

export function buildAllocations(rows: ReadonlyArray<AllocationRow>): Allocation[] {
    const totalScore = rows.reduce((acc, r) => acc + r.totalScore, 0n);
    if (totalScore === 0n) return [];
    const scale = 10n ** 18n;
    return rows.map((r) => ({
        user: r.userAddress as Hex,
        amount: (r.totalScore * scale) / totalScore,
    }));
}
