export interface ISubscriptionChecker {
  hasActiveSubscription(walletAddress: string): Promise<boolean>;
}
