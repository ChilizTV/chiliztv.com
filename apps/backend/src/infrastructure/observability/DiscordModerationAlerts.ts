import { injectable } from 'tsyringe';

import type {
    BanIssuedAlert,
    BanLiftedAlert,
    IModerationAlerts,
} from '@chiliztv/domain/reporting/ports/IModerationAlerts';

import { env } from '../config/environment';
import { logger } from '../logging/logger';

const RED = 0xe8001d;
const GREEN = 0x2dd4a4;
const TIMEOUT_MS = 5000;

function short(wallet: string): string {
    return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}

function banSource(alert: BanIssuedAlert): string {
    if (alert.source === 'admin') return `Admin — \`${alert.adminWallet ?? 'unknown'}\``;
    return alert.trigger === 'severity_bypass' ? 'Auto — severity bypass' : 'Auto — report quorum';
}

function duration(expiresAt: Date | null): string {
    if (!expiresAt) return 'Permanent';
    return `until <t:${Math.floor(expiresAt.getTime() / 1000)}:f>`;
}

/**
 * Posts ban lifecycle embeds to the Discord #admin channel webhook.
 * No-op when DISCORD_ADMIN_WEBHOOK_URL is unset; never throws — a Discord
 * outage must not fail a ban.
 */
@injectable()
export class DiscordModerationAlerts implements IModerationAlerts {
    async banIssued(alert: BanIssuedAlert): Promise<void> {
        await this.post({
            title: `🔨 Ban — ${short(alert.wallet)}`,
            description: `\`${alert.wallet}\``,
            color: RED,
            fields: [
                { name: 'Source', value: banSource(alert), inline: true },
                { name: 'Duration', value: duration(alert.expiresAt), inline: true },
                { name: 'Escalation', value: `#${alert.escalationIndex}`, inline: true },
                ...(alert.reason ? [{ name: 'Reason', value: alert.reason.slice(0, 1000), inline: false }] : []),
            ],
        });
    }

    async banLifted(alert: BanLiftedAlert): Promise<void> {
        await this.post({
            title: `✅ Unban — ${short(alert.wallet)}`,
            description: `\`${alert.wallet}\``,
            color: GREEN,
            fields: [
                {
                    name: 'Source',
                    value: alert.source === 'admin' ? `Admin — \`${alert.adminWallet ?? 'unknown'}\`` : 'Auto — ban expired',
                    inline: true,
                },
                ...(alert.note ? [{ name: 'Note', value: alert.note.slice(0, 1000), inline: false }] : []),
            ],
        });
    }

    private async post(embed: object): Promise<void> {
        const url = env.DISCORD_ADMIN_WEBHOOK_URL;
        if (!url) return;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] }),
                signal: AbortSignal.timeout(TIMEOUT_MS),
            });
            if (!res.ok) {
                logger.warn('Discord moderation alert rejected', { status: res.status });
            }
        } catch (err) {
            logger.warn('Discord moderation alert failed', {
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
}
