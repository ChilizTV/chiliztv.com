import rateLimit, { ipKeyGenerator, type Options, type Store } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import IORedis from 'ioredis';
import type { RequestHandler, Request } from 'express';
import { URL } from 'node:url';
import { env } from '../../../infrastructure/config/environment';
import { logger } from '../../../infrastructure/logging/logger';

const isDevelopment = env.NODE_ENV === 'development';

/**
 * TEMPORARY KILL SWITCH — flip to `true` to short-circuit every limiter
 * below via `skip: () => true`. Windows / max values are kept intact so the
 * revert is one line.
 */
const RATE_LIMIT_DISABLED = false;

/**
 * Whitelist a few well-known IPs (monitoring probes, Sentry crons, on-call
 * machine). Configured via env `RATE_LIMIT_WHITELIST` CSV.
 */
const whitelist: ReadonlySet<string> = new Set(
  (process.env.RATE_LIMIT_WHITELIST ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

// Lazy singleton: a single ioredis connection dedicated to rate limiting.
// Sharing the cache `RedisClient` from DI would require resolving the
// container at module load (before bootstrap), so a small dedicated client
// is operationally cleaner. Both connect to the same Upstash instance.
let _rateLimitRedis: IORedis | null = null;
function getRateLimitRedis(): IORedis | null {
  if (!env.REDIS_URL) return null;
  if (_rateLimitRedis) return _rateLimitRedis;
  const useTls = env.REDIS_URL.startsWith('rediss://');
  const hostname = new URL(env.REDIS_URL).hostname;
  _rateLimitRedis = new IORedis(env.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    retryStrategy: (times) => Math.min(times * 200, 30_000),
    tls: useTls ? { servername: hostname } : undefined,
    keepAlive: 30_000,
    connectTimeout: 10_000,
    commandTimeout: 5_000,
  });
  _rateLimitRedis.on('error', (err: Error) => {
    logger.warn('Rate-limit Redis error (failing open)', { message: err.message });
  });
  return _rateLimitRedis;
}

function buildStore(prefix: string): Store | undefined {
  const client = getRateLimitRedis();
  if (!client) return undefined;
  // ioredis `call(command, ...args)` and rate-limit-redis `(...args: string[])`
  // are compatible at runtime; the bridge here adapts the variadic shape and
  // narrows the return to RedisReply.
  const sendCommand = ((...args: string[]) => {
    const [command, ...rest] = args;
    return client.call(command!, ...rest) as Promise<RedisReply>;
  }) as (...args: string[]) => Promise<RedisReply>;
  return new RedisStore({
    sendCommand,
    prefix: `${env.NODE_ENV}:rate:${prefix}:`,
  });
}

function commonSkip(req: Request): boolean {
  if (RATE_LIMIT_DISABLED) return true;
  const ip = req.ip ?? '';
  return whitelist.has(ip);
}

interface LimiterSpec {
  /** Stable prefix used as the Redis key namespace; do not change without invalidating buckets. */
  prefix: string;
  windowMs: number;
  max: number;
  errorCode: string;
  errorMessage: string;
  skipSuccessfulRequests?: boolean;
  /** Additional skip predicates merged with the kill switch + whitelist. */
  extraSkip?: (req: Request) => boolean;
  /** Override key generator (e.g. wallet from JWT, signature hash). Defaults to `req.ip`. */
  keyGenerator?: Options['keyGenerator'];
}

function createLimiter(spec: LimiterSpec): RequestHandler {
  const store = buildStore(spec.prefix);
  const skip = (req: Request) => commonSkip(req) || (spec.extraSkip?.(req) ?? false);
  return rateLimit({
    windowMs: spec.windowMs,
    max: spec.max,
    message: {
      success: false,
      error: { code: spec.errorCode, message: spec.errorMessage },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: spec.skipSuccessfulRequests,
    skip,
    store,
    keyGenerator: spec.keyGenerator,
    // Fail open if the Redis store throws (outage, timeout) — better than
    // 500-ing every protected route.
    passOnStoreError: true,
  });
}

/**
 * Global rate limiter - applies to all routes
 * 1000 requests per 15 minutes per IP
 */
export const globalLimiter = createLimiter({
  prefix: 'global',
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 10_000 : 1_000,
  errorCode: 'RATE_LIMIT_EXCEEDED',
  errorMessage: 'Too many requests, please try again later',
  extraSkip: (req) => req.path === '/health',
});

/**
 * Auth rate limiter - strict limits to prevent brute force
 * 5 requests per minute per IP
 */
export const authLimiter = createLimiter({
  prefix: 'auth',
  windowMs: 60 * 1000,
  max: isDevelopment ? 100 : 5,
  errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
  errorMessage: 'Too many authentication attempts, please try again in 1 minute',
  skipSuccessfulRequests: true,
});

/**
 * Predictions rate limiter - moderate limits
 * 20 requests per minute per IP
 */
export const predictionsLimiter = createLimiter({
  prefix: 'predictions',
  windowMs: 60 * 1000,
  max: isDevelopment ? 200 : 20,
  errorCode: 'PREDICTIONS_RATE_LIMIT_EXCEEDED',
  errorMessage: 'Too many prediction requests, please slow down',
});

/**
 * Chat rate limiter - generous limits for messaging
 * 100 messages per minute per IP
 */
export const chatLimiter = createLimiter({
  prefix: 'chat',
  windowMs: 60 * 1000,
  max: isDevelopment ? 1000 : 100,
  errorCode: 'CHAT_RATE_LIMIT_EXCEEDED',
  errorMessage: 'Too many messages, please slow down',
});

/**
 * Access code redeem — 5 attempts / min / IP (short window),
 * plus 20 / hour / IP (long window, skipSuccessfulRequests keeps legit users free).
 * Two limiters are applied in series via accessCodeLimiter export.
 */
const accessCodeShortLimiter = createLimiter({
  prefix: 'access-short',
  windowMs: 60 * 1000,
  max: isDevelopment ? 200 : 5,
  errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
  errorMessage: 'Too many attempts, please wait 1 minute',
});

const accessCodeHourLimiter = createLimiter({
  prefix: 'access-hour',
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 2_000 : 20,
  errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
  errorMessage: 'Too many attempts, please wait 1 hour',
  skipSuccessfulRequests: true,
});

export const accessCodeLimiter: RequestHandler[] = [accessCodeShortLimiter, accessCodeHourLimiter];

/**
 * Stream creation rate limiter - strict limits
 * 5 streams per hour per IP
 */
export const streamCreationLimiter = createLimiter({
  prefix: 'stream-create',
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 50 : 5,
  errorCode: 'STREAM_CREATION_RATE_LIMIT_EXCEEDED',
  errorMessage: 'Too many streams created, please try again later',
});

/**
 * Cloudflare Stream webhook limiter. Keyed by the upstream `webhook-signature`
 * header so an attacker cannot exhaust the bucket by spoofing IPs. Falls back
 * to `req.ip` when the header is missing (legit Cloudflare requests always
 * carry it). 60 calls / min is well above Cloudflare's actual delivery rate.
 */
export const webhookLimiter = createLimiter({
  prefix: 'webhook-cf-stream',
  windowMs: 60 * 1000,
  max: isDevelopment ? 1_000 : 60,
  errorCode: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
  errorMessage: 'Webhook delivery rate exceeded',
  keyGenerator: (req) => {
    const sig = req.header('webhook-signature') ?? '';
    if (sig) return sig.slice(0, 64);
    return req.ip ? ipKeyGenerator(req.ip) : 'unknown';
  },
});

/**
 * Admin rate limiter — gates back-office endpoints (future scope). Keyed by
 * the JWT subject when present (admin actor), falling back to IP.
 */
export const adminLimiter = createLimiter({
  prefix: 'admin',
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 10_000 : 1_000,
  errorCode: 'ADMIN_RATE_LIMIT_EXCEEDED',
  errorMessage: 'Admin action rate exceeded',
  keyGenerator: (req) => {
    const auth = (req as Request & { user?: { walletAddress?: string } }).user;
    if (auth?.walletAddress) return auth.walletAddress;
    return req.ip ? ipKeyGenerator(req.ip) : 'unknown';
  },
});
