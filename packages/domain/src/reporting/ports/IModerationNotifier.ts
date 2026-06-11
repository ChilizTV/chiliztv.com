import type { Ban } from '../entities/Ban';

export interface IModerationNotifier {
    /** Realtime kick — failures must not block the ban itself. */
    notifyBanned(walletAddress: string, ban: Ban): Promise<void>;

    notifyBanLifted(walletAddress: string): Promise<void>;
}
