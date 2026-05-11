import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { z } from 'zod';
import { JoinWaitlistUseCase } from '../../../application/waitlist/use-cases/JoinWaitlistUseCase';
import { GetWaitlistStatsUseCase } from '../../../application/waitlist/use-cases/GetWaitlistStatsUseCase';

const joinBodySchema = z.object({
  email: z.string().email().max(254).trim().toLowerCase(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  company: z.string().max(0).optional(), // honeypot
});

@injectable()
export class WaitlistController {
  constructor(
    @inject(JoinWaitlistUseCase)
    private readonly joinWaitlistUseCase: JoinWaitlistUseCase,
    @inject(GetWaitlistStatsUseCase)
    private readonly getWaitlistStatsUseCase: GetWaitlistStatsUseCase
  ) {}

  async joinWaitlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = joinBodySchema.safeParse(req.body);
      if (!parsed.success) {
        // Return 200 + ok:true even on validation failure — no info leakage
        res.json({ ok: true });
        return;
      }

      // Honeypot — silently noop
      if (parsed.data.company) {
        res.json({ ok: true });
        return;
      }

      await this.joinWaitlistUseCase.execute({
        email: parsed.data.email,
        walletAddress: parsed.data.walletAddress,
      });

      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.getWaitlistStatsUseCase.execute();
      res.json({ success: true, stats });
    } catch (error) {
      next(error);
    }
  }
}
