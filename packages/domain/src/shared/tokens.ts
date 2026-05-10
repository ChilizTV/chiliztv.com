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
  IUserProfileRepository:  Symbol.for('IUserProfileRepository'),

  // Repositories — blockchain indexing
  IIndexerCheckpointRepository: Symbol.for('IIndexerCheckpointRepository'),
  IBetRepository:               Symbol.for('IBetRepository'),
  IPoolEventRepository:         Symbol.for('IPoolEventRepository'),
  IMarketEventRepository:       Symbol.for('IMarketEventRepository'),
  ILpPositionRepository:        Symbol.for('ILpPositionRepository'),
  IWiringAlertRepository:       Symbol.for('IWiringAlertRepository'),
  IPoolApyRepository:           Symbol.for('IPoolApyRepository'),

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
