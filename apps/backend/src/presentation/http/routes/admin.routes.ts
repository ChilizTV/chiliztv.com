import { Router } from 'express';
import { z } from 'zod';
import { container } from 'tsyringe';
import {
    AdminCreateBanSchema,
    AdminLiftBanSchema,
    AdminReverseActionSchema,
    AdminReviewReportSchema,
    AdminUpdateReportConfigSchema,
} from '@chiliztv/shared/dto/admin/AdminModerationDtos';
import { AdminController } from '../controllers/admin.controller';
import { AdminModerationController } from '../controllers/admin-moderation.controller';
import { requireAdmin } from '../middlewares/require-admin.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();
const controller = container.resolve(AdminController);
const moderation = container.resolve(AdminModerationController);

// Any active role may probe its own session.
router.get('/me', requireAdmin(), controller.me.bind(controller));

// ── Moderation (moderator+) ────────────────────────────────────────────────
router.get('/reports', requireAdmin('moderator'), moderation.reports.bind(moderation));
router.get('/reports/:id', requireAdmin('moderator'), moderation.report.bind(moderation));
router.post('/reports/:id/dismiss', requireAdmin('moderator'), validate(z.object({ body: AdminReviewReportSchema })), moderation.dismiss.bind(moderation));
router.post('/reports/:id/close', requireAdmin('moderator'), validate(z.object({ body: AdminReviewReportSchema })), moderation.close.bind(moderation));
router.get('/bans', requireAdmin('moderator'), moderation.bans.bind(moderation));
router.post('/bans', requireAdmin('moderator'), validate(z.object({ body: AdminCreateBanSchema })), moderation.ban.bind(moderation));
router.post('/bans/:id/lift', requireAdmin('moderator'), validate(z.object({ body: AdminLiftBanSchema })), moderation.lift.bind(moderation));
router.post('/actions/:id/reverse', requireAdmin('moderator'), validate(z.object({ body: AdminReverseActionSchema })), moderation.reverse.bind(moderation));

// Config policy is admin-scope, not moderator (PO matrix).
router.get('/report-config', requireAdmin('moderator'), moderation.getConfig.bind(moderation));
router.put('/report-config', requireAdmin('admin'), validate(z.object({ body: AdminUpdateReportConfigSchema })), moderation.putConfig.bind(moderation));

export { router as adminRoutes };
