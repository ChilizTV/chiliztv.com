// Same image is deployed to chiliztv-api and chiliztv-workers; PROCESS_ROLE
// (read further down) decides which set of services boot.
import 'reflect-metadata';
import express from 'express';
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

app.use(securityHeadersMiddleware);

// Cloudflare Stream webhook — raw body required for HMAC verification.
// Must be registered BEFORE the global bodyParser.json() middleware.
app.use('/cloudflare-stream/webhook', express.raw({ type: 'application/json' }), cloudflareStreamWebhookRoutes);

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

if (PROCESS_ROLE === 'api' || PROCESS_ROLE === 'all') {
    // Public routes (no authentication required)
    app.use('/auth', authLimiter, authRoutes);
    app.use('/access', accessCodeLimiter, accessRoutes);
    app.use('/waitlist', waitlistRoutes);
    app.use('/stream', streamRoutes);
    app.use('/matches', matchRoutes);
    app.use('/pool', poolRoutes);
    app.use('/prices', pricesRoutes);

    // All routes below require JWT
    app.use(authenticate);

    app.use('/follows', followRoutes);
    app.use('/chat', chatLimiter, chatRoutes);
    app.use('/stream-wallet', streamWalletRoutes);
    app.use('/fan-tokens', fanTokensRoutes);
    app.use('/predictions', predictionsLimiter, predictionRoutes);
    app.use('/bets', betRoutes);
    app.use('/users', userRoutes);

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

server.listen(PORT, () => {
    logger.info('Server started', {
        port: PORT,
        role: PROCESS_ROLE,
        environment: env.NODE_ENV,
    });

    // Startup cleanup runs for api and all roles (not needed on worker-only)
    if (PROCESS_ROLE === 'api' || PROCESS_ROLE === 'all') {
        const cleanupUseCase = container.resolve(CleanupOldMatchesUseCase);
        cleanupUseCase.cleanupOutside24Hours().catch((err: Error) => {
            logger.error('Startup cleanup failed', { error: err.message });
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
