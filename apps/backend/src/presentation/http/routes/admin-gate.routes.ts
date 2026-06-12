import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = container.resolve(AdminController);

// Public (pre-JWT) — brute force is handled by adminGateLimiter.
router.post('/', controller.gate.bind(controller));

export { router as adminGateRoutes };
