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
  ITokenPriceRepository:   Symbol.for('ITokenPriceRepository'),

  // Repositories — blockchain indexing
  IIndexerCheckpointRepository: Symbol.for('IIndexerCheckpointRepository'),
  IBetRepository:               Symbol.for('IBetRepository'),
  IMarketEventRepository:       Symbol.for('IMarketEventRepository'),
  IWiringAlertRepository:       Symbol.for('IWiringAlertRepository'),

  // Repositories — leaderboard
  ILeaderboardScoreRepository:  Symbol.for('ILeaderboardScoreRepository'),
  ILeaderboardEpochRepository:  Symbol.for('ILeaderboardEpochRepository'),
  ILeaderboardClaimRepository:  Symbol.for('ILeaderboardClaimRepository'),

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

  // Ports — observability
  IIncidentReporter:       Symbol.for('IIncidentReporter'),

  // Ports — time
  IClock:                  Symbol.for('IClock'),

  // Ports — access gate
  IAccessCodeVerifier:     Symbol.for('IAccessCodeVerifier'),

  // Ports — cache layer (Redis / Noop)
  ICacheService:           Symbol.for('ICacheService'),
  ILockService:            Symbol.for('ILockService'),
  IRateLimitService:       Symbol.for('IRateLimitService'),
  RedisClient:             Symbol.for('RedisClient'),

  // Ports — parimutuel pool reader (multicall via backend)
  IPariMatchPoolsReader:   Symbol.for('IPariMatchPoolsReader'),

  // Reporting / moderation
  IReportRepository:       Symbol.for('IReportRepository'),
  IBanRepository:          Symbol.for('IBanRepository'),
  IReportActionRepository: Symbol.for('IReportActionRepository'),
  IPresenceService:        Symbol.for('IPresenceService'),
  IBetHistoryService:      Symbol.for('IBetHistoryService'),
  IModerationNotifier:     Symbol.for('IModerationNotifier'),
  IReportConfigProvider:   Symbol.for('IReportConfigProvider'),

  // Admin panel
  IAdminWalletRepository:  Symbol.for('IAdminWalletRepository'),
  IAdminAccessService:     Symbol.for('IAdminAccessService'),
  IAuditTrail:             Symbol.for('IAuditTrail'),
  IAdminDirectoryRepository: Symbol.for('IAdminDirectoryRepository'),
} as const;

export type TokenKey = keyof typeof TOKENS;
