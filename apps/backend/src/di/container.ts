import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';

// ─── Repositories ────────────────────────────────────────────────────────────
import { IPredictionRepository } from '@chiliztv/domain/predictions/repositories/IPredictionRepository';
import { SupabasePredictionRepository } from '../infrastructure/persistence/repositories/SupabasePredictionRepository';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { SupabaseMatchRepository } from '../infrastructure/persistence/repositories/SupabaseMatchRepository';
import { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';
import { SupabaseChatRepository } from '../infrastructure/persistence/repositories/SupabaseChatRepository';
import { IReportRepository } from '@chiliztv/domain/reporting/repositories/IReportRepository';
import { IBanRepository } from '@chiliztv/domain/reporting/repositories/IBanRepository';
import { IReportActionRepository } from '@chiliztv/domain/reporting/repositories/IReportActionRepository';
import { IPresenceService } from '@chiliztv/domain/reporting/ports/IPresenceService';
import { IBetHistoryService } from '@chiliztv/domain/reporting/ports/IBetHistoryService';
import { IModerationNotifier } from '@chiliztv/domain/reporting/ports/IModerationNotifier';
import { IReportConfigProvider } from '@chiliztv/domain/reporting/ports/IReportConfigProvider';
import { SupabaseReportRepository } from '../infrastructure/persistence/repositories/SupabaseReportRepository';
import { SupabaseBanRepository } from '../infrastructure/persistence/repositories/SupabaseBanRepository';
import { SupabaseAdminWalletRepository } from '../infrastructure/persistence/repositories/SupabaseAdminWalletRepository';
import { CachedAdminAccessService } from '../infrastructure/services/CachedAdminAccessService';
import { SupabaseAuditTrail } from '../infrastructure/services/SupabaseAuditTrail';
import type { IAdminWalletRepository } from '@chiliztv/domain/admin/repositories/IAdminWalletRepository';
import type { IAdminAccessService } from '@chiliztv/domain/admin/ports/IAdminAccessService';
import type { IAuditTrail } from '@chiliztv/domain/admin/ports/IAuditTrail';
import type { IAdminDirectoryRepository } from '@chiliztv/domain/admin/repositories/IAdminDirectoryRepository';
import { SupabaseAdminDirectoryRepository } from '../infrastructure/persistence/repositories/SupabaseAdminDirectoryRepository';
import type { IModerationAlerts } from '@chiliztv/domain/reporting/ports/IModerationAlerts';
import { DiscordModerationAlerts } from '../infrastructure/observability/DiscordModerationAlerts';
import type { IAuditLogReader } from '@chiliztv/domain/admin/ports/IAuditLogReader';
import { SupabaseAuditLogReader } from '../infrastructure/persistence/repositories/SupabaseAuditLogReader';
import { SupabaseReportActionRepository } from '../infrastructure/persistence/repositories/SupabaseReportActionRepository';
import { PresenceQueryService } from '../infrastructure/services/PresenceQueryService';
import { BetHistoryService } from '../infrastructure/services/BetHistoryService';
import { ReportConfigCache } from '../infrastructure/services/ReportConfigCache';
import { SupabaseModerationNotifier } from '../infrastructure/services/SupabaseModerationNotifier';
import { IWaitlistRepository } from '@chiliztv/domain/waitlist/repositories/IWaitlistRepository';
import { SupabaseWaitlistRepository } from '../infrastructure/persistence/repositories/SupabaseWaitlistRepository';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { SupabaseStreamRepository } from '../infrastructure/persistence/repositories/SupabaseStreamRepository';
import { IStreamWalletRepository } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';
import { SupabaseStreamWalletRepository } from '../infrastructure/persistence/repositories/SupabaseStreamWalletRepository';
import { IFanTokenRepository } from '@chiliztv/domain/fan-tokens/repositories/IFanTokenRepository';
import { FanTokenAdapter } from '../infrastructure/blockchain/adapters/FanTokenAdapter';
import { IFollowRepository } from '@chiliztv/domain/follows/repositories/IFollowRepository';
import { SupabaseFollowRepository } from '../infrastructure/persistence/repositories/SupabaseFollowRepository';

// ─── Blockchain-indexing repositories ───────────────────────────────────────
import { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import { SupabaseIndexerCheckpointRepository } from '../infrastructure/persistence/repositories/SupabaseIndexerCheckpointRepository';
import { IBetRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IBetRepository';
import { SupabaseBetRepository } from '../infrastructure/persistence/repositories/SupabaseBetRepository';
import { IMarketEventRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IMarketEventRepository';
import { SupabaseMarketEventRepository } from '../infrastructure/persistence/repositories/SupabaseMarketEventRepository';
import { IWiringAlertRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IWiringAlertRepository';
import { SupabaseWiringAlertRepository } from '../infrastructure/persistence/repositories/SupabaseWiringAlertRepository';

import { ISubscriptionChecker } from '@chiliztv/domain/shared/ports/ISubscriptionChecker';
import { SubscriptionChecker } from '../infrastructure/services/SubscriptionChecker';
import { IFootballApiService } from '@chiliztv/domain/shared/ports/IFootballApiService';
import { FootballApiAdapterImpl } from '../infrastructure/external/adapters/FootballApiAdapterImpl';
import { IBlockchainService } from '@chiliztv/domain/shared/ports/IBlockchainService';
import { ViemBlockchainService } from '../infrastructure/blockchain/services/ViemBlockchainService';
import { IIncidentReporter } from '@chiliztv/domain/shared/ports/IIncidentReporter';
import { LogIncidentReporter } from '../infrastructure/observability/LogIncidentReporter';
import { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { SystemClock } from '../infrastructure/clock/SystemClock';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { NetworkConfigService } from '../infrastructure/config/NetworkConfigService';
import { IAuthConfig } from '@chiliztv/domain/shared/ports/IAuthConfig';
import { AuthConfigService } from '../infrastructure/config/AuthConfigService';
import { ILogger } from '@chiliztv/domain/shared/ports/ILogger';
import { WinstonLogger } from '../infrastructure/logging/WinstonLogger';

// ─── Blockchain Adapters ─────────────────────────────────────────────────────
import { TokenBalanceAdapter } from '../infrastructure/blockchain/adapters/TokenBalanceAdapter';
import { PariMatchResolutionAdapter } from '../infrastructure/blockchain/adapters/PariMatchResolutionAdapter';
import { PariMatchDeploymentAdapter } from '../infrastructure/blockchain/adapters/PariMatchDeploymentAdapter';
import { ViemPariMatchPoolsReader } from '../infrastructure/blockchain/adapters/ViemPariMatchPoolsReader';
import type { IPariMatchPoolsReader } from '@chiliztv/domain/markets/ports/IPariMatchPoolsReader';

// ─── Application — Predictions ───────────────────────────────────────────────
import { CreatePredictionUseCase } from '../application/predictions/use-cases/CreatePredictionUseCase';
import { GetUserPredictionsUseCase } from '../application/predictions/use-cases/GetUserPredictionsUseCase';
import { GetUserStatsUseCase } from '../application/predictions/use-cases/GetUserStatsUseCase';
import { SettlePredictionsUseCase } from '../application/predictions/use-cases/SettlePredictionsUseCase';

// ─── Application — Matches ───────────────────────────────────────────────────
import { GetAllMatchesUseCase } from '../application/matches/use-cases/GetAllMatchesUseCase';
import { GetLiveMatchesUseCase } from '../application/matches/use-cases/GetLiveMatchesUseCase';
import { GetUpcomingMatchesUseCase } from '../application/matches/use-cases/GetUpcomingMatchesUseCase';
import { GetMatchByIdUseCase } from '../application/matches/use-cases/GetMatchByIdUseCase';
import { GetMatchesByLeagueUseCase } from '../application/matches/use-cases/GetMatchesByLeagueUseCase';
import { GetMatchStatsUseCase } from '../application/matches/use-cases/GetMatchStatsUseCase';
import { GetBrowseMatchesUseCase } from '../application/matches/use-cases/GetBrowseMatchesUseCase';
import { GetMarketPoolsUseCase } from '../application/matches/use-cases/GetMarketPoolsUseCase';
import { ResolveFinishedMatchesUseCase } from '../application/matches/use-cases/ResolveFinishedMatchesUseCase';
import { CloseLiveMatchesMarketsUseCase } from '../application/matches/use-cases/CloseLiveMatchesMarketsUseCase';
import { SyncMatchesUseCase } from '../application/matches/use-cases/SyncMatchesUseCase';
import { SyncLiveMatchesUseCase } from '../application/matches/use-cases/SyncLiveMatchesUseCase';
import { ResolveHalftimeMarketUseCase } from '../application/matches/use-cases/ResolveHalftimeMarketUseCase';
import { CleanupOldMatchesUseCase } from '../application/matches/use-cases/CleanupOldMatchesUseCase';

// ─── Application — Chat ──────────────────────────────────────────────────────
import { JoinRoomUseCase } from '../application/chat/use-cases/JoinRoomUseCase';
import { LeaveRoomUseCase } from '../application/chat/use-cases/LeaveRoomUseCase';
import { SendMessageUseCase } from '../application/chat/use-cases/SendMessageUseCase';
import { SendBetMessageUseCase } from '../application/chat/use-cases/SendBetMessageUseCase';
import { GetRoomMessagesUseCase } from '../application/chat/use-cases/GetRoomMessagesUseCase';
import { GetConnectedUsersUseCase } from '../application/chat/use-cases/GetConnectedUsersUseCase';
import { GetChatStatsUseCase } from '../application/chat/use-cases/GetChatStatsUseCase';

// ─── Application — Waitlist ──────────────────────────────────────────────────
import { JoinWaitlistUseCase } from '../application/waitlist/use-cases/JoinWaitlistUseCase';
import { GetWaitlistStatsUseCase } from '../application/waitlist/use-cases/GetWaitlistStatsUseCase';

// ─── Application — Access ────────────────────────────────────────────────────
import { RedeemAccessCodeUseCase } from '../application/access/use-cases/RedeemAccessCodeUseCase';

// ─── Application — Streams ───────────────────────────────────────────────────
import { CreateStreamUseCase } from '../application/streams/use-cases/CreateStreamUseCase';
import { GetActiveStreamsUseCase } from '../application/streams/use-cases/GetActiveStreamsUseCase';
import { GetPreferredStreamUseCase } from '../application/streams/use-cases/GetPreferredStreamUseCase';
import { EndStreamUseCase } from '../application/streams/use-cases/EndStreamUseCase';
import { UpdateViewerCountUseCase } from '../application/streams/use-cases/UpdateViewerCountUseCase';
import { CleanupOldStreamsUseCase } from '../application/streams/use-cases/CleanupOldStreamsUseCase';

// ─── Application — StreamWallet ──────────────────────────────────────────────
import { GetStreamerDonationsUseCase } from '../application/stream-wallet/use-cases/GetStreamerDonationsUseCase';
import { GetStreamerSubscriptionsUseCase } from '../application/stream-wallet/use-cases/GetStreamerSubscriptionsUseCase';
import { GetStreamerStatsUseCase } from '../application/stream-wallet/use-cases/GetStreamerStatsUseCase';
import { GetDonorHistoryUseCase } from '../application/stream-wallet/use-cases/GetDonorHistoryUseCase';
import { GetSubscriberHistoryUseCase } from '../application/stream-wallet/use-cases/GetSubscriberHistoryUseCase';
import { DeployStreamerWalletUseCase } from '../application/stream-wallet/use-cases/DeployStreamerWalletUseCase';
import { StreamWalletDeploymentAdapter } from '../infrastructure/blockchain/adapters/StreamWalletDeploymentAdapter';

// ─── Application — Users ─────────────────────────────────────────────────────
import { IUserProfileRepository } from '@chiliztv/domain/users/repositories/IUserProfileRepository';
import { SupabaseUserProfileRepository } from '../infrastructure/persistence/repositories/SupabaseUserProfileRepository';
import { MultiSourceUserDisplayFallback } from '../infrastructure/persistence/repositories/MultiSourceUserDisplayFallback';
import { ResolveUserProfileUseCase } from '../application/users/use-cases/ResolveUserProfileUseCase';
import { ResolveUserProfilesBatchUseCase } from '../application/users/use-cases/ResolveUserProfilesBatchUseCase';
import { UpsertUserProfileUseCase } from '../application/users/use-cases/UpsertUserProfileUseCase';

// ─── Application — Prices ────────────────────────────────────────────────────
import { ITokenPriceRepository } from '@chiliztv/domain/prices/repositories/ITokenPriceRepository';
import { SupabaseTokenPriceRepository } from '../infrastructure/persistence/repositories/SupabaseTokenPriceRepository';
import { CoinGeckoPriceFeed } from '../infrastructure/external/adapters/CoinGeckoPriceFeed';
import { PythPriceFeed } from '../infrastructure/external/adapters/PythPriceFeed';
import { RefreshTokenPricesUseCase } from '../application/prices/use-cases/RefreshTokenPricesUseCase';
import { GetTokenPricesUseCase } from '../application/prices/use-cases/GetTokenPricesUseCase';
import { IPriceFeedService, PRICE_FEEDS_TOKEN } from '@chiliztv/domain/shared/ports/IPriceFeedService';

// ─── Application — FanTokens ─────────────────────────────────────────────────
import { GetUserFanTokenBalancesUseCase } from '../application/fan-tokens/use-cases/GetUserFanTokenBalancesUseCase';

// ─── Application — Follows ───────────────────────────────────────────────────
import { FollowStreamerUseCase } from '../application/follows/use-cases/FollowStreamerUseCase';
import { UnfollowStreamerUseCase } from '../application/follows/use-cases/UnfollowStreamerUseCase';
import { GetIsFollowingUseCase } from '../application/follows/use-cases/GetIsFollowingUseCase';
import { GetFollowerCountUseCase } from '../application/follows/use-cases/GetFollowerCountUseCase';
import { GetFollowedStreamersUseCase } from '../application/follows/use-cases/GetFollowedStreamersUseCase';

// ─── Application — Bets ──────────────────────────────────────────────────────
import { GetUserBetsUseCase } from '../application/bets/use-cases/GetUserBetsUseCase';

// ─── Application — Leaderboard ───────────────────────────────────────────────
import { GetLeaderboardUseCase } from '../application/leaderboard/use-cases/GetLeaderboardUseCase';
import { GetMyLeaderboardPositionUseCase } from '../application/leaderboard/use-cases/GetMyLeaderboardPositionUseCase';
import { GetMyClaimableEpochsUseCase } from '../application/leaderboard/use-cases/GetMyClaimableEpochsUseCase';

// ─── Domain — Leaderboard ports + impls ──────────────────────────────────────
import type { ILeaderboardScoreRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardScoreRepository';
import type { ILeaderboardEpochRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardEpochRepository';
import type { ILeaderboardClaimRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardClaimRepository';
import { SupabaseLeaderboardScoreRepository } from '../infrastructure/persistence/repositories/SupabaseLeaderboardScoreRepository';
import { SupabaseLeaderboardEpochRepository } from '../infrastructure/persistence/repositories/SupabaseLeaderboardEpochRepository';
import { SupabaseLeaderboardClaimRepository } from '../infrastructure/persistence/repositories/SupabaseLeaderboardClaimRepository';
import { LeaderboardIndexer } from '../infrastructure/blockchain/indexers/LeaderboardIndexer';
import { LeaderboardController } from '../presentation/http/controllers/leaderboard.controller';

// ─── Infrastructure — Scheduling ─────────────────────────────────────────────
import { JobScheduler } from '../infrastructure/scheduling/JobScheduler';
import { SyncMatchesJob } from '../infrastructure/scheduling/jobs/SyncMatchesJob';
import { SyncLiveMatchesJob } from '../infrastructure/scheduling/jobs/SyncLiveMatchesJob';
import { ResolveMarketsJob } from '../infrastructure/scheduling/jobs/ResolveMarketsJob';
import { ResolveHalftimeMarketsJob } from '../infrastructure/scheduling/jobs/ResolveHalftimeMarketsJob';
import { CloseLiveMarketsJob } from '../infrastructure/scheduling/jobs/CloseLiveMarketsJob';
import { RefreshTokenPricesJob } from '../infrastructure/scheduling/jobs/RefreshTokenPricesJob';
import { CleanupStreamsJob } from '../infrastructure/scheduling/jobs/CleanupStreamsJob';
import { StaleStreamCleanupJob } from '../infrastructure/scheduling/jobs/StaleStreamCleanupJob';
import { OldEndedStreamsCleanupJob } from '../infrastructure/scheduling/jobs/OldEndedStreamsCleanupJob';
import { SettlePredictionsJob } from '../infrastructure/scheduling/jobs/SettlePredictionsJob';
import { ViewerReconcileJob } from '../infrastructure/scheduling/jobs/ViewerReconcileJob';
import { CloudflareReconcileJob } from '../infrastructure/scheduling/jobs/CloudflareReconcileJob';

// ─── Infrastructure — Access ──────────────────────────────────────────────────
import { IAccessCodeVerifier } from '@chiliztv/domain/access/ports/IAccessCodeVerifier';
import { ScryptAccessCodeVerifier } from '../infrastructure/access/ScryptAccessCodeVerifier';

// ─── Infrastructure — Cache (Redis or Noop) ─────────────────────────────────
import { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import { IRateLimitService } from '@chiliztv/domain/shared/ports/IRateLimitService';
import { RedisCacheService } from '../infrastructure/cache/RedisCacheService';
import { RedisLockService } from '../infrastructure/cache/RedisLockService';
import { RedisWarmupService } from '../infrastructure/cache/RedisWarmupService';
import { RedisRateLimitService } from '../infrastructure/cache/RedisRateLimitService';
import { NoopCacheService } from '../infrastructure/cache/NoopCacheService';
import { NoopLockService } from '../infrastructure/cache/NoopLockService';
import { NoopRateLimitService } from '../infrastructure/cache/NoopRateLimitService';
import { createRedisClient, type RedisClient } from '../infrastructure/cache/RedisClient';
import { env } from '../infrastructure/config/environment';

// ─── Infrastructure — Services ───────────────────────────────────────────────
import { ViewerSessionService } from '../infrastructure/services/ViewerSessionService';
import { StreamLifecycleService } from '../infrastructure/services/StreamLifecycleService';
import { IStreamingService } from '@chiliztv/domain/streams/ports/IStreamingService';
import { CloudflareStreamService } from '../infrastructure/streaming/CloudflareStreamService';

// ─── Infrastructure — Blockchain ─────────────────────────────────────────────
import { BlockchainEventListener } from '../infrastructure/blockchain/BlockchainEventListener';
import { PariMatchFactoryIndexer } from '../infrastructure/blockchain/indexers/PariMatchFactoryIndexer';
import { PariMatchEventIndexer } from '../infrastructure/blockchain/indexers/PariMatchEventIndexer';
import { ChilizSwapRouterIndexer } from '../infrastructure/blockchain/indexers/ChilizSwapRouterIndexer';
import { StreamWalletIndexer } from '../infrastructure/blockchain/indexers/StreamWalletIndexer';

// ─── Presentation — Controllers ──────────────────────────────────────────────
import { CloudflareStreamWebhookController } from '../presentation/http/controllers/cloudflare-stream-webhook.controller';
import { PredictionController } from '../presentation/http/controllers/prediction.controller';
import { MatchController } from '../presentation/http/controllers/match.controller';
import { ChatController } from '../presentation/http/controllers/chat.controller';
import { ReportingController } from '../presentation/http/controllers/reporting.controller';
import { BanController } from '../presentation/http/controllers/ban.controller';
import { CreateReportUseCase } from '../application/reporting/use-cases/CreateReportUseCase';
import { EvaluateReportThresholdUseCase } from '../application/reporting/use-cases/EvaluateReportThresholdUseCase';
import { SoftDeleteMessageUseCase } from '../application/reporting/use-cases/SoftDeleteMessageUseCase';
import { StopStreamUseCase } from '../application/reporting/use-cases/StopStreamUseCase';
import { BanAccountUseCase } from '../application/reporting/use-cases/BanAccountUseCase';
import { LiftExpiredBansUseCase } from '../application/reporting/use-cases/LiftExpiredBansUseCase';
import { WaitlistController } from '../presentation/http/controllers/waitlist.controller';
import { AuthController } from '../presentation/http/controllers/auth.controller';
import { AccessController } from '../presentation/http/controllers/access.controller';
import { StreamController } from '../presentation/http/controllers/stream.controller';
import { StreamWalletController } from '../presentation/http/controllers/stream-wallet.controller';
import { FanTokensController } from '../presentation/http/controllers/fan-tokens.controller';
import { FollowController } from '../presentation/http/controllers/follow.controller';
import { BetController } from '../presentation/http/controllers/bet.controller';
import { UserController } from '../presentation/http/controllers/user.controller';
import { PricesController } from '../presentation/http/controllers/prices.controller';

// ─── Presentation — CLI Commands ─────────────────────────────────────────────
import { DeployMissingContractsCommand } from '../presentation/cli/commands/DeployMissingContractsCommand';
import { SetupMarketsCommand } from '../presentation/cli/commands/SetupMarketsCommand';
import { TestMatchLifecycleCommand } from '../presentation/cli/commands/TestMatchLifecycleCommand';
import { ScenarioCommand } from '../presentation/cli/commands/ScenarioCommand';
import { ResetTestDataCommand } from '../presentation/cli/commands/ResetTestDataCommand';

export function setupDependencyInjection(): void {
  // ─── Config ports ──────────────────────────────────────────────────────────
  container.registerSingleton<ILogger>(TOKENS.ILogger, WinstonLogger);
  container.registerSingleton<INetworkConfig>(TOKENS.INetworkConfig, NetworkConfigService);
  container.registerSingleton<IAuthConfig>(TOKENS.IAuthConfig, AuthConfigService);

  // ─── Service ports ─────────────────────────────────────────────────────────
  container.registerSingleton<IFootballApiService>(TOKENS.IFootballApiService, FootballApiAdapterImpl);
  container.registerSingleton<IBlockchainService>(TOKENS.IBlockchainService, ViemBlockchainService);
  container.registerSingleton<IIncidentReporter>(TOKENS.IIncidentReporter, LogIncidentReporter);
  container.registerSingleton<IClock>(TOKENS.IClock, SystemClock);
  container.registerSingleton<IStreamingService>(TOKENS.IStreamingService, CloudflareStreamService);
  container.registerSingleton<IPariMatchPoolsReader>(TOKENS.IPariMatchPoolsReader, ViemPariMatchPoolsReader);

  if (env.REDIS_URL) {
    const redisClient = createRedisClient(env.REDIS_URL, container.resolve<ILogger>(TOKENS.ILogger));
    container.registerInstance<RedisClient>(TOKENS.RedisClient, redisClient);
    container.registerSingleton<ICacheService>(TOKENS.ICacheService, RedisCacheService);
    container.registerSingleton<ILockService>(TOKENS.ILockService, RedisLockService);
    container.registerSingleton<IRateLimitService>(TOKENS.IRateLimitService, RedisRateLimitService);
  } else {
    container.registerSingleton<ICacheService>(TOKENS.ICacheService, NoopCacheService);
    container.registerSingleton<ILockService>(TOKENS.ILockService, NoopLockService);
    container.registerSingleton<IRateLimitService>(TOKENS.IRateLimitService, NoopRateLimitService);
  }

  // ─── Repositories ──────────────────────────────────────────────────────────
  container.registerSingleton<IPredictionRepository>(TOKENS.IPredictionRepository, SupabasePredictionRepository);
  container.registerSingleton<IMatchRepository>(TOKENS.IMatchRepository, SupabaseMatchRepository);
  container.registerSingleton<IChatRepository>(TOKENS.IChatRepository, SupabaseChatRepository);
  container.registerSingleton<IWaitlistRepository>(TOKENS.IWaitlistRepository, SupabaseWaitlistRepository);
  container.registerSingleton<IStreamRepository>(TOKENS.IStreamRepository, SupabaseStreamRepository);
  container.registerSingleton<IStreamWalletRepository>(TOKENS.IStreamWalletRepository, SupabaseStreamWalletRepository);
  container.registerSingleton<IFanTokenRepository>(TOKENS.IFanTokenRepository, FanTokenAdapter);
  container.registerSingleton<IFollowRepository>(TOKENS.IFollowRepository, SupabaseFollowRepository);
  container.registerSingleton<ISubscriptionChecker>(TOKENS.ISubscriptionChecker, SubscriptionChecker);
  container.registerSingleton<IUserProfileRepository>(TOKENS.IUserProfileRepository, SupabaseUserProfileRepository);
  container.registerSingleton<ITokenPriceRepository>(TOKENS.ITokenPriceRepository, SupabaseTokenPriceRepository);

  // ─── Blockchain-indexing repositories ──────────────────────────────────────
  container.registerSingleton<IIndexerCheckpointRepository>(TOKENS.IIndexerCheckpointRepository, SupabaseIndexerCheckpointRepository);
  container.registerSingleton<IBetRepository>(TOKENS.IBetRepository, SupabaseBetRepository);
  container.registerSingleton<IMarketEventRepository>(TOKENS.IMarketEventRepository, SupabaseMarketEventRepository);
  container.registerSingleton<IWiringAlertRepository>(TOKENS.IWiringAlertRepository, SupabaseWiringAlertRepository);

  // ─── Reporting / moderation ────────────────────────────────────────────────
  container.registerSingleton<IReportRepository>(TOKENS.IReportRepository, SupabaseReportRepository);
  container.registerSingleton<IBanRepository>(TOKENS.IBanRepository, SupabaseBanRepository);

  // Admin panel (lot 0)
  container.registerSingleton<IAdminWalletRepository>(TOKENS.IAdminWalletRepository, SupabaseAdminWalletRepository);
  container.registerSingleton<IAdminAccessService>(TOKENS.IAdminAccessService, CachedAdminAccessService);
  container.registerSingleton<IAuditTrail>(TOKENS.IAuditTrail, SupabaseAuditTrail);
  container.registerSingleton<IAdminDirectoryRepository>(TOKENS.IAdminDirectoryRepository, SupabaseAdminDirectoryRepository);
  container.registerSingleton<IAuditLogReader>(TOKENS.IAuditLogReader, SupabaseAuditLogReader);
  container.registerSingleton<IReportActionRepository>(TOKENS.IReportActionRepository, SupabaseReportActionRepository);
  container.registerSingleton<IPresenceService>(TOKENS.IPresenceService, PresenceQueryService);
  container.registerSingleton<IBetHistoryService>(TOKENS.IBetHistoryService, BetHistoryService);
  container.registerSingleton<IModerationNotifier>(TOKENS.IModerationNotifier, SupabaseModerationNotifier);
  container.registerSingleton<IModerationAlerts>(TOKENS.IModerationAlerts, DiscordModerationAlerts);
  container.registerSingleton<IReportConfigProvider>(TOKENS.IReportConfigProvider, ReportConfigCache);

  // ─── Blockchain Adapters ───────────────────────────────────────────────────
  container.registerSingleton(TokenBalanceAdapter);
  container.registerSingleton(PariMatchResolutionAdapter);
  container.registerSingleton(PariMatchDeploymentAdapter);

  // ─── Use Cases — Predictions ───────────────────────────────────────────────
  container.registerSingleton(CreatePredictionUseCase);
  container.registerSingleton(GetUserPredictionsUseCase);
  container.registerSingleton(GetUserStatsUseCase);
  container.registerSingleton(SettlePredictionsUseCase);

  // ─── Use Cases — Matches ───────────────────────────────────────────────────
  container.registerSingleton(GetAllMatchesUseCase);
  container.registerSingleton(GetLiveMatchesUseCase);
  container.registerSingleton(GetUpcomingMatchesUseCase);
  container.registerSingleton(GetMatchByIdUseCase);
  container.registerSingleton(GetMatchesByLeagueUseCase);
  container.registerSingleton(GetMatchStatsUseCase);
  container.registerSingleton(GetBrowseMatchesUseCase);
  container.registerSingleton(GetMarketPoolsUseCase);
  container.registerSingleton(ResolveFinishedMatchesUseCase);
  container.registerSingleton(CloseLiveMatchesMarketsUseCase);
  container.registerSingleton(SyncMatchesUseCase);
  container.registerSingleton(SyncLiveMatchesUseCase);
  container.registerSingleton(ResolveHalftimeMarketUseCase);
  container.registerSingleton(CleanupOldMatchesUseCase);

  // ─── Use Cases — Chat ──────────────────────────────────────────────────────
  container.registerSingleton(JoinRoomUseCase);
  container.registerSingleton(LeaveRoomUseCase);
  container.registerSingleton(SendMessageUseCase);
  container.registerSingleton(SendBetMessageUseCase);
  container.registerSingleton(GetRoomMessagesUseCase);
  container.registerSingleton(GetConnectedUsersUseCase);
  container.registerSingleton(GetChatStatsUseCase);

  // ─── Use Cases — Reporting / moderation ────────────────────────────────────
  container.registerSingleton(CreateReportUseCase);
  container.registerSingleton(EvaluateReportThresholdUseCase);
  container.registerSingleton(SoftDeleteMessageUseCase);
  container.registerSingleton(StopStreamUseCase);
  container.registerSingleton(BanAccountUseCase);
  container.registerSingleton(LiftExpiredBansUseCase);

  // ─── Use Cases — Waitlist ──────────────────────────────────────────────────
  container.registerSingleton(JoinWaitlistUseCase);
  container.registerSingleton(GetWaitlistStatsUseCase);

  // ─── Access gate ───────────────────────────────────────────────────────────
  container.registerSingleton<IAccessCodeVerifier>(TOKENS.IAccessCodeVerifier, ScryptAccessCodeVerifier);
  container.registerSingleton(RedeemAccessCodeUseCase);

  // ─── Use Cases — Streams ───────────────────────────────────────────────────
  container.registerSingleton(CreateStreamUseCase);
  container.registerSingleton(GetActiveStreamsUseCase);
  container.registerSingleton(GetPreferredStreamUseCase);
  container.registerSingleton(EndStreamUseCase);
  container.registerSingleton(UpdateViewerCountUseCase);
  container.registerSingleton(CleanupOldStreamsUseCase);

  // ─── Use Cases — StreamWallet ──────────────────────────────────────────────
  container.registerSingleton(GetStreamerDonationsUseCase);
  container.registerSingleton(GetStreamerSubscriptionsUseCase);
  container.registerSingleton(GetStreamerStatsUseCase);
  container.registerSingleton(GetDonorHistoryUseCase);
  container.registerSingleton(GetSubscriberHistoryUseCase);
  container.registerSingleton(StreamWalletDeploymentAdapter);
  container.registerSingleton(DeployStreamerWalletUseCase);

  // ─── Use Cases — Users ─────────────────────────────────────────────────────
  container.registerSingleton(MultiSourceUserDisplayFallback);
  container.registerSingleton(ResolveUserProfileUseCase);
  container.registerSingleton(ResolveUserProfilesBatchUseCase);
  container.registerSingleton(UpsertUserProfileUseCase);

  // ─── Use Cases — Prices ────────────────────────────────────────────────────
  container.registerSingleton(CoinGeckoPriceFeed);
  container.registerSingleton(PythPriceFeed);
  container.register<ReadonlyArray<IPriceFeedService>>(PRICE_FEEDS_TOKEN, {
    useFactory: (c) => [c.resolve(PythPriceFeed), c.resolve(CoinGeckoPriceFeed)],
  });
  container.registerSingleton(RefreshTokenPricesUseCase);
  container.registerSingleton(GetTokenPricesUseCase);

  // ─── Use Cases — FanTokens ─────────────────────────────────────────────────
  container.registerSingleton(GetUserFanTokenBalancesUseCase);

  // ─── Use Cases — Follows ───────────────────────────────────────────────────
  container.registerSingleton(FollowStreamerUseCase);
  container.registerSingleton(UnfollowStreamerUseCase);
  container.registerSingleton(GetIsFollowingUseCase);
  container.registerSingleton(GetFollowerCountUseCase);
  container.registerSingleton(GetFollowedStreamersUseCase);

  // ─── Use Cases — Bets ──────────────────────────────────────────────────────
  container.registerSingleton(GetUserBetsUseCase);

  // ─── Leaderboard — repositories + use cases ────────────────────────────────
  container.registerSingleton<ILeaderboardScoreRepository>(TOKENS.ILeaderboardScoreRepository, SupabaseLeaderboardScoreRepository);
  container.registerSingleton<ILeaderboardEpochRepository>(TOKENS.ILeaderboardEpochRepository, SupabaseLeaderboardEpochRepository);
  container.registerSingleton<ILeaderboardClaimRepository>(TOKENS.ILeaderboardClaimRepository, SupabaseLeaderboardClaimRepository);
  container.registerSingleton(GetLeaderboardUseCase);
  container.registerSingleton(GetMyLeaderboardPositionUseCase);
  container.registerSingleton(GetMyClaimableEpochsUseCase);

  // ─── Infrastructure — Scheduling ───────────────────────────────────────────
  container.registerSingleton(SyncMatchesJob);
  container.registerSingleton(SyncLiveMatchesJob);
  container.registerSingleton(ResolveMarketsJob);
  container.registerSingleton(ResolveHalftimeMarketsJob);
  container.registerSingleton(CloseLiveMarketsJob);
  container.registerSingleton(RefreshTokenPricesJob);
  container.registerSingleton(CleanupStreamsJob);
  container.registerSingleton(StaleStreamCleanupJob);
  container.registerSingleton(OldEndedStreamsCleanupJob);
  container.registerSingleton(SettlePredictionsJob);
  container.registerSingleton(ViewerReconcileJob);
  container.registerSingleton(CloudflareReconcileJob);
  container.registerSingleton(JobScheduler);
  container.registerSingleton(RedisWarmupService);

  // ─── Infrastructure — Services ─────────────────────────────────────────────
  container.registerSingleton(StreamLifecycleService);
  container.registerSingleton(ViewerSessionService);

  // ─── Infrastructure — Blockchain ───────────────────────────────────────────
  container.registerSingleton(BlockchainEventListener);
  container.registerSingleton(PariMatchFactoryIndexer);
  container.registerSingleton(PariMatchEventIndexer);
  container.registerSingleton(ChilizSwapRouterIndexer);
  container.registerSingleton(StreamWalletIndexer);
  container.registerSingleton(LeaderboardIndexer);

  // ─── Presentation — CLI Commands ───────────────────────────────────────────
  container.registerSingleton(DeployMissingContractsCommand);
  container.registerSingleton(SetupMarketsCommand);
  container.registerSingleton(TestMatchLifecycleCommand);
  container.registerSingleton(ScenarioCommand);
  container.registerSingleton(ResetTestDataCommand);

  // ─── Presentation — Controllers ────────────────────────────────────────────
  container.registerSingleton(CloudflareStreamWebhookController);
  container.registerSingleton(PredictionController);
  container.registerSingleton(MatchController);
  container.registerSingleton(ChatController);
  container.registerSingleton(WaitlistController);
  container.registerSingleton(AuthController);
  container.registerSingleton(AccessController);
  container.registerSingleton(StreamController);
  container.registerSingleton(StreamWalletController);
  container.registerSingleton(FanTokensController);
  container.registerSingleton(FollowController);
  container.registerSingleton(BetController);
  container.registerSingleton(UserController);
  container.registerSingleton(PricesController);
  container.registerSingleton(LeaderboardController);
  container.registerSingleton(ReportingController);
  container.registerSingleton(BanController);
}

export { container };
