'use client';

import { formatUnits } from 'viem';
import { Eyebrow } from '../primitives';
import { useLeaderboardTop } from '@/hooks/api';
import type { MedalKind } from '../domain/medals';
import { PREVIEW_COLS, PreviewRow } from './PreviewRow';
import type { PreviewRow as PreviewRowData } from '../domain/data';

const COLUMNS = ['#', 'Predictor', 'Payouts', 'Rank', 'Vol', 'Tier'] as const;
const USDC_DECIMALS = 6;

function medalFor(rank: number): MedalKind | undefined {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    if (rank <= 10) return 'honor';
    return undefined;
}

function truncate(addr: string): string {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Live leaderboard ranking — top-N pulled from `/leaderboard/top`. */
export function PreviewTable() {
    const { data, isLoading } = useLeaderboardTop(100);
    const entries = data?.entries ?? [];

    const rows: PreviewRowData[] = entries.map((e) => {
        const payouts = Number(formatUnits(BigInt(e.totalScore), USDC_DECIMALS));
        return {
            rank: e.rank,
            who: e.username ?? truncate(e.userAddress),
            walletAddress: e.userAddress,
            username: e.username,
            avatarUrl: e.avatarUrl,
            pnl: payouts,
            win: 0,
            vol: 0,
            medal: medalFor(e.rank),
        };
    });

    return (
        <section
            id="lb-preview"
            className="relative z-2 mx-auto max-w-[1400px] px-8 py-20 sm:px-14 sm:py-24"
        >
            <div className="mb-9 flex flex-col gap-3">
                <Eyebrow>Live ranking</Eyebrow>
                <h2
                    className="font-display m-0 uppercase leading-[0.92] tracking-[-0.012em] text-white"
                    style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800 }}
                >
                    The board.{' '}
                    <span className="text-[#E8001D]">Live.</span>
                </h2>
                <p className="max-w-[640px] text-[15px] font-light leading-[1.55] text-white/55">
                    Cumulative USDC payouts from claimed wins — claiming a winning prediction is what records your score.
                </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111]">
                <div
                    className="grid items-center gap-3 border-b border-[#1E1E1E] bg-[#0F0F0F] px-5 py-3.5"
                    style={{ gridTemplateColumns: PREVIEW_COLS }}
                >
                    {COLUMNS.map((h, i) => (
                        <div
                            key={h}
                            className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.18em] text-white/45"
                            style={{ textAlign: i === COLUMNS.length - 1 ? 'right' : 'left' }}
                        >
                            {h}
                        </div>
                    ))}
                </div>

                {isLoading && rows.length === 0 && (
                    <div className="px-5 py-12 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[#E8001D]" />
                    </div>
                )}

                {!isLoading && rows.length === 0 && (
                    <div className="font-mono-ctv px-5 py-16 text-center text-[11px] uppercase tracking-[0.18em] text-white/45">
                        No wins claimed yet — claim a winning prediction to enter the board.
                    </div>
                )}

                {rows.map((row) => (
                    <PreviewRow key={row.rank} row={row} />
                ))}
            </div>
        </section>
    );
}
