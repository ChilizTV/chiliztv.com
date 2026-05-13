import { Router } from 'express';
import { container } from '../../../infrastructure/config/di-container';
import { CloudflareStreamWebhookController } from '../controllers/cloudflare-stream-webhook.controller';

export const cloudflareStreamWebhookRoutes = Router();

const ctrl = container.resolve(CloudflareStreamWebhookController);

cloudflareStreamWebhookRoutes.post('/', (req, res, next) =>
  ctrl.handle(req, res).catch(next),
);
