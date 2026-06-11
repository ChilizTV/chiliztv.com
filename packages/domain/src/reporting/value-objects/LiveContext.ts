/**
 * Where a report was filed from. `null` means a global (non-live) report —
 * dedup and quorum then operate on the global scope.
 */
export interface LiveContext {
    matchId: number;
    streamId: string | null;
}
