import { Request, Response, NextFunction, RequestHandler } from 'express';
import { container } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IAdminAccessService } from '@chiliztv/domain/admin/ports/IAdminAccessService';
import { isAllowed } from '@chiliztv/domain/admin/policies/AdminRolePolicy';
import type { AdminRole } from '@chiliztv/domain/admin/types';
import { ForbiddenError } from '@chiliztv/domain/shared/errors/ForbiddenError';
import { isGateTokenValid } from './admin-gate';
import { UnauthorizedError } from '@chiliztv/domain/shared/errors/UnauthorizedError';

declare global {
  namespace Express {
    interface Request {
      admin?: { wallet: string; role: AdminRole };
    }
  }
}

/**
 * RBAC gate — stacked after `authenticate`. The role comes from a cached
 * `admin_wallets` lookup, never from JWT claims, so revocation is effective
 * within the cache TTL without re-login.
 */
export function requireAdmin(...allowed: AdminRole[]): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallet = req.user?.walletAddress;
      if (!wallet) throw new UnauthorizedError();

      // Pre-wallet gate token (X-Admin-Gate) — a stolen JWT alone is not enough.
      const gate = req.header('x-admin-gate') ?? undefined;
      if (!isGateTokenValid(gate, new Date())) {
        throw new ForbiddenError('Admin gate required');
      }

      const access = container.resolve<IAdminAccessService>(TOKENS.IAdminAccessService);
      const role = await access.getActiveRole(wallet);
      if (!role) throw new ForbiddenError('Account is not an admin');
      if (allowed.length > 0 && !isAllowed(role, allowed)) {
        throw new ForbiddenError('Insufficient admin role');
      }

      req.admin = { wallet: wallet.toLowerCase(), role };
      next();
    } catch (err) {
      next(err);
    }
  };
}
