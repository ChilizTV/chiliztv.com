'use client';

import { useMemo } from 'react';
import { useDonorHistory, useSubscriberHistory, useUserProfilesBatch } from '@/hooks/api';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { displayName } from '@/lib/display/userDisplay';
import { useMyBets } from './useMyBets';
import type { ActivityRow, ActivityType, BetPick } from '../domain/activity';
import { tintForOutcome } from '../domain/activity';
import { fmtSelection, type MyBet } from '../domain/bets';

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
    return home && away ? `${home} vs ${away}` : 'Unknown match';
}

function betPickFor(b: MyBet): BetPick {
    return {
        label: fmtSelection(b.outcome, b.match?.homeTeamName, b.match?.awayTeamName, b.marketType, b.line),
        tint: tintForOutcome(b.marketType, b.outcome),
    };
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
    // Activity aggregates 3 sources client-side. Cap each at 50 — gives a
    // 4× cost reduction vs the previous `limit: 200`, with the trade-off
    // that a user with > 50 events in a single source loses the oldest.
    // Real merged pagination is out of scope (would need a dedicated
    // /activity endpoint with UNION ALL + cursor).
    const bets = useMyBets({ user: wallet, filter: 'all', limit: 50 });
    const donations = useDonorHistory(wallet ?? '', { limit: 50 });
    const subs = useSubscriberHistory(wallet ?? '', { limit: 50 });

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
            const stake = rawToUsd(b.stakeAmount, assetDecimals);
            const payout = rawToUsd(b.payoutAmount, assetDecimals);
            const isWin = b.status === 'WON';
            const isRefund = b.status === 'REFUNDED';
            const pick = betPickFor(b);
            // Outflow on placement; inflow on settlement.
            out.push({
                id: `bet:${b.txHash}:${b.logIndex}`,
                t: new Date(b.placedAt).getTime(),
                type: 'bet_placed',
                label: betLabel(b),
                amountUSDC: -stake,
                ref: shortRef(b.txHash),
                txHash: b.txHash,
                betPick: pick,
            });
            if (b.status !== 'PENDING') {
                out.push({
                    id: `bet-settle:${b.txHash}:${b.logIndex}`,
                    // Parimutuel collapses claim/refund into `claimedAt` —
                    // fall back to placedAt if the user hasn't claimed yet.
                    t: new Date(b.claimedAt ?? b.placedAt).getTime(),
                    type: betToActivityType(b.status),
                    label: betLabel(b),
                    amountUSDC: isWin ? payout : isRefund ? (payout || stake) : 0,
                    ref: shortRef(b.txHash),
                    txHash: b.txHash,
                    betPick: pick,
                });
            }
        }

        // Donations — `amount` is already a decimal USDC string (the
        // indexer divides by 10**decimals before persisting), so we use it
        // verbatim and do NOT apply `rawToUsd` again.
        for (const d of donations.data?.donations ?? []) {
            const profile = recipientProfiles?.get(d.streamerAddress.toLowerCase()) ?? null;
            out.push({
                id: `don:${d.transactionHash}`,
                t: new Date(d.timestamp).getTime(),
                type: 'donation',
                label: `Donation to ${displayName(profile, d.streamerAddress)}`,
                amountUSDC: -Number(d.amount ?? 0),
                ref: shortRef(d.transactionHash),
                txHash: d.transactionHash,
            });
        }

        // Subscriptions — same convention: `amount` is already decimal USDC.
        for (const s of subs.data?.subscriptions ?? []) {
            const days = Math.round(s.durationSeconds / 86_400);
            const profile = recipientProfiles?.get(s.streamerAddress.toLowerCase()) ?? null;
            out.push({
                id: `sub:${s.transactionHash}`,
                t: new Date(s.startDate).getTime(),
                type: 'subscription',
                label: `Subscribed to ${displayName(profile, s.streamerAddress)} · ${days}d`,
                amountUSDC: -Number(s.amount ?? 0),
                ref: shortRef(s.transactionHash),
                txHash: s.transactionHash,
            });
        }

        return out.sort((a, b) => b.t - a.t);
    }, [bets.data?.bets, donations.data?.donations, subs.data?.subscriptions, recipientProfiles, assetDecimals]);

    return {
        rows,
        isLoading: bets.isLoading || donations.isLoading || subs.isLoading,
    };
}
