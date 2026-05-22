'use client';

import { formatUnits } from 'viem';
import { useMyLeaderboardPosition } from '@/hooks/api';

interface MyPositionProps {
    readonly wallet: string | undefined;
}

const USDC_DECIMALS = 6;

function fmtScore(raw: string): string {
    if (!raw || raw === '0') return '0';
    return Number(formatUnits(BigInt(raw), USDC_DECIMALS)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });
}

/**
 * Rank + cumulative score for the connected wallet — sits between the hero
 * stats and the ranking table. Empty state when no wallet is connected.
 */
export function MyPosition({ wallet }: MyPositionProps) {
    const { data, isLoading } = useMyLeaderboardPosition(wallet);

    if (!wallet) {
        return (
            <section className="mx-auto max-w-5xl px-4 py-10">
                <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6 text-center">
                    <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
                        <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
                        Your position
                    </div>
                    <div className="font-display mt-2 text-[20px] font-extrabold uppercase tracking-tight text-white">
                        Connect a wallet to see your rank
                    </div>
                </div>
            </section>
        );
    }

    if (isLoading || !data) {
        return (
            <section className="mx-auto max-w-5xl px-4 py-10">
                <div className="h-24 animate-pulse rounded-xl border border-[#1E1E1E] bg-[#111]" />
            </section>
        );
    }

    const hasScore = data.totalScore !== '0';

    return (
        <section className="mx-auto max-w-5xl px-4 py-10">
            <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6">
                <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
                    <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
                    Your position
                </div>

                <div className="mt-3 grid grid-cols-2 gap-6 sm:grid-cols-3">
                    <Stat label="Rank" value={data.rank !== null ? `#${data.rank}` : '—'} />
                    <Stat label="Cumulative payout" value={`${fmtScore(data.totalScore)} USDC`} />
                    <Stat label="Wallet" value={`${wallet.slice(0, 6)}…${wallet.slice(-4)}`} />
                </div>

                {!hasScore && (
                    <div className="font-mono-ctv mt-4 text-[11px] uppercase tracking-[0.14em] text-white/45">
                        Place a winning bet to enter the ladder.
                    </div>
                )}
            </div>
        </section>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                {label}
            </div>
            <div className="font-display mt-1 text-[22px] font-extrabold uppercase tracking-tight text-white">
                {value}
            </div>
        </div>
    );
}
