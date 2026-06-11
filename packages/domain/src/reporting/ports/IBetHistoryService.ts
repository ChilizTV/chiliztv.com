export interface IBetHistoryService {
    /** True when the wallet has at least one indexed bet (any match). */
    hasEverBet(walletAddress: string): Promise<boolean>;
}
