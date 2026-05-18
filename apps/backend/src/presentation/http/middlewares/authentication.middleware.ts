import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../../infrastructure/config/jwt.config';
import { UnauthorizedError } from '@chiliztv/domain/shared/errors/UnauthorizedError';
import { JwtPayload as CustomJwtPayload } from '../../../application/auth/types/JwtPayload';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { container } from '../../../infrastructure/config/di-container';

/**
 * Extend Express Request to include user from JWT
 */
declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}

const REVOCATION_KEY_PREFIX = 'auth:revoked:';

function revocationKey(walletAddress: string): string {
  return `${REVOCATION_KEY_PREFIX}${walletAddress.toLowerCase()}`;
}

async function isRevoked(walletAddress: string | undefined): Promise<boolean> {
  if (!walletAddress) return false;
  const cache = container.resolve<ICacheService>(TOKENS.ICacheService);
  const result = await cache.get<true>(revocationKey(walletAddress));
  return result.hit;
}

/**
 * Authentication middleware - verifies JWT token + checks the revocation list.
 *
 * Revocation list pattern (cf. docs/plans/redis-integration.md §2.15): the
 * cache is *not* a verify-result cache. A future `POST /admin/ban` endpoint
 * (out of scope here) writes `auth:revoked:{wallet}` with TTL = remaining
 * JWT lifetime. This middleware checks the key *after* the cryptographic
 * verify, so a forged token still fails first.
 *
 * Usage:
 * router.get('/protected', authenticate, controller.method);
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      algorithms: [jwtConfig.algorithm],
    }) as CustomJwtPayload;

    if (await isRevoked(decoded.walletAddress)) {
      throw new UnauthorizedError('Token revoked');
    }

    // Attach user to request for downstream use
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 * Useful for endpoints that work both with and without auth
 */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      algorithms: [jwtConfig.algorithm],
    }) as CustomJwtPayload;

    if (await isRevoked(decoded.walletAddress)) {
      // Treat as not authenticated rather than throwing — caller said "optional".
      next();
      return;
    }

    req.user = decoded;

    next();
  } catch {
    // Silently ignore auth errors for optional auth
    next();
  }
}
