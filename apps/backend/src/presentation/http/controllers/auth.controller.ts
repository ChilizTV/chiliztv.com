import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { jwtConfig } from '../../../infrastructure/config/jwt.config';
import { UnauthorizedError } from '@chiliztv/domain/shared/errors/UnauthorizedError';
import { logger } from '../../../infrastructure/logging/logger';

@injectable()
export class AuthController {
  /** POST /auth/token — generates a JWT for the connected wallet. */
  async generateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, walletAddress } = req.body;

      if (!walletAddress) {
        next(new UnauthorizedError('Wallet address is required'));
        return;
      }

      const payload = {
        email: email ?? null,
        walletAddress: walletAddress.toLowerCase(),
        role: 'USER',
      };

      const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
        issuer: jwtConfig.issuer,
        algorithm: jwtConfig.algorithm,
      });

      logger.info('JWT token generated', { email, walletAddress });

      res.json({
        success: true,
        token,
        expiresIn: jwtConfig.expiresIn,
        user: {
          email: email ?? null,
          walletAddress: walletAddress.toLowerCase(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
