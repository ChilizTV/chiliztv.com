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
import { AdminDirectoryController } from '../controllers/admin-directory.controller';
import { AdminMarketsController } from '../controllers/admin-markets.controller';
import { requireAdmin } from '../middlewares/require-admin.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();
const controller = container.resolve(AdminController);
const moderation = container.resolve(AdminModerationController);
const directory = container.resolve(AdminDirectoryController);
const markets = container.resolve(AdminMarketsController);

// Any active role may probe its own session.
router.get('/me', requireAdmin(), controller.me.bind(controller));
router.get('/overview', requireAdmin(), controller.overview.bind(controller));

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

// ── Directory — read-only aggregates (lot 3) ───────────────────────────────
// Players/streamers are moderator-scope (report review needs them); markets
// sit outside the moderator perimeter per the PO matrix.
router.get('/players', requireAdmin('moderator'), directory.players.bind(directory));
router.get('/players/:wallet', requireAdmin('moderator'), directory.player.bind(directory));
router.get('/streamers', requireAdmin('moderator'), directory.streamers.bind(directory));
router.get('/matches', requireAdmin('admin'), directory.matches.bind(directory));

// ── Markets — manual on-chain ops (admin+, audited) ────────────────────────
router.post('/matches/:id/deploy', requireAdmin('admin'), markets.deploy.bind(markets));
router.post('/matches/:id/close-markets', requireAdmin('admin'), markets.closeMarkets.bind(markets));

export { router as adminRoutes };
