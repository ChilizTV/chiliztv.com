import { Router } from 'express';
import { container } from 'tsyringe';
import { AccessController } from '../controllers/access.controller';

const router = Router();

const ctrl = () => container.resolve(AccessController);

router.post('/redeem', (req, res, next) => ctrl().redeem(req, res, next));
router.post('/logout', (req, res) => ctrl().logout(req, res));
router.get('/me', (req, res) => ctrl().me(req, res));

export { router as accessRoutes };
