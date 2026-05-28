'use client';

import { formatUnits } from 'viem';
import { useLeaderboardTop } from '@/hooks/api';

const USDC_DECIMALS = 6;

function fmtUsdc(raw: string | undefined): string {
    if (!raw || raw === '0') return '0';
    return Number(formatUnits(BigInt(raw), USDC_DECIMALS)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });
}

interface StatCellData {
    readonly label: string;
    readonly value: string;
    readonly sub: string;
}

/**
 * Four-cell stats strip below the hero. Live values pulled from the
 * leaderboard DTO — no static placeholders.
 */
export function StatsStrip() {
    const { data } = useLeaderboardTop(1);
    const topN = data?.topN ?? 10;
    const claimDurationDays = data?.claimDurationDays ?? 7;

    const cells: ReadonlyArray<StatCellData> = [
        {
            label: 'Prize pool',
            value: `${fmtUsdc(data?.currentPrizePool)} USDC`,
            sub: '▲ Funded on-chain',
        },
        {
            label: 'Volume this epoch',
            value: `${fmtUsdc(data?.currentEpochVolume)} USDC`,
            sub: 'Settled in USDC',
        },
        {
            label: 'Current epoch',
            value: `#${data?.currentEpochId ?? 0}`,
            sub: `${claimDurationDays}d claim window`,
        },
        {
            label: `Top ${topN}`,
            value: 'Pro-rata',
            sub: 'By cumulative payout',
        },
    ];

    return (
        <section
            className="relative z-[4] border-y border-[#1E1E1E]"
            style={{
                background:
                    'linear-gradient(180deg, rgba(232,0,29,0.04) 0%, rgba(10,10,10,0) 100%)',
            }}
        >
            <div className="mx-auto grid max-w-[1400px] grid-cols-2 lg:grid-cols-4">
                {cells.map((cell, i) => (
                    <Cell key={cell.label} cell={cell} last={i === cells.length - 1} />
                ))}
            </div>
        </section>
    );
}

function Cell({ cell, last }: { cell: StatCellData; last: boolean }) {
    return (
        <div
            className="relative flex flex-col justify-between gap-5 px-7 py-9 sm:px-9"
            style={{ borderRight: last ? 'none' : '1px solid #1E1E1E' }}
        >
            <div className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/45">
                {cell.label}
            </div>
            <div
                className="font-display font-extrabold uppercase leading-[0.95] tabular-nums text-white"
                style={{ fontSize: 'clamp(34px, 3.4vw, 44px)', letterSpacing: '-0.02em' }}
            >
                {cell.value}
            </div>
            <div className="font-mono-ctv flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#2dd4a4]">
                {cell.sub}
            </div>
            <span aria-hidden className="absolute bottom-5 left-7 h-0.5 w-6 bg-[#E8001D] sm:left-9" />
        </div>
    );
}
