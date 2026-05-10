import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';

export interface UserDisplayFallbackHit {
    /** Discovered username (always trimmed, non-empty). */
    readonly username: string;
    /** Which denormalized source produced the value — useful for telemetry. */
    readonly source: 'chat' | 'predictions' | 'streams';
}

/**
 * Best-effort `wallet → username` lookup driven by the legacy denormalized
 * tables. Called by `ResolveUserProfileUseCase` whenever the primary
 * `users` cache misses.
 *
 * Search order (most authoritative first):
 *  1. `chat_messages.username`  — most chatty/recent activity
 *  2. `predictions.username`    — bettors who never chatted
 *  3. `live_streams.streamer_name` — streamers who never chatted/bet
 *
 * Returns `null` when nothing matches. Throws only on RPC failure; all
 * `data === null` rows resolve to "no hit, try next source".
 */
@injectable()
export class MultiSourceUserDisplayFallback {
    async lookup(walletAddress: string): Promise<UserDisplayFallbackHit | null> {
        const addr = walletAddress.toLowerCase();
        try {
            const chatHit = await this.tryChat(addr);
            if (chatHit) return { username: chatHit, source: 'chat' };

            const predHit = await this.tryPredictions(addr);
            if (predHit) return { username: predHit, source: 'predictions' };

            const streamHit = await this.tryStreams(addr);
            if (streamHit) return { username: streamHit, source: 'streams' };

            return null;
        } catch (err) {
            logger.warn('MultiSourceUserDisplayFallback: lookup failed', {
                wallet: addr,
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    }

    private async tryChat(addr: string): Promise<string | null> {
        const { data } = await supabase
            .from('chat_messages')
            .select('username')
            .eq('wallet_address', addr)
            .neq('username', 'System')
            .not('username', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        return normaliseUsername((data as { username?: string | null } | null)?.username);
    }

    private async tryPredictions(addr: string): Promise<string | null> {
        const { data } = await supabase
            .from('predictions')
            .select('username')
            .eq('wallet_address', addr)
            .not('username', 'is', null)
            .order('placed_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        return normaliseUsername((data as { username?: string | null } | null)?.username);
    }

    private async tryStreams(addr: string): Promise<string | null> {
        const { data } = await supabase
            .from('live_streams')
            .select('streamer_name')
            .eq('streamer_wallet_address', addr)
            .not('streamer_name', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        return normaliseUsername((data as { streamer_name?: string | null } | null)?.streamer_name);
    }
}

function normaliseUsername(value: string | null | undefined): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}
