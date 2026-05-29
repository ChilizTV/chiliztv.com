import { Router, type Request, type Response, type NextFunction } from 'express';
import { container } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { env } from '../../../infrastructure/config/environment';
import { adminLimiter } from '../middlewares/rate-limit.middleware';
import { logger } from '../../../infrastructure/logging/logger';

const router = Router();

/**
 * Strict Bearer-token middleware for the metrics endpoint. When
 * `METRICS_TOKEN` is unset the endpoint refuses all callers — fail closed.
 * Constant-time comparison is good enough since the token is high-entropy
 * (≥32 chars from `openssl rand -base64 48`).
 */
function requireMetricsToken(req: Request, res: Response, next: NextFunction): void {
  const expected = env.METRICS_TOKEN;
  if (!expected) {
    res.status(503).json({
      success: false,
      error: { code: 'METRICS_NOT_CONFIGURED', message: 'Metrics endpoint disabled' },
    });
    return;
  }
  const header = req.header('authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
  if (!provided) {
    res.status(401).json({
      success: false,
      error: { code: 'METRICS_AUTH_REQUIRED', message: 'Bearer token required' },
    });
    return;
  }
  if (provided !== expected) {
    logger.warn('Metrics endpoint hit with invalid token', { ip: req.ip });
    res.status(403).json({
      success: false,
      error: { code: 'METRICS_AUTH_INVALID', message: 'Invalid token' },
    });
    return;
  }
  next();
}

function todayUTCKey(now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * GET /health/metrics
 *
 * Snapshot of operational counters maintained by the workers. Gated by
 * `METRICS_TOKEN` Bearer + `adminLimiter` (1000 req/hour by JWT-or-IP). The
 * JSON shape is intentionally flat and stable so an external probe
 * (Pingdom, Better Stack) can alert on plain fields without parsing.
 */
router.get(
  '/metrics',
  adminLimiter,
  requireMetricsToken,
  async (_req: Request, res: Response) => {
    const cache = container.resolve<ICacheService>(TOKENS.ICacheService);
    const clock = container.resolve<IClock>(TOKENS.IClock);
    const now = clock.now();

    const dayKey = todayUTCKey(now);
    const apiFootballReqsKey = `metrics:apifootball:reqs:${dayKey}`;
    const apiFootballReqs = (await cache.get<number>(apiFootballReqsKey).catch(() => ({ hit: false as const })));

    res.json({
      success: true,
      timestamp: now.getTime(),
      utcDate: dayKey,
      apiFootball: {
        reqs24h: apiFootballReqs.hit ? Number(apiFootballReqs.value) : 0,
      },
    });
  },
);

export { router as metricsRoutes };
