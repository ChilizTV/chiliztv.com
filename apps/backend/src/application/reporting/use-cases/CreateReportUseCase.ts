import { inject, injectable } from 'tsyringe';

import { Report } from '@chiliztv/domain/reporting/entities/Report';
import { isEligible } from '@chiliztv/domain/reporting/policies/ReporterEligibilityPolicy';
import type { IReportRepository } from '@chiliztv/domain/reporting/repositories/IReportRepository';
import type { IBanRepository } from '@chiliztv/domain/reporting/repositories/IBanRepository';
import type { IPresenceService } from '@chiliztv/domain/reporting/ports/IPresenceService';
import type { IBetHistoryService } from '@chiliztv/domain/reporting/ports/IBetHistoryService';
import type { IReportConfigProvider } from '@chiliztv/domain/reporting/ports/IReportConfigProvider';
import type { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';
import type { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { BusinessRuleError } from '@chiliztv/domain/shared/errors/BusinessRuleError';
import { ConflictError } from '@chiliztv/domain/shared/errors/ConflictError';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { REASON_SEVERITY, type CreateReportDto } from '@chiliztv/shared';

import { EvaluateReportThresholdUseCase } from './EvaluateReportThresholdUseCase';
import { logger } from '../../../infrastructure/logging/logger';

/**
 * Files a report on behalf of the JWT wallet, then evaluates the threshold
 * inline (<50ms, no queue). Severity always comes from the server-side
 * taxonomy.
 */
@injectable()
export class CreateReportUseCase {
  constructor(
    @inject(TOKENS.IReportRepository) private readonly reports: IReportRepository,
    @inject(TOKENS.IBanRepository) private readonly bans: IBanRepository,
    @inject(TOKENS.IPresenceService) private readonly presence: IPresenceService,
    @inject(TOKENS.IBetHistoryService) private readonly betHistory: IBetHistoryService,
    @inject(TOKENS.IReportConfigProvider) private readonly config: IReportConfigProvider,
    @inject(TOKENS.IChatRepository) private readonly chat: IChatRepository,
    @inject(TOKENS.IStreamRepository) private readonly streams: IStreamRepository,
    @inject(TOKENS.IClock) private readonly clock: IClock,
    private readonly evaluateThreshold: EvaluateReportThresholdUseCase,
  ) {}

  async execute(reporterWallet: string, dto: CreateReportDto): Promise<Report> {
    const wallet = reporterWallet.toLowerCase();
    const now = this.clock.now();
    const liveContextMatchId = dto.liveContextMatchId ?? null;
    const liveContextStreamId = dto.liveContextStreamId ?? null;

    const { isSelfReport, isStreamer } = await this.classifyReporter(wallet, dto, liveContextStreamId);
    if (isSelfReport) {
      throw new BusinessRuleError('Self-reports are not allowed', { reason: 'self_report' });
    }

    const cfg = await this.config.get();
    const [activeBan, hasEverBet, eligibleWallets] = await Promise.all([
      this.bans.findActiveBan(wallet, now),
      this.betHistory.hasEverBet(wallet),
      liveContextMatchId !== null
        ? this.presence.getEligibleWallets(liveContextMatchId, cfg.minPresenceSec, now)
        : Promise.resolve([] as string[]),
    ]);

    const eligibility = isEligible({
      isPresent: eligibleWallets.includes(wallet),
      hasEverBet,
      isStreamer,
      isBanned: activeBan !== null,
      isSelfReport: false,
    });
    if (!eligibility.ok) {
      throw new BusinessRuleError('Reporter is not eligible to report this target', {
        reason: eligibility.reason,
      });
    }

    const alreadyReported = await this.reports.existsForReporter(
      wallet, dto.targetType, dto.targetId, liveContextMatchId,
    );
    if (alreadyReported) {
      throw new ConflictError('You already reported this target');
    }

    let report: Report;
    try {
      report = await this.reports.save(
        Report.create({
          targetType: dto.targetType,
          targetId: dto.targetType === 'account' ? dto.targetId.toLowerCase() : dto.targetId,
          reporterWallet: wallet,
          liveContextMatchId,
          liveContextStreamId,
          reasonCode: dto.reasonCode,
          reasonFreeText: dto.reasonFreeText ?? null,
          severity: REASON_SEVERITY[dto.reasonCode],
          createdAt: now,
        }),
      );
    } catch (err) {
      // Backstop on the partial unique dedup indexes (concurrent double-submit).
      if (err instanceof Error && err.message.includes('duplicate')) {
        throw new ConflictError('You already reported this target');
      }
      throw err;
    }

    logger.info('report.created', {
      reportId: report.props.id,
      targetType: dto.targetType,
      reasonCode: dto.reasonCode,
      severity: report.props.severity,
      liveContextMatchId,
    });

    await this.evaluateThreshold.execute({
      targetType: dto.targetType,
      targetId: report.props.targetId,
      liveContextMatchId,
      liveContextStreamId,
    });

    return report;
  }

  private async classifyReporter(
    wallet: string,
    dto: CreateReportDto,
    liveContextStreamId: string | null,
  ): Promise<{ isSelfReport: boolean; isStreamer: boolean }> {
    let isSelfReport = false;
    let isStreamer = false;

    if (dto.targetType === 'account') {
      isSelfReport = dto.targetId.toLowerCase() === wallet;
    } else if (dto.targetType === 'message') {
      const message = await this.chat.findMessageById(dto.targetId).catch(() => null);
      if (message) {
        const author = (message.toJSON() as { walletAddress?: string }).walletAddress;
        isSelfReport = author?.toLowerCase() === wallet;
      }
    } else if (dto.targetType === 'stream') {
      const stream = await this.streams.findById(dto.targetId).catch(() => null);
      const owner = stream
        ? (stream.toJSON() as { streamerWalletAddress?: string }).streamerWalletAddress
        : undefined;
      isSelfReport = owner?.toLowerCase() === wallet;
    }

    // The streamer of the live context cannot report within their own live.
    if (liveContextStreamId) {
      const ctxStream = await this.streams.findById(liveContextStreamId).catch(() => null);
      const owner = ctxStream
        ? (ctxStream.toJSON() as { streamerWalletAddress?: string }).streamerWalletAddress
        : undefined;
      isStreamer = owner?.toLowerCase() === wallet;
    }

    return { isSelfReport, isStreamer };
  }
}
