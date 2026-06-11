import type { Ban } from '../entities/Ban';

export type ModerationSystemMessage = 'MESSAGE_REMOVED' | 'STREAM_STOPPED';

export interface IModerationNotifier {
    /** Realtime kick — failures must not block the ban itself. */
    notifyBanned(walletAddress: string, ban: Ban): Promise<void>;

    notifyBanLifted(walletAddress: string): Promise<void>;

    pushSystemMessage(
        matchId: number,
        type: ModerationSystemMessage,
        payload: Record<string, unknown>,
    ): Promise<void>;
}
