import { injectable } from 'tsyringe';

import type { Ban } from '@chiliztv/domain/reporting/entities/Ban';
import type { IModerationNotifier } from '@chiliztv/domain/reporting/ports/IModerationNotifier';

import { supabaseClient as supabase } from '../database/supabase/client';
import { logger } from '../logging/logger';
import { banChannelName } from '../../shared/constants/moderation.constants';

/**
 * Realtime kick on the per-wallet ban channel. Broadcasts go through the
 * Supabase Realtime HTTP endpoint (`channel.send` on an unjoined channel) —
 * fire-and-forget: a failed kick is cosmetic, enforcement is server-side and
 * the frontend falls back to polling `GET /bans/me` on focus.
 *
 * Moderation deliberately emits NO chat system message — affected messages
 * surface as a muted placeholder via the soft-delete UPDATE instead.
 */
@injectable()
export class SupabaseModerationNotifier implements IModerationNotifier {
  async notifyBanned(walletAddress: string, ban: Ban): Promise<void> {
    await this.broadcast(walletAddress, 'banned', {
      expiresAt: ban.props.expiresAt?.toISOString() ?? null,
      escalationIndex: ban.props.escalationIndex,
    });
  }

  async notifyBanLifted(walletAddress: string): Promise<void> {
    await this.broadcast(walletAddress, 'lifted', {});
  }

  private async broadcast(
    walletAddress: string,
    event: 'banned' | 'lifted',
    payload: Record<string, unknown>,
  ): Promise<void> {
    const channelName = banChannelName(walletAddress);
    try {
      const channel = supabase.channel(channelName);
      // send() on an unjoined channel goes through the Realtime HTTP API.
      await channel.send({ type: 'broadcast', event, payload });
      await supabase.removeChannel(channel);
      logger.info('Moderation broadcast sent', { channel: channelName, event });
    } catch (err) {
      logger.warn('Moderation broadcast failed (clients will fall back to polling)', {
        channel: channelName,
        event,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
