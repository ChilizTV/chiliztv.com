import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import type { Report, ReportStatus, ReportTargetType } from '@chiliztv/domain/reporting/entities/Report';
import type { Ban, BanStatus } from '@chiliztv/domain/reporting/entities/Ban';
import type { ReportAction } from '@chiliztv/domain/reporting/entities/ReportAction';
import { ListReportsUseCase } from '../../../application/admin/use-cases/ListReportsUseCase';
import { GetReportDetailUseCase } from '../../../application/admin/use-cases/GetReportDetailUseCase';
import { ReviewReportUseCase } from '../../../application/admin/use-cases/ReviewReportUseCase';
import { ListBansUseCase } from '../../../application/admin/use-cases/ListBansUseCase';
import { CreateManualBanUseCase } from '../../../application/admin/use-cases/CreateManualBanUseCase';
import { LiftBanUseCase } from '../../../application/admin/use-cases/LiftBanUseCase';
import { ReverseActionUseCase } from '../../../application/admin/use-cases/ReverseActionUseCase';
import { UpdateReportConfigUseCase } from '../../../application/admin/use-cases/UpdateReportConfigUseCase';
import type { IReportConfigProvider } from '@chiliztv/domain/reporting/ports/IReportConfigProvider';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { container, inject } from 'tsyringe';
import { auditCtx } from './audit-context';

function serializeReport(r: Report) {
    const p = r.props;
    return {
        id: p.id,
        targetType: p.targetType,
        targetId: p.targetId,
        reporterWallet: p.reporterWallet,
        liveContextMatchId: p.liveContextMatchId,
        reasonCode: p.reasonCode,
        reasonFreeText: p.reasonFreeText,
        severity: p.severity,
        status: p.status,
        triggeredActionId: p.triggeredActionId,
        createdAt: p.createdAt.toISOString(),
        reviewedAt: p.reviewedAt?.toISOString() ?? null,
        reviewedByWallet: p.reviewedByWallet,
        reviewNote: p.reviewNote,
    };
}

function serializeBan(b: Ban) {
    const p = b.props;
    return {
        id: p.id,
        walletAddress: p.walletAddress,
        status: p.status,
        quorumSnapshot: p.quorumSnapshot,
        startsAt: p.startsAt.toISOString(),
        expiresAt: p.expiresAt?.toISOString() ?? null,
        endedAt: p.endedAt?.toISOString() ?? null,
        escalationIndex: p.escalationIndex,
        liftedByWallet: p.liftedByWallet,
        liftNote: p.liftNote,
    };
}

function serializeAction(a: ReportAction) {
    const p = a.props;
    return {
        id: p.id,
        kind: p.kind,
        targetType: p.targetType,
        targetId: p.targetId,
        quorumSnapshot: p.quorumSnapshot,
        triggeredAt: p.triggeredAt.toISOString(),
        reversedAt: p.reversedAt?.toISOString() ?? null,
        reversedByWallet: p.reversedByWallet,
        affectedMessageId: p.affectedMessageId,
        affectedStreamId: p.affectedStreamId,
        affectedBanId: p.affectedBanId,
    };
}

@injectable()
export class AdminModerationController {
    constructor(
        private readonly listReports: ListReportsUseCase,
        private readonly reportDetail: GetReportDetailUseCase,
        private readonly reviewReport: ReviewReportUseCase,
        private readonly listBans: ListBansUseCase,
        private readonly createBan: CreateManualBanUseCase,
        private readonly liftBan: LiftBanUseCase,
        private readonly reverseAction: ReverseActionUseCase,
        private readonly updateConfig: UpdateReportConfigUseCase,
    ) {}

    async reports(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = await this.listReports.execute({
                status: req.query.status as ReportStatus | undefined,
                severityMin: req.query.severityMin ? Number(req.query.severityMin) : undefined,
                targetType: req.query.targetType as ReportTargetType | undefined,
                cursor: typeof req.query.cursor === 'string' ? req.query.cursor : null,
                limit: req.query.limit ? Number(req.query.limit) : 25,
            });
            res.json({
                success: true,
                data: { items: page.reports.map(serializeReport), nextCursor: page.nextCursor },
            });
        } catch (error) {
            next(error);
        }
    }

    async report(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const detail = await this.reportDetail.execute(req.params.id);
            res.json({
                success: true,
                data: {
                    report: serializeReport(detail.report),
                    triggeredAction: detail.triggeredAction ? serializeAction(detail.triggeredAction) : null,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async dismiss(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await this.reviewReport.execute(auditCtx(req), req.params.id, 'dismissed', req.body?.note ?? null);
            res.json({ success: true, data: serializeReport(report) });
        } catch (error) {
            next(error);
        }
    }

    async close(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await this.reviewReport.execute(auditCtx(req), req.params.id, 'closed', req.body?.note ?? null);
            res.json({ success: true, data: serializeReport(report) });
        } catch (error) {
            next(error);
        }
    }

    async bans(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = await this.listBans.execute({
                status: req.query.status as BanStatus | undefined,
                walletAddress: typeof req.query.wallet === 'string' ? req.query.wallet : undefined,
                cursor: typeof req.query.cursor === 'string' ? req.query.cursor : null,
                limit: req.query.limit ? Number(req.query.limit) : 25,
            });
            res.json({ success: true, data: { items: page.bans.map(serializeBan), nextCursor: page.nextCursor } });
        } catch (error) {
            next(error);
        }
    }

    async ban(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ban = await this.createBan.execute(auditCtx(req), req.body.walletAddress, req.body.reason);
            res.status(201).json({ success: true, data: serializeBan(ban) });
        } catch (error) {
            next(error);
        }
    }

    async lift(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ban = await this.liftBan.execute(auditCtx(req), req.params.id, req.body.note);
            res.json({ success: true, data: serializeBan(ban) });
        } catch (error) {
            next(error);
        }
    }

    async reverse(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const action = await this.reverseAction.execute(auditCtx(req), req.params.id, req.body?.note ?? null);
            res.json({ success: true, data: serializeAction(action) });
        } catch (error) {
            next(error);
        }
    }

    async getConfig(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const config = await container.resolve<IReportConfigProvider>(TOKENS.IReportConfigProvider).get();
            res.json({ success: true, data: config });
        } catch (error) {
            next(error);
        }
    }

    async putConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const config = await this.updateConfig.execute(auditCtx(req), req.body);
            res.json({ success: true, data: config });
        } catch (error) {
            next(error);
        }
    }
}
