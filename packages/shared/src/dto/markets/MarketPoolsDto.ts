import { z } from 'zod';

/**
 * Snapshot of every market's pool state on a PariMatch proxy. Consumed by
 * the frontend `useMarketPools(address)` hook (4-layer canonical pattern).
 *
 * Big-number fields (totalPool, outcomePools[*]) are serialized as decimal
 * strings — JSON can't carry bigint natively.
 */
export const MarketPoolSnapshotSchema = z.object({
    marketId: z.string(),                           // bigint as decimal string
    /** PariMatchBase MarketState: 0=Inactive, 1=Open, 2=Suspended, 3=Closed, 4=Resolved, 5=Cancelled. */
    state: z.number().int().min(0).max(5),
    /** Winning outcome once resolved. Meaningless when state ∉ {Resolved}. */
    result: z.string(),
    /** Market type hash (bytes32 hex). */
    marketType: z.string(),
    /** Tenths of goals (25 = 2.5). Always 0 for line-less markets. */
    line: z.number().int(),
    /** Inclusive max valid outcome index. */
    maxOutcome: z.number().int().min(0),
    totalPool: z.string(),
    /** Pool per outcome, sorted by outcome ascending (0..maxOutcome). */
    outcomePools: z.array(z.string()),
    /** Implied probability in bps per outcome (0..10_000). */
    impliedProbBps: z.array(z.number().int().min(0).max(10_000)),
});
export type MarketPoolSnapshot = z.infer<typeof MarketPoolSnapshotSchema>;

export const MarketPoolsDtoSchema = z.object({
    contractAddress: z.string(),
    markets: z.array(MarketPoolSnapshotSchema),
});
export type MarketPoolsDto = z.infer<typeof MarketPoolsDtoSchema>;
