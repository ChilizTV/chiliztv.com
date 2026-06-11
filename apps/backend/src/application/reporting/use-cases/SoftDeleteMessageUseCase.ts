import { inject, injectable } from 'tsyringe';

import type { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { TOKENS } from '@chiliztv/domain/shared/tokens';

import { logger } from '../../../infrastructure/logging/logger';

/**
 * Moderation soft-delete — content is never physically removed; the row gets
 * removed_at + the triggering action id. Re-runs are no-ops (DB guard).
 * No chat system message: clients render the updated row as a muted
 * placeholder via the Realtime UPDATE.
 */
@injectable()
export class SoftDeleteMessageUseCase {
  constructor(
    @inject(TOKENS.IChatRepository) private readonly chat: IChatRepository,
    @inject(TOKENS.IClock) private readonly clock: IClock,
  ) {}

  async execute(messageId: string, actionId: string): Promise<void> {
    const result = await this.chat.softDeleteMessage(messageId, actionId, this.clock.now());
    if (!result) {
      logger.info('Soft-delete no-op (message missing or already removed)', { messageId, actionId });
      return;
    }
    logger.info('report.action soft_delete_message applied', { messageId, actionId, matchId: result.matchId });
  }
}
