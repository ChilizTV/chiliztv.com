'use client';

import { useMemo } from 'react';
import { useDonorHistory, useSubscriberHistory, useUserProfilesBatch } from '@/hooks/api';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { displayName } from '@/lib/display/userDisplay';
import { useMyBets } from './useMyBets';
import type { ActivityRow, ActivityType } from '../domain/activity';
import type { MyBet } from '../domain/bets';

interface UseDashboardActivityArgs {
    readonly wallet: `0x${string}` | undefined;
}

export interface UseDashboardActivityResult {
    readonly rows: ReadonlyArray<ActivityRow>;
    readonly isLoading: boolean;
}

function shortRef(hash: string | null | undefined): string {
    if (!hash) return '—';
    return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function rawToUsd(raw: string | null | undefined, decimals: number | undefined): number {
    if (!raw || decimals === undefined) return 0;
    return Number(raw) / 10 ** decimals;
}

function betLabel(b: MyBet): string {
    const home = b.match?.homeTeamName;
    const away = b.match?.awayTeamName;
    const matchPart = home && away ? `${home} vs ${away}` : 'Unknown match';
    const sel = b.selection === '0' ? 'Home' : b.selection === '1' ? 'Draw' : b.selection === '2' ? 'Away' : `Sel #${b.selection}`;
    return `${matchPart} — ${sel}`;
}

function betToActivityType(status: MyBet['status']): ActivityType {
    switch (status) {
        case 'WON':      return 'bet_won';
        case 'LOST':     return 'bet_lost';
        case 'REFUNDED': return 'bet_refunded';
        case 'PENDING':
        default:         return 'bet_placed';
    }
}

/** Merges bets, donations and subs into a single feed sorted desc. */
export function useDashboardActivity({ wallet }: UseDashboardActivityArgs): UseDashboardActivityResult {
    const { assetDecimals } = usePoolDecimals();
    const bets = useMyBets({ user: wallet, filter: 'all', limit: 200 });
    const donations = useDonorHistory(wallet ?? '');
    const subs = useSubscriberHistory(wallet ?? '');

    // Resolve streamer (recipient) names for all donations + subs so the
    // row labels read "Donation to maxime" instead of "Donation to 0xa689…".
    const recipientWallets = useMemo(
        () => [
            ...(donations.data?.donations ?? []).map((d) => d.streamerAddress),
            ...(subs.data?.subscriptions ?? []).map((s) => s.streamerAddress),
        ],
        [donations.data?.donations, subs.data?.subscriptions],
    );
    const { data: recipientProfiles } = useUserProfilesBatch(recipientWallets);

    const rows = useMemo<ActivityRow[]>(() => {
        const out: ActivityRow[] = [];

        // Bets
        for (const b of bets.data?.bets ?? []) {
            const stake = rawToUsd(b.netStake, assetDecimals);
            const payout = rawToUsd(b.payout, assetDecimals);
            const isWin = b.status === 'WON';
            const isRefund = b.status === 'REFUNDED';
            // Outflow on placement; inflow on settlement.
            const placedRow: ActivityRow = {
                id: `bet:${b.txHash}:${b.logIndex}`,
                t: new Date(b.placedAt).getTime(),
                type: 'bet_placed',
                label: betLabel(b),
                amountUSDC: -stake,
                ref: shortRef(b.txHash),
            };
            out.push(placedRow);
            if (b.status !== 'PENDING') {
                out.push({
                    id: `bet-settle:${b.txHash}:${b.logIndex}`,
                    t: new Date(b.resolvedAt ?? b.placedAt).getTime(),
                    type: betToActivityType(b.status),
                    label: betLabel(b),
                    amountUSDC: isWin ? payout : isRefund ? stake : 0,
                    ref: shortRef(b.txHash),
                });
            }
        }

        // Donations — display the streamer's resolved name when available.
        for (const d of donations.data?.donations ?? []) {
            const profile = recipientProfiles?.get(d.streamerAddress.toLowerCase()) ?? null;
            out.push({
                id: `don:${d.transactionHash}`,
                t: new Date(d.timestamp).getTime(),
                type: 'donation',
                label: `Donation to ${displayName(profile, d.streamerAddress)}`,
                amountUSDC: -rawToUsd(d.amount, assetDecimals),
                ref: shortRef(d.transactionHash),
            });
        }

        // Subscriptions — same display-name strategy.
        for (const s of subs.data?.subscriptions ?? []) {
            const days = Math.round(s.durationSeconds / 86_400);
            const profile = recipientProfiles?.get(s.streamerAddress.toLowerCase()) ?? null;
            out.push({
                id: `sub:${s.transactionHash}`,
                t: new Date(s.startDate).getTime(),
                type: 'subscription',
                label: `Subscribed to ${displayName(profile, s.streamerAddress)} · ${days}d`,
                amountUSDC: -rawToUsd(s.amount, assetDecimals),
                ref: shortRef(s.transactionHash),
            });
        }

        return out.sort((a, b) => b.t - a.t);
    }, [bets.data?.bets, donations.data?.donations, subs.data?.subscriptions, recipientProfiles, assetDecimals]);

    return {
        rows,
        isLoading: bets.isLoading || donations.isLoading || subs.isLoading,
    };
}
