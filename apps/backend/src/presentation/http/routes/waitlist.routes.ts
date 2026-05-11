import { Router } from 'express';
import { container } from 'tsyringe';
import { WaitlistController } from '../controllers/waitlist.controller';

const router = Router();
const ctrl = () => container.resolve(WaitlistController);

router.post('/', (req, res, next) => ctrl().joinWaitlist(req, res, next));
router.get('/stats', (req, res, next) => ctrl().getStats(req, res, next));

export { router as waitlistRoutes };
