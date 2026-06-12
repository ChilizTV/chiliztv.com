import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminAuthController } from '../controllers/admin-auth.controller';

const router = Router();
const controller = container.resolve(AdminAuthController);

// Public (pre-JWT) — rate-limited by adminGateLimiter at mount, and the
// admin app only reaches it after the gate code.
router.post('/challenge', controller.challenge.bind(controller));
router.post('/verify', controller.verify.bind(controller));

export { router as adminAuthRoutes };
