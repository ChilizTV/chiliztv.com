/**
 * On-chain reader for the LiquidityPool aggregate state. Each value is a
 * pool-global read (no user-scoped queries) so the resulting `PoolState`
 * is safe to cache across users with a short TTL.
 *
 * Bigints are preserved (no premature serialisation) — the API controller
 * stringifies them for HTTP transport.
 */
export interface PoolState {
  readonly totalAssets: bigint;
  readonly totalSupply: bigint;
  readonly freeBalance: bigint;
  readonly totalLiabilities: bigint;
  readonly utilization: bigint;
  readonly protocolFeeBps: number;
  readonly treasuryShareBps: number;
  readonly lpWithdrawalFeeBps: number;
  readonly maxBetAmount: bigint;
  readonly maxLiabilityPerMarketBps: number;
  readonly maxLiabilityPerMatchBps: number;
  readonly depositCooldownSeconds: number;
  readonly paused: boolean;
  readonly accruedTreasury: bigint;
  readonly treasury: string;
  readonly pendingTreasury: string;
}

export interface IPoolStateReader {
  read(): Promise<PoolState>;
}
