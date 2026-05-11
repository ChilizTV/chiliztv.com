import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";
import http from 'http';
import { config } from 'dotenv';
import { securityHeadersMiddleware, env, setupDependencyInjection, container } from './src/infrastructure/config';
import { logger, createRequestLogger } from './src/infrastructure/logging';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { errorHandler, authenticate, globalLimiter, authLimiter, predictionsLimiter, chatLimiter, accessCodeLimiter } from './src/presentation/http/middlewares';
import { JobScheduler, BlockchainEventListener } from './src/infrastructure/services';
import { CleanupOldMatchesUseCase } from './src/application/matches/use-cases/CleanupOldMatchesUseCase';
config();
setupDependencyInjection();
import { authRoutes, accessRoutes, predictionRoutes, matchRoutes, chatRoutes, waitlistRoutes, streamRoutes, streamWalletRoutes, fanTokensRoutes, followRoutes, poolRoutes, betRoutes, userRoutes, pricesRoutes } from './src/presentation/http/routes';
import { mediamtxWebhookRoutes } from './src/presentation/http/routes/mediamtx-webhook.routes';

const app = express();
const server = http.createServer(app);
const PORT = env.PORT;

// Parse allowed origins from environment variable (comma-separated)
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());

// Security headers (Helmet) - adapted for Web3/dev environment
app.use(securityHeadersMiddleware);

// Body parser
app.use(bodyParser.json());

// CORS with whitelist (replaces permissive cors())
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Global rate limiting
app.use(globalLimiter);

// Request logging with correlation IDs
app.use(createRequestLogger(container.resolve<IClock>(TOKENS.IClock)));

// Public routes (no authentication required)
app.use('/auth', authLimiter, authRoutes);
app.use('/access', accessCodeLimiter, accessRoutes);
app.use('/waitlist', waitlistRoutes);

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: Date.now(),
        version: '2.0.0',
    });
});

// Public stream routes (no auth needed to view streams)
app.use('/stream', streamRoutes);

// Public match data — read-only GETs, no write surface
app.use('/matches', matchRoutes);

// Public pool stats — APY snapshots, no auth required
app.use('/pool', poolRoutes);

// Public token prices — CoinGecko/Pyth cache, no auth required
app.use('/prices', pricesRoutes);

// Internal — mediamtx calls this to validate publishers
app.use('/mediamtx', mediamtxWebhookRoutes);

// Global authentication middleware - all routes below require JWT
app.use(authenticate);

app.use('/follows', followRoutes);
app.use('/chat', chatLimiter, chatRoutes);
app.use('/stream-wallet', streamWalletRoutes);
app.use('/fan-tokens', fanTokensRoutes);

app.use('/predictions', predictionsLimiter, predictionRoutes);
app.use('/bets', betRoutes);
app.use('/users', userRoutes);

app.get('/supabase-status', (req, res) => {
    res.json({
        success: true,
        message: 'Supabase Chat service is running',
        realtime: true,
        port: PORT
    });
});

app.get('/', (req, res) => {
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

// Global error handler - MUST be after all routes
app.use(errorHandler);

server.listen(PORT, () => {
    logger.info('Server started successfully', {
        port: PORT,
        environment: env.NODE_ENV,
        endpoints: {
            matches: '/matches',
            chat: '/chat',
            stream: '/stream',
            streamWallet: '/stream-wallet',
            predictions: '/predictions',
        },
    });

    // Clean up matches outside 24h window on startup
    const cleanupUseCase = container.resolve(CleanupOldMatchesUseCase);
    cleanupUseCase.cleanupOutside24Hours().catch((err: Error) => {
        logger.error('Startup cleanup failed', { error: err.message });
    });

    // Start all scheduled jobs
    const jobScheduler = container.resolve(JobScheduler);
    jobScheduler.start();

    // Start blockchain event listeners
    const blockchainEventListener = container.resolve(BlockchainEventListener);
    blockchainEventListener.start().catch((error: Error) => {
        logger.error('Failed to start blockchain event listeners', { error: error.message });
    });
});
