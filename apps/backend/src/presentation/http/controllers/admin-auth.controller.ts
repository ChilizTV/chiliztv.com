import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { injectable, inject } from 'tsyringe';
import { randomBytes } from 'crypto';
import { verifyMessage } from 'viem';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { jwtConfig } from '../../../infrastructure/config/jwt.config';
import { UnauthorizedError } from '@chiliztv/domain/shared/errors/UnauthorizedError';
import { logger } from '../../../infrastructure/logging/logger';

const CHALLENGE_TTL_SECONDS = 300;

function challengeKey(wallet: string): string {
    return `admin:auth:challenge:${wallet.toLowerCase()}`;
}

export function challengeMessage(wallet: string, nonce: string): string {
    return `PredCast Admin login\nWallet: ${wallet.toLowerCase()}\nNonce: ${nonce}`;
}

/**
 * Signature-based login for the admin panel. Unlike /auth/token (which
 * trusts the claimed wallet), the JWT is only issued after the wallet
 * proves key possession by signing a single-use nonce.
 */
@injectable()
export class AdminAuthController {
    constructor(
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
    ) {}

    async challenge(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const wallet = typeof req.body?.walletAddress === 'string' ? req.body.walletAddress : '';
            if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
                next(new UnauthorizedError('Invalid wallet address'));
                return;
            }
            const nonce = randomBytes(32).toString('hex');
            await this.cache.set(challengeKey(wallet), nonce, CHALLENGE_TTL_SECONDS);
            res.json({ success: true, data: { message: challengeMessage(wallet, nonce) } });
        } catch (error) {
            next(error);
        }
    }

    async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const wallet = typeof req.body?.walletAddress === 'string' ? req.body.walletAddress : '';
            const signature = typeof req.body?.signature === 'string' ? req.body.signature : '';
            if (!/^0x[0-9a-fA-F]{40}$/.test(wallet) || !signature.startsWith('0x')) {
                next(new UnauthorizedError('Invalid payload'));
                return;
            }

            const key = challengeKey(wallet);
            const stored = await this.cache.get<string>(key);
            if (!stored.hit) {
                next(new UnauthorizedError('Challenge expired — request a new one'));
                return;
            }
            // Single-use: consumed before verification so a replay finds nothing.
            await this.cache.delete(key);

            const valid = await verifyMessage({
                address: wallet as `0x${string}`,
                message: challengeMessage(wallet, stored.value),
                signature: signature as `0x${string}`,
            });
            if (!valid) {
                next(new UnauthorizedError('Signature verification failed'));
                return;
            }

            const token = jwt.sign(
                { email: null, walletAddress: wallet.toLowerCase(), role: 'USER' },
                jwtConfig.secret,
                { expiresIn: jwtConfig.expiresIn, issuer: jwtConfig.issuer, algorithm: jwtConfig.algorithm },
            );
            logger.info('Admin JWT issued after signature proof', { walletAddress: wallet.toLowerCase() });
            res.json({ success: true, token, expiresIn: jwtConfig.expiresIn });
        } catch (error) {
            next(error);
        }
    }
}
