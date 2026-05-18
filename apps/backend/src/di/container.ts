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
import { IPoolEventRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IPoolEventRepository';
import { SupabasePoolEventRepository } from '../infrastructure/persistence/repositories/SupabasePoolEventRepository';
import { IMarketEventRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IMarketEventRepository';
import { SupabaseMarketEventRepository } from '../infrastructure/persistence/repositories/SupabaseMarketEventRepository';
import { ILpPositionRepository } from '@chiliztv/domain/blockchain-indexing/repositories/ILpPositionRepository';
import { SupabaseLpPositionRepository } from '../infrastructure/persistence/repositories/SupabaseLpPositionRepository';
import { IWiringAlertRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IWiringAlertRepository';
import { SupabaseWiringAlertRepository } from '../infrastructure/persistence/repositories/SupabaseWiringAlertRepository';
import { IPoolApyRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IPoolApyRepository';
import { SupabasePoolApyRepository } from '../infrastructure/persistence/repositories/SupabasePoolApyRepository';

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

// ─── Blockchain Adapters (legacy — kept for TokenBalanceAdapter and indexers) ─
import { TokenBalanceAdapter } from '../infrastructure/blockchain/adapters/TokenBalanceAdapter';
import { MarketOddsAdapter } from '../infrastructure/blockchain/adapters/MarketOddsAdapter';
import { MatchResolutionAdapter } from '../infrastructure/blockchain/adapters/MatchResolutionAdapter';
import { BettingContractDeploymentAdapter } from '../infrastructure/blockchain/adapters/BettingContractDeploymentAdapter';

// ─── External Adapters (legacy — kept for backward compatibility) ─────────────
import { FootballApiAdapter } from '../infrastructure/external/adapters/FootballApiAdapter';

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
import { ResolveFinishedMatchesUseCase } from '../application/matches/use-cases/ResolveFinishedMatchesUseCase';
import { CloseLiveMatchesMarketsUseCase } from '../application/matches/use-cases/CloseLiveMatchesMarketsUseCase';
import { SyncMatchesUseCase } from '../application/matches/use-cases/SyncMatchesUseCase';
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
import { BackfillMarketLinesUseCase } from '../application/blockchain-indexing/use-cases/BackfillMarketLinesUseCase';
import { IPriceFeedService, PRICE_FEEDS_TOKEN } from '@chiliztv/domain/shared/ports/IPriceFeedService';

// ─── Application — FanTokens ─────────────────────────────────────────────────
import { GetUserFanTokenBalancesUseCase } from '../application/fan-tokens/use-cases/GetUserFanTokenBalancesUseCase';

// ─── Application — Follows ───────────────────────────────────────────────────
import { FollowStreamerUseCase } from '../application/follows/use-cases/FollowStreamerUseCase';
import { UnfollowStreamerUseCase } from '../application/follows/use-cases/UnfollowStreamerUseCase';
import { GetIsFollowingUseCase } from '../application/follows/use-cases/GetIsFollowingUseCase';
import { GetFollowerCountUseCase } from '../application/follows/use-cases/GetFollowerCountUseCase';
import { GetFollowedStreamersUseCase } from '../application/follows/use-cases/GetFollowedStreamersUseCase';

// ─── Application — Pool ──────────────────────────────────────────────────────
import { ComputeApyUseCase } from '../application/pool/use-cases/ComputeApyUseCase';
import { GetLatestApyUseCase } from '../application/pool/use-cases/GetLatestApyUseCase';
import { GetPoolStateUseCase } from '../application/pool/use-cases/GetPoolStateUseCase';
import { IPoolStateReader } from '@chiliztv/domain/shared/ports/IPoolStateReader';
import { ViemPoolStateReader } from '../infrastructure/blockchain/adapters/ViemPoolStateReader';

// ─── Application — Bets ──────────────────────────────────────────────────────
import { GetUserBetsUseCase } from '../application/bets/use-cases/GetUserBetsUseCase';

// ─── Infrastructure — Scheduling ─────────────────────────────────────────────
import { JobScheduler } from '../infrastructure/scheduling/JobScheduler';
import { SyncMatchesJob } from '../infrastructure/scheduling/jobs/SyncMatchesJob';
import { ResolveMarketsJob } from '../infrastructure/scheduling/jobs/ResolveMarketsJob';
import { CloseLiveMarketsJob } from '../infrastructure/scheduling/jobs/CloseLiveMarketsJob';
import { RefreshTokenPricesJob } from '../infrastructure/scheduling/jobs/RefreshTokenPricesJob';
import { BackfillMarketLinesJob } from '../infrastructure/scheduling/jobs/BackfillMarketLinesJob';
import { CleanupStreamsJob } from '../infrastructure/scheduling/jobs/CleanupStreamsJob';
import { StaleStreamCleanupJob } from '../infrastructure/scheduling/jobs/StaleStreamCleanupJob';
import { OldEndedStreamsCleanupJob } from '../infrastructure/scheduling/jobs/OldEndedStreamsCleanupJob';
import { SettlePredictionsJob } from '../infrastructure/scheduling/jobs/SettlePredictionsJob';
import { ComputeApyJob } from '../infrastructure/scheduling/jobs/ComputeApyJob';
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
import { BettingMatchFactoryIndexer } from '../infrastructure/blockchain/indexers/BettingMatchFactoryIndexer';
import { BettingMatchEventIndexer } from '../infrastructure/blockchain/indexers/BettingMatchEventIndexer';
import { LiquidityPoolIndexer } from '../infrastructure/blockchain/indexers/LiquidityPoolIndexer';
import { ChilizSwapRouterIndexer } from '../infrastructure/blockchain/indexers/ChilizSwapRouterIndexer';
import { StreamWalletIndexer } from '../infrastructure/blockchain/indexers/StreamWalletIndexer';

// ─── Presentation — Controllers ──────────────────────────────────────────────
import { CloudflareStreamWebhookController } from '../presentation/http/controllers/cloudflare-stream-webhook.controller';
import { PredictionController } from '../presentation/http/controllers/prediction.controller';
import { MatchController } from '../presentation/http/controllers/match.controller';
import { ChatController } from '../presentation/http/controllers/chat.controller';
import { WaitlistController } from '../presentation/http/controllers/waitlist.controller';
import { AuthController } from '../presentation/http/controllers/auth.controller';
import { AccessController } from '../presentation/http/controllers/access.controller';
import { StreamController } from '../presentation/http/controllers/stream.controller';
import { StreamWalletController } from '../presentation/http/controllers/stream-wallet.controller';
import { FanTokensController } from '../presentation/http/controllers/fan-tokens.controller';
import { FollowController } from '../presentation/http/controllers/follow.controller';
import { PoolController } from '../presentation/http/controllers/pool.controller';
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
  // ─── 0. Config ports ────────────────────────────────────────────────────────
  container.registerSingleton<ILogger>(TOKENS.ILogger, WinstonLogger);
  container.registerSingleton<INetworkConfig>(TOKENS.INetworkConfig, NetworkConfigService);
  container.registerSingleton<IAuthConfig>(TOKENS.IAuthConfig, AuthConfigService);

  // ─── 0b. Service ports ──────────────────────────────────────────────────────
  container.registerSingleton<IFootballApiService>(TOKENS.IFootballApiService, FootballApiAdapterImpl);
  container.registerSingleton<IBlockchainService>(TOKENS.IBlockchainService, ViemBlockchainService);
  container.registerSingleton<IIncidentReporter>(TOKENS.IIncidentReporter, LogIncidentReporter);
  container.registerSingleton<IClock>(TOKENS.IClock, SystemClock);
  container.registerSingleton<IStreamingService>(TOKENS.IStreamingService, CloudflareStreamService);

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

  // ─── 1. Repositories (Symbol tokens) ───────────────────────────────────────
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

  // ─── 1b. Repositories — blockchain indexing ────────────────────────────────
  container.registerSingleton<IIndexerCheckpointRepository>(TOKENS.IIndexerCheckpointRepository, SupabaseIndexerCheckpointRepository);
  container.registerSingleton<IBetRepository>(TOKENS.IBetRepository, SupabaseBetRepository);
  container.registerSingleton<IPoolEventRepository>(TOKENS.IPoolEventRepository, SupabasePoolEventRepository);
  container.registerSingleton<IMarketEventRepository>(TOKENS.IMarketEventRepository, SupabaseMarketEventRepository);
  container.registerSingleton<ILpPositionRepository>(TOKENS.ILpPositionRepository, SupabaseLpPositionRepository);
  container.registerSingleton<IWiringAlertRepository>(TOKENS.IWiringAlertRepository, SupabaseWiringAlertRepository);
  container.registerSingleton<IPoolApyRepository>(TOKENS.IPoolApyRepository, SupabasePoolApyRepository);

  // ─── 2. Blockchain Adapters ─────────────────────────────────────────────────
  container.registerSingleton(TokenBalanceAdapter);
  container.registerSingleton(MarketOddsAdapter);
  container.registerSingleton(MatchResolutionAdapter);
  container.registerSingleton(BettingContractDeploymentAdapter);

  // ─── 3. External Adapters ───────────────────────────────────────────────────
  container.registerSingleton(FootballApiAdapter);

  // ─── 4. Use Cases — Predictions ────────────────────────────────────────────
  container.registerSingleton(CreatePredictionUseCase);
  container.registerSingleton(GetUserPredictionsUseCase);
  container.registerSingleton(GetUserStatsUseCase);
  container.registerSingleton(SettlePredictionsUseCase);

  // ─── 5. Use Cases — Matches ────────────────────────────────────────────────
  container.registerSingleton(GetAllMatchesUseCase);
  container.registerSingleton(GetLiveMatchesUseCase);
  container.registerSingleton(GetUpcomingMatchesUseCase);
  container.registerSingleton(GetMatchByIdUseCase);
  container.registerSingleton(GetMatchesByLeagueUseCase);
  container.registerSingleton(GetMatchStatsUseCase);
  container.registerSingleton(GetBrowseMatchesUseCase);
  container.registerSingleton(ResolveFinishedMatchesUseCase);
  container.registerSingleton(CloseLiveMatchesMarketsUseCase);
  container.registerSingleton(SyncMatchesUseCase);
  container.registerSingleton(CleanupOldMatchesUseCase);

  // ─── 6. Use Cases — Chat ───────────────────────────────────────────────────
  container.registerSingleton(JoinRoomUseCase);
  container.registerSingleton(LeaveRoomUseCase);
  container.registerSingleton(SendMessageUseCase);
  container.registerSingleton(SendBetMessageUseCase);
  container.registerSingleton(GetRoomMessagesUseCase);
  container.registerSingleton(GetConnectedUsersUseCase);
  container.registerSingleton(GetChatStatsUseCase);

  // ─── 7. Use Cases — Waitlist ───────────────────────────────────────────────
  container.registerSingleton(JoinWaitlistUseCase);
  container.registerSingleton(GetWaitlistStatsUseCase);

  // ─── 7b. Access gate ───────────────────────────────────────────────────────
  container.registerSingleton<IAccessCodeVerifier>(TOKENS.IAccessCodeVerifier, ScryptAccessCodeVerifier);
  container.registerSingleton(RedeemAccessCodeUseCase);

  // ─── 8. Use Cases — Streams ────────────────────────────────────────────────
  container.registerSingleton(CreateStreamUseCase);
  container.registerSingleton(GetActiveStreamsUseCase);
  container.registerSingleton(GetPreferredStreamUseCase);
  container.registerSingleton(EndStreamUseCase);
  container.registerSingleton(UpdateViewerCountUseCase);
  container.registerSingleton(CleanupOldStreamsUseCase);

  // ─── 9. Use Cases — StreamWallet ───────────────────────────────────────────
  container.registerSingleton(GetStreamerDonationsUseCase);
  container.registerSingleton(GetStreamerSubscriptionsUseCase);
  container.registerSingleton(GetStreamerStatsUseCase);
  container.registerSingleton(GetDonorHistoryUseCase);
  container.registerSingleton(GetSubscriberHistoryUseCase);
  container.registerSingleton(StreamWalletDeploymentAdapter);
  container.registerSingleton(DeployStreamerWalletUseCase);

  // ─── 9b. Use Cases — Users (profile resolution / display) ──────────────────
  container.registerSingleton(MultiSourceUserDisplayFallback);
  container.registerSingleton(ResolveUserProfileUseCase);
  container.registerSingleton(ResolveUserProfilesBatchUseCase);
  container.registerSingleton(UpsertUserProfileUseCase);

  // ─── 9c. Use Cases — Prices (token price cache) ────────────────────────────
  container.registerSingleton(CoinGeckoPriceFeed);
  container.registerSingleton(PythPriceFeed);
  // PRICE_FEEDS — priority order: Pyth first (sub-second + free), CoinGecko
  // serves the rest. The use case picks the first supporting feed per symbol.
  container.register<ReadonlyArray<IPriceFeedService>>(PRICE_FEEDS_TOKEN, {
    useFactory: (c) => [c.resolve(PythPriceFeed), c.resolve(CoinGeckoPriceFeed)],
  });
  container.registerSingleton(RefreshTokenPricesUseCase);
  container.registerSingleton(GetTokenPricesUseCase);
  container.registerSingleton(BackfillMarketLinesUseCase);

  // ─── 10. Use Cases — FanTokens ─────────────────────────────────────────────
  container.registerSingleton(GetUserFanTokenBalancesUseCase);

  // ─── 11. Use Cases — Follows ───────────────────────────────────────────────
  container.registerSingleton(FollowStreamerUseCase);
  container.registerSingleton(UnfollowStreamerUseCase);
  container.registerSingleton(GetIsFollowingUseCase);
  container.registerSingleton(GetFollowerCountUseCase);
  container.registerSingleton(GetFollowedStreamersUseCase);

  // ─── 11b. Use Cases — Pool (APY + on-chain state) ─────────────────────────
  container.registerSingleton<IPoolStateReader>(TOKENS.IPoolStateReader, ViemPoolStateReader);
  container.registerSingleton(ComputeApyUseCase);
  container.registerSingleton(GetLatestApyUseCase);
  container.registerSingleton(GetPoolStateUseCase);

  // ─── 11c. Use Cases — Bets ─────────────────────────────────────────────────
  container.registerSingleton(GetUserBetsUseCase);

  // ─── 12. Infrastructure — Scheduling ───────────────────────────────────────
  container.registerSingleton(SyncMatchesJob);
  container.registerSingleton(ResolveMarketsJob);
  container.registerSingleton(CloseLiveMarketsJob);
  container.registerSingleton(RefreshTokenPricesJob);
  container.registerSingleton(BackfillMarketLinesJob);
  container.registerSingleton(CleanupStreamsJob);
  container.registerSingleton(StaleStreamCleanupJob);
  container.registerSingleton(OldEndedStreamsCleanupJob);
  container.registerSingleton(SettlePredictionsJob);
  container.registerSingleton(ViewerReconcileJob);
  container.registerSingleton(CloudflareReconcileJob);
  container.registerSingleton(ComputeApyJob);
  container.registerSingleton(JobScheduler);
  container.registerSingleton(RedisWarmupService);

  // ─── 13. Infrastructure — Services ─────────────────────────────────────────
  container.registerSingleton(StreamLifecycleService);
  container.registerSingleton(ViewerSessionService);

  // ─── 14. Infrastructure — Blockchain ───────────────────────────────────────
  container.registerSingleton(BlockchainEventListener);
  container.registerSingleton(BettingMatchFactoryIndexer);
  container.registerSingleton(BettingMatchEventIndexer);
  container.registerSingleton(LiquidityPoolIndexer);
  container.registerSingleton(ChilizSwapRouterIndexer);
  container.registerSingleton(StreamWalletIndexer);

  // ─── 15. Presentation — CLI Commands ───────────────────────────────────────
  container.registerSingleton(DeployMissingContractsCommand);
  container.registerSingleton(SetupMarketsCommand);
  container.registerSingleton(TestMatchLifecycleCommand);
  container.registerSingleton(ScenarioCommand);
  container.registerSingleton(ResetTestDataCommand);

  // ─── 16. Presentation — Controllers ────────────────────────────────────────
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
  container.registerSingleton(PoolController);
  container.registerSingleton(BetController);
  container.registerSingleton(UserController);
  container.registerSingleton(PricesController);
}

export { container };
