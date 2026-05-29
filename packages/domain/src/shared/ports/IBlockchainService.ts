/**
 * Domain port over the on-chain betting workflow. The current implementation
 * (`ViemBlockchainService`) wraps PariMatchFactory + FootballPariMatch /
 * BasketballPariMatch and ChilizSwapRouter via viem.
 */

export interface DeployContractResult {
  contractAddress: string;
}

export interface CloseMarketsResult {
  /** Markets closed on this tick (state == Open before). */
  closed: number;
  /** Markets skipped because already non-Open (Closed/Resolved/Cancelled/Suspended). */
  skipped: number;
}

export interface CancelMarketsResult {
  /** Markets transitioned to Cancelled on this tick (unlocks `claimRefund`). */
  cancelled: number;
  /** Markets skipped (already Resolved/Cancelled). */
  skipped: number;
}

export interface FootballScoreInput {
  homeGoals: number;
  awayGoals: number;
  /**
   * Optional. HALFTIME / FIRST_SCORER markets are no longer seeded on new
   * proxies — API-Football basic endpoint doesn't expose HT goals reliably and
   * FIRST_SCORER needs a paid endpoint. Adapters default missing fields to 0;
   * legacy contracts still seeded with those markets rely on PariMatchBase
   * void protection to refund stakers.
   */
  htHomeGoals?: number;
  htAwayGoals?: number;
  firstScorerId?: number;
}

export interface IBlockchainService {
  deployBettingContract(matchName: string, ownerAddress: string, oracleAddress?: string): Promise<DeployContractResult>;
  /** Seed and open the default 3-market lineup on a freshly-deployed proxy. */
  setupDefaultMarkets(contractAddress: string): Promise<void>;
  /** Resolve every closeable market via `resolveByScore`. Returns count transitioned to Resolved. */
  resolveMarketsByScore(contractAddress: string, score: FootballScoreInput): Promise<number>;
  /** Close every Open market on the contract via `closeMarketsBatch` (1 tx, idempotent). */
  closeOpenMarketsForMatch(contractAddress: string): Promise<CloseMarketsResult>;
  /** Cancel every non-terminal market via `cancelMarket(id, reason)` (N tx). Reserved for CANC/ABD statuses. */
  cancelOpenMarketsForMatch(contractAddress: string, reason: string): Promise<CancelMarketsResult>;
  getAdminAddress(): string;
}
