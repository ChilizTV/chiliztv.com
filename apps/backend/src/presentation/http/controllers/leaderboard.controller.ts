import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetLeaderboardUseCase } from '../../../application/leaderboard/use-cases/GetLeaderboardUseCase';
import { GetMyLeaderboardPositionUseCase } from '../../../application/leaderboard/use-cases/GetMyLeaderboardPositionUseCase';
import { GetMyClaimableEpochsUseCase } from '../../../application/leaderboard/use-cases/GetMyClaimableEpochsUseCase';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

@injectable()
export class LeaderboardController {
    constructor(
        @inject(GetLeaderboardUseCase)
        private readonly getLeaderboard: GetLeaderboardUseCase,
        @inject(GetMyLeaderboardPositionUseCase)
        private readonly getMyPosition: GetMyLeaderboardPositionUseCase,
        @inject(GetMyClaimableEpochsUseCase)
        private readonly getMyClaimable: GetMyClaimableEpochsUseCase,
    ) {}

    async top(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const limitRaw = (req.query.limit as string | undefined) ?? '100';
            const limit = Math.max(1, Math.min(parseInt(limitRaw, 10) || 100, 500));
            const result = await this.getLeaderboard.execute(limit);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async myPosition(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const wallet = (req.params.wallet ?? '').trim();
            if (!ADDRESS_REGEX.test(wallet)) {
                res.status(400).json({ success: false, error: 'Invalid wallet address.' });
                return;
            }
            const result = await this.getMyPosition.execute(wallet);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async myClaimable(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const wallet = (req.params.wallet ?? '').trim();
            if (!ADDRESS_REGEX.test(wallet)) {
                res.status(400).json({ success: false, error: 'Invalid wallet address.' });
                return;
            }
            const result = await this.getMyClaimable.execute(wallet);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
}
