import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { RedeemAccessCodeUseCase } from '../../../application/access/use-cases/RedeemAccessCodeUseCase';
import { env } from '../../../infrastructure/config/environment';
import { logger } from '../../../infrastructure/logging/logger';
import { redeemAccessCodeSchema } from '@chiliztv/shared/dto/access/RedeemAccessCodeDto';

const COOKIE_NAME = 'cwk_access';
const COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function parseCookieValue(req: Request): string | null {
  const header = req.headers.cookie ?? '';
  for (const chunk of header.split(';')) {
    const eqIdx = chunk.indexOf('=');
    if (eqIdx === -1) continue;
    const key = chunk.slice(0, eqIdx).trim();
    if (key === COOKIE_NAME) return decodeURIComponent(chunk.slice(eqIdx + 1).trim());
  }
  return null;
}

@injectable()
export class AccessController {
  constructor(
    @inject(RedeemAccessCodeUseCase)
    private readonly redeemUseCase: RedeemAccessCodeUseCase
  ) {}

  async redeem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = redeemAccessCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false });
        return;
      }

      // Honeypot — noop silently if company field is filled
      if (parsed.data.company) {
        res.json({ success: true });
        return;
      }

      const { granted } = await this.redeemUseCase.execute(parsed.data.code);

      logger.info('access_code_attempt', {
        ip: req.ip,
        ua: req.headers['user-agent'],
        granted,
      });

      if (!granted) {
        // 200 + success:false — wrong code is not an auth error, just a bad guess
        res.json({ success: false });
        return;
      }

      const token = jwt.sign(
        { kind: 'access' },
        env.ACCESS_CODE_COOKIE_SECRET,
        { algorithm: 'HS256', expiresIn: '7d' }
      );

      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_TTL_MS,
        path: '/',
        domain: env.NODE_ENV === 'production' ? '.chiliztv.com' : undefined,
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  logout(_req: Request, res: Response): void {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ success: true });
  }

  me(req: Request, res: Response): void {
    const raw = parseCookieValue(req);
    if (!raw) {
      res.json({ granted: false });
      return;
    }
    try {
      jwt.verify(raw, env.ACCESS_CODE_COOKIE_SECRET, { algorithms: ['HS256'] });
      res.json({ granted: true });
    } catch {
      res.json({ granted: false });
    }
  }
}
