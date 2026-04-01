export const TOKENS = {
  // Repositories
  IMatchRepository:        Symbol.for('IMatchRepository'),
  IPredictionRepository:   Symbol.for('IPredictionRepository'),
  IChatRepository:         Symbol.for('IChatRepository'),
  IStreamRepository:       Symbol.for('IStreamRepository'),
  IStreamWalletRepository: Symbol.for('IStreamWalletRepository'),
  IWaitlistRepository:     Symbol.for('IWaitlistRepository'),
  IFollowRepository:       Symbol.for('IFollowRepository'),
  IFanTokenRepository:     Symbol.for('IFanTokenRepository'),

  // Ports — external services
  IFootballApiService:     Symbol.for('IFootballApiService'),
  IBlockchainService:      Symbol.for('IBlockchainService'),
  ISchedulerService:       Symbol.for('ISchedulerService'),
  IStreamingService:       Symbol.for('IStreamingService'),

  // Ports — config
  IAuthConfig:             Symbol.for('IAuthConfig'),
  INetworkConfig:          Symbol.for('INetworkConfig'),
  ILogger:                 Symbol.for('ILogger'),

  // Ports — cross-domain
  ISubscriptionChecker:    Symbol.for('ISubscriptionChecker'),
} as const;

export type TokenKey = keyof typeof TOKENS;
