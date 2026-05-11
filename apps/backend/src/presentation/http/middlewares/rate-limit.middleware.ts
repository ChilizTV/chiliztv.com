import rateLimit from 'express-rate-limit';
import { env } from '../../../infrastructure/config/environment';

const isDevelopment = env.NODE_ENV === 'development';

/**
 * TEMPORARY KILL SWITCH — flip to `true` to short-circuit every limiter
 * below via `skip: () => true`. Windows / max values are kept intact so the
 * revert is one line.
 */
const RATE_LIMIT_DISABLED = false;

/**
 * Global rate limiter - applies to all routes
 * 1000 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 1000, // Higher limit in dev
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => RATE_LIMIT_DISABLED || req.path === '/health',
});

/**
 * Auth rate limiter - strict limits to prevent brute force
 * 5 requests per minute per IP
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 100 : 5,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again in 1 minute',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful auth attempts
  skip: () => RATE_LIMIT_DISABLED,
});

/**
 * Predictions rate limiter - moderate limits
 * 20 requests per minute per IP
 */
export const predictionsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 200 : 20,
  message: {
    success: false,
    error: {
      code: 'PREDICTIONS_RATE_LIMIT_EXCEEDED',
      message: 'Too many prediction requests, please slow down',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => RATE_LIMIT_DISABLED,
});

/**
 * Chat rate limiter - generous limits for messaging
 * 100 messages per minute per IP
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 1000 : 100,
  message: {
    success: false,
    error: {
      code: 'CHAT_RATE_LIMIT_EXCEEDED',
      message: 'Too many messages, please slow down',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => RATE_LIMIT_DISABLED,
});

/**
 * Access code redeem — 5 attempts / min / IP (short window),
 * plus 20 / hour / IP (long window, skipSuccessfulRequests keeps legit users free).
 * Two limiters are applied in series via accessCodeLimiter export.
 */
const accessCodeShortLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDevelopment ? 200 : 5,
  message: {
    success: false,
    error: { code: 'AUTH_RATE_LIMIT_EXCEEDED', message: 'Too many attempts, please wait 1 minute' },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => RATE_LIMIT_DISABLED,
});

const accessCodeHourLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 2000 : 20,
  message: {
    success: false,
    error: { code: 'AUTH_RATE_LIMIT_EXCEEDED', message: 'Too many attempts, please wait 1 hour' },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => RATE_LIMIT_DISABLED,
});

import { RequestHandler } from 'express';

export const accessCodeLimiter: RequestHandler[] = [accessCodeShortLimiter, accessCodeHourLimiter];

/**
 * Stream creation rate limiter - strict limits
 * 5 streams per hour per IP
 */
export const streamCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 50 : 5,
  message: {
    success: false,
    error: {
      code: 'STREAM_CREATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many streams created, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => RATE_LIMIT_DISABLED,
});
