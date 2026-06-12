import { inject, injectable } from 'tsyringe';

import { Ban } from '@chiliztv/domain/reporting/entities/Ban';
import { nextBan } from '@chiliztv/domain/reporting/policies/BanEscalationPolicy';
import type { IBanRepository } from '@chiliztv/domain/reporting/repositories/IBanRepository';
import type { IModerationNotifier } from '@chiliztv/domain/reporting/ports/IModerationNotifier';
import type { IModerationAlerts } from '@chiliztv/domain/reporting/ports/IModerationAlerts';
import type { IReportConfigProvider } from '@chiliztv/domain/reporting/ports/IReportConfigProvider';
import type { QuorumSnapshot } from '@chiliztv/domain/reporting/value-objects/QuorumSnapshot';
import type { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { TOKENS } from '@chiliztv/domain/shared/tokens';

import { StopStreamUseCase } from './StopStreamUseCase';
import { banActiveKey } from '../../../shared/constants/moderation.constants';
import { logger } from '../../../infrastructure/logging/logger';

export interface BanAccountInput {
  walletAddress: string;
  quorumSnapshot: QuorumSnapshot;
  triggeredByReportId: string | null;
  triggeringLiveMatchId: number | null;
  /**
   * Admin-chosen duration: hours, or null for permanent. Undefined keeps the
   * escalation policy (auto path). escalationIndex still tracks history.
   */
  durationHoursOverride?: number | null;
}

/**
 * Escalating off-chain ban: 24h → 7d → permanent. The DB unique index
 * guarantees a single active ban; betting routes are never gated by it.
 * If the banned wallet is currently streaming, the live is stopped too.
 */
@injectable()
export class BanAccountUseCase {
  constructor(
    @inject(TOKENS.IBanRepository) private readonly bans: IBanRepository,
    @inject(TOKENS.IReportConfigProvider) private readonly config: IReportConfigProvider,
    @inject(TOKENS.IModerationNotifier) private readonly notifier: IModerationNotifier,
    @inject(TOKENS.IModerationAlerts) private readonly alerts: IModerationAlerts,
    @inject(TOKENS.IStreamRepository) private readonly streams: IStreamRepository,
    @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
    @inject(TOKENS.IClock) private readonly clock: IClock,
    private readonly stopStream: StopStreamUseCase,
  ) {}

  async execute(input: BanAccountInput): Promise<Ban> {
    const wallet = input.walletAddress.toLowerCase();
    const now = this.clock.now();

    const escalatingCount = await this.bans.countEscalating(wallet);
    const cfg = await this.config.get();
    const terms =
      input.durationHoursOverride !== undefined
        ? {
            startsAt: now,
            expiresAt:
              input.durationHoursOverride === null
                ? null
                : new Date(now.getTime() + input.durationHoursOverride * 3_600_000),
            escalationIndex: escalatingCount + 1,
          }
        : nextBan(escalatingCount, cfg, now);

    const ban = await this.bans.save(
      Ban.create({
        walletAddress: wallet,
        triggeredByReportId: input.triggeredByReportId,
        triggeringLiveMatchId: input.triggeringLiveMatchId,
        quorumSnapshot: input.quorumSnapshot,
        startsAt: terms.startsAt,
        expiresAt: terms.expiresAt,
        escalationIndex: terms.escalationIndex,
      }),
    );

    // Source of truth first, cache second: a 30s stale negative entry is the
    // worst case if the DEL fails.
    await this.cache.delete(banActiveKey(wallet));

    await this.notifier.notifyBanned(wallet, ban).catch(() => undefined);

    const snapshot = input.quorumSnapshot;
    await this.alerts
      .banIssued({
        wallet,
        source: snapshot.trigger === 'admin_manual' ? 'admin' : 'auto',
        adminWallet: snapshot.issuedBy,
        trigger: snapshot.trigger,
        reason: snapshot.reason,
        escalationIndex: ban.props.escalationIndex,
        expiresAt: ban.props.expiresAt,
      })
      .catch(() => undefined);

    // Cascade: stop any live the banned wallet is currently broadcasting.
    try {
      const active = await this.streams.findActiveStreams();
      for (const stream of active) {
        const json = stream.toJSON() as { id: string; streamerWalletAddress?: string };
        if (json.streamerWalletAddress?.toLowerCase() === wallet) {
          await this.stopStream.execute(json.id);
        }
      }
    } catch (err) {
      logger.warn('Ban stream cascade failed (ban itself is in place)', {
        wallet,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    logger.info('ban.issued', {
      wallet,
      banId: ban.props.id,
      escalationIndex: ban.props.escalationIndex,
      expiresAt: ban.props.expiresAt?.toISOString() ?? 'permanent',
      trigger: input.quorumSnapshot.trigger,
    });
    return ban;
  }
}
