'use client';

import { useMemo } from 'react';
import { useBalance } from 'wagmi';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { useFanTokens } from '@/hooks/useFanTokens';
import { usePortfolioCalculation } from './usePortfolioCalculation';
import { useMyBets } from './useMyBets';
import type { MyBet } from '../domain/bets';

const MIN_POINTS_FOR_SPARKLINE = 5;

export interface DashboardStats {
    readonly portfolioUSD: number;
    /** Cumulative-PnL series derived from settled bets. Null when < 5 points. */
    readonly pnlSeries: ReadonlyArray<number> | null;
    readonly netPnlUSD: number;
    readonly netPnlPct: number;
    readonly totalWageredUSD: number;
    readonly totalWonUSD: number;
    readonly winRatePct: number;
    readonly avgOdds: number;
    readonly openBets: number;
    readonly totalBets: number;
}

export interface UseDashboardStatsResult {
    readonly data: DashboardStats;
    readonly isLoading: boolean;
}

interface UseDashboardStatsArgs {
    readonly wallet: `0x${string}` | undefined;
}

function rawToUsd(raw: string | null | undefined, decimals: number | undefined): number {
    if (!raw || decimals === undefined) return 0;
    return Number(raw) / 10 ** decimals;
}

/** Aggregated stats for the StatsHero — derived from `useMyBets` settled rows. */
export function useDashboardStats({ wallet }: UseDashboardStatsArgs): UseDashboardStatsResult {
    const { assetDecimals } = usePoolDecimals();

    const { tokenBalances, isLoading: isLoadingFanTokens } = useFanTokens(wallet, !!wallet);
    const { data: nativeBalance } = useBalance({ address: wallet });
    const { portfolioValue, isLoadingPrices } = usePortfolioCalculation(
        tokenBalances,
        nativeBalance?.formatted,
        wallet,
    );

    const bets = useMyBets({ user: wallet, filter: 'all', limit: 200 });

    const data: DashboardStats = useMemo(() => {
        const rows: ReadonlyArray<MyBet> = bets.data?.bets ?? [];
        const settled = rows.filter((b) => b.status !== 'PENDING');
        const wagered = settled.reduce((acc, b) => acc + rawToUsd(b.stakeAmount, assetDecimals), 0);
        const won = settled.reduce(
            (acc, b) => acc + (b.status === 'WON' ? rawToUsd(b.payoutAmount, assetDecimals) : 0),
            0,
        );
        const wins = settled.filter((b) => b.status === 'WON').length;
        const open = rows.filter((b) => b.status === 'PENDING').length;

        const netPnlUSD = won - wagered;
        const netPnlPct = wagered > 0 ? (netPnlUSD / wagered) * 100 : 0;
        const winRatePct = settled.length > 0 ? (wins / settled.length) * 100 : 0;

        // Cumulative-PnL series ordered by placedAt — each settled bet shifts
        // running by (payout − stake). Pari-mutuel has no fixed odds, so the
        // "average odds" stat is no longer meaningful; kept at 0 for shape compat.
        const ordered = [...settled].sort(
            (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime(),
        );
        let running = 0;
        const series = ordered.map((b) => {
            const stake = rawToUsd(b.stakeAmount, assetDecimals);
            if (b.status === 'WON') running += rawToUsd(b.payoutAmount, assetDecimals) - stake;
            else if (b.status === 'LOST') running -= stake;
            return running;
        });
        const pnlSeries = series.length >= MIN_POINTS_FOR_SPARKLINE ? series : null;

        return {
            portfolioUSD: portfolioValue ?? 0,
            pnlSeries,
            netPnlUSD,
            netPnlPct,
            totalWageredUSD: wagered,
            totalWonUSD: won,
            winRatePct,
            avgOdds: 0,
            openBets: open,
            totalBets: rows.length,
        };
    }, [bets.data?.bets, portfolioValue, assetDecimals]);

    return {
        data,
        isLoading: bets.isLoading || isLoadingFanTokens || isLoadingPrices,
    };
}
