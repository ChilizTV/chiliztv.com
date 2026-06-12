import { inject, injectable } from 'tsyringe';

import type { IBanRepository } from '@chiliztv/domain/reporting/repositories/IBanRepository';
import type { IModerationNotifier } from '@chiliztv/domain/reporting/ports/IModerationNotifier';
import type { IModerationAlerts } from '@chiliztv/domain/reporting/ports/IModerationAlerts';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { TOKENS } from '@chiliztv/domain/shared/tokens';

import { banActiveKey } from '../../../shared/constants/moderation.constants';
import { logger } from '../../../infrastructure/logging/logger';

const BATCH_SIZE = 100;

/**
 * Hygiene only — enforcement is derived from expires_at, so a stalled job
 * never keeps anyone banned. This flips rows to `expired`, purges the cache
 * key and broadcasts `lifted`.
 */
@injectable()
export class LiftExpiredBansUseCase {
  constructor(
    @inject(TOKENS.IBanRepository) private readonly bans: IBanRepository,
    @inject(TOKENS.IModerationNotifier) private readonly notifier: IModerationNotifier,
    @inject(TOKENS.IModerationAlerts) private readonly alerts: IModerationAlerts,
    @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
    @inject(TOKENS.IClock) private readonly clock: IClock,
  ) {}

  async execute(): Promise<{ expired: number }> {
    const now = this.clock.now();
    const toExpire = await this.bans.findToExpire(now, BATCH_SIZE);
    if (toExpire.length === 0) return { expired: 0 };

    await this.bans.markExpired(toExpire.map((b) => b.props.id), now);

    for (const ban of toExpire) {
      const wallet = ban.props.walletAddress;
      await this.cache.delete(banActiveKey(wallet));
      await this.notifier.notifyBanLifted(wallet).catch(() => undefined);
      await this.alerts.banLifted({ wallet, source: 'expired' }).catch(() => undefined);
      logger.info('ban.lifted', { wallet, banId: ban.props.id, cause: 'expired' });
    }
    return { expired: toExpire.length };
  }
}
