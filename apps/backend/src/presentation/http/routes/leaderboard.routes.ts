import { Router } from 'express';
import { container } from 'tsyringe';
import { LeaderboardController } from '../controllers/leaderboard.controller';

const router = Router();
const controller = container.resolve(LeaderboardController);

router.get('/top', controller.top.bind(controller));
router.get('/me/:wallet', controller.myPosition.bind(controller));
router.get('/me/:wallet/claimable', controller.myClaimable.bind(controller));

export { router as leaderboardRoutes };
