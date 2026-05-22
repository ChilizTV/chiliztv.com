/**
 * Read-only view of a parimutuel market's pool state, aggregated via a
 * single multicall on-chain. Used by `GetMarketPoolsUseCase` to power the
 * `GET /matches/:address/pools` endpoint.
 */

export interface MarketPoolSnapshot {
    readonly marketId: bigint;
    /** PariMatchBase MarketState enum: 0=Inactive, 1=Open, 2=Suspended, 3=Closed, 4=Resolved, 5=Cancelled. */
    readonly state: number;
    /** Winning outcome once resolved. Meaningless when state ∉ {Resolved, Cancelled}. */
    readonly result: bigint;
    /** Spec: market type hash, line, maxOutcome (inclusive), extra, groupId. */
    readonly marketType: string;
    readonly line: number;
    readonly maxOutcome: number;
    readonly totalPool: bigint;
    /** Pool per outcome index, sorted by outcome ascending (0..maxOutcome inclusive). */
    readonly outcomePools: ReadonlyArray<bigint>;
    /** Implied probability in basis points per outcome (0..10_000). */
    readonly impliedProbBps: ReadonlyArray<number>;
}

export interface IPariMatchPoolsReader {
    /**
     * Fetches the full pool state for every market on a PariMatch proxy via
     * a single multicall round-trip. Returns markets sorted by marketId
     * ascending. If `marketIds` is omitted, reads every market on the proxy.
     */
    readPools(contractAddress: string, marketIds?: ReadonlyArray<bigint>): Promise<ReadonlyArray<MarketPoolSnapshot>>;
}
