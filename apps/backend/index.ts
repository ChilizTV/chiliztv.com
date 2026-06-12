// Same image is deployed to predcast-api and predcast-workers; PROCESS_ROLE
// (read further down) decides which set of services boot. 
import 'reflect-metadata';
import express from 'express';
import cors from "cors";
import http from 'http';
import { config } from 'dotenv';
import { securityHeadersMiddleware, env, setupDependencyInjection, container } from './src/infrastructure/config';
import { logger, createRequestLogger } from './src/infrastructure/logging';

// Safety nets — keep the process alive when Redis (or any other infra)
// throws asynchronously without a local handler. Without these, an
// upstream like Upstash hitting its quota crashes the whole API and
// triggers a Fly restart loop until the machine is force-stopped.
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
});
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { errorHandler, authenticate, globalLimiter, authLimiter, predictionsLimiter, chatLimiter, accessCodeLimiter, webhookLimiter, reportsLimiter, requireNotBanned, adminLimiter, adminGateLimiter } from './src/presentation/http/middlewares';
import { JobScheduler, BlockchainEventListener } from './src/infrastructure/services';
import { CleanupOldMatchesUseCase } from './src/application/matches/use-cases/CleanupOldMatchesUseCase';
import { RedisWarmupService } from './src/infrastructure/cache/RedisWarmupService';
import { waitForRedisReady, type RedisClient } from './src/infrastructure/cache/RedisClient';
config();
setupDependencyInjection();
import { authRoutes, accessRoutes, predictionRoutes, matchRoutes, chatRoutes, waitlistRoutes, streamRoutes, streamWalletRoutes, fanTokensRoutes, followRoutes, betRoutes, userRoutes, pricesRoutes, leaderboardRoutes, metricsRoutes, reportingRoutes, banRoutes, statsRoutes, adminRoutes, adminGateRoutes, adminAuthRoutes } from './src/presentation/http/routes';
import { cloudflareStreamWebhookRoutes } from './src/presentation/http/routes/cloudflare-stream-webhook.routes';

// Controls which responsibilities this process takes on.
// api    — HTTP server only (no background jobs or listeners)
// worker — background jobs + blockchain listeners + /health only
// all    — everything (default, used in local dev and single-process deploy)
const PROCESS_ROLE = (process.env.PROCESS_ROLE ?? 'all') as 'api' | 'worker' | 'all';

const app = express();
const server = http.createServer(app);
const PORT = env.PORT;

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());

// Honor X-Forwarded-For when running behind Fly's edge proxy so `req.ip`
// returns the originating IP instead of the proxy's. Without this, IP-based
// rate limiting collapses to a single bucket per Fly region.
app.set('trust proxy', 1);

app.use(securityHeadersMiddleware);

// Cloudflare Stream webhook — raw body required for HMAC verification.
// Must be registered BEFORE the global bodyParser.json() middleware.
app.use('/cloudflare-stream/webhook', express.raw({ type: 'application/json' }), webhookLimiter, cloudflareStreamWebhookRoutes);

app.use(express.json());

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(globalLimiter);
app.use(createRequestLogger(container.resolve<IClock>(TOKENS.IClock)));

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        role: PROCESS_ROLE,
        timestamp: Date.now(),
        version: '2.0.0',
    });
});

// Mounted on both API and worker so a worker-only Fly app is still scrapable.
// The route itself is Bearer-token-gated, so exposure is opt-in via env.
app.use('/health', metricsRoutes);

if (PROCESS_ROLE === 'api' || PROCESS_ROLE === 'all') {
    // Public routes (no authentication required)
    app.use('/auth', authLimiter, authRoutes);
    app.use('/access', accessCodeLimiter, accessRoutes);
    app.use('/waitlist', waitlistRoutes);
    app.use('/stream', streamRoutes);
    app.use('/matches', matchRoutes);
    app.use('/prices', pricesRoutes);
    app.use('/leaderboard', leaderboardRoutes);
    app.use('/stats', statsRoutes);
    app.use('/admin/gate', adminGateLimiter, adminGateRoutes);
    app.use('/admin/auth', adminGateLimiter, adminAuthRoutes);

    // All routes below require JWT
    app.use(authenticate);

    app.use('/follows', followRoutes);
    app.use('/chat', chatLimiter, chatRoutes);
    app.use('/reports', reportsLimiter, requireNotBanned, reportingRoutes);
    app.use('/bans', banRoutes);
    app.use('/stream-wallet', streamWalletRoutes);
    app.use('/fan-tokens', fanTokensRoutes);
    app.use('/predictions', predictionsLimiter, predictionRoutes);
    app.use('/bets', betRoutes);
    app.use('/users', userRoutes);
    app.use('/admin', adminLimiter, adminRoutes);

    app.get('/supabase-status', (_req, res) => {
        res.json({
            success: true,
            message: 'Supabase Chat service is running',
            realtime: true,
            port: PORT
        });
    });

    app.get('/', (_req, res) => {
        res.json({
            success: true,
            message: 'Football Chat API with Supabase Realtime',
            version: '2.0.0',
            endpoints: {
                matches: '/matches',
                chat: '/chat',
                stream: '/stream',
                supabaseStatus: '/supabase-status'
            }
        });
    });
}

// Global error handler — must be registered after all routes
app.use(errorHandler);

server.listen(PORT, async () => {
    logger.info('Server started', {
        port: PORT,
        role: PROCESS_ROLE,
        environment: env.NODE_ENV,
    });

    // Wait for Redis to be ready before kicking off work that takes locks
    // or subscribes; otherwise the first tick fires against an offline-queue
    // -disabled client and reports misleading "lock taken" skips.
    if (env.REDIS_URL && container.isRegistered(TOKENS.RedisClient)) {
        const redis = container.resolve<RedisClient>(TOKENS.RedisClient);
        await waitForRedisReady(redis);
        if (redis.status !== 'ready') {
            logger.warn('Redis not ready after timeout, proceeding anyway', { status: redis.status });
        }
    }

    // Startup cleanup runs for api and all roles (not needed on worker-only)
    if (PROCESS_ROLE === 'api' || PROCESS_ROLE === 'all') {
        const cleanupUseCase = container.resolve(CleanupOldMatchesUseCase);
        cleanupUseCase.cleanupOutside24Hours().catch((err: Error) => {
            logger.error('Startup cleanup failed', { error: err.message });
        });

        // Warm the hottest cache surfaces so the first request after a deploy
        // doesn't hit cold Supabase / RPC / API-Football. A distributed lock
        // makes the rolling-deploy second instance skip silently.
        const warmup = container.resolve(RedisWarmupService);
        warmup.run().catch((err: Error) => {
            logger.error('Cache warmup failed', { error: err.message });
        });
    }

    if (PROCESS_ROLE === 'worker' || PROCESS_ROLE === 'all') {
        const jobScheduler = container.resolve(JobScheduler);
        jobScheduler.start();

        const blockchainEventListener = container.resolve(BlockchainEventListener);
        blockchainEventListener.start().catch((error: Error) => {
            logger.error('Failed to start blockchain event listeners', { error: error.message });
        });
    }
});
