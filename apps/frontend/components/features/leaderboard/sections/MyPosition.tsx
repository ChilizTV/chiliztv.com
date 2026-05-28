'use client';

import { formatUnits } from 'viem';
import { useLeaderboardTop, useMyLeaderboardPosition } from '@/hooks/api';
import { shareBps } from '../domain/buildAllocations';

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
 * Rank + cumulative score for the connected wallet, with a live projection
 * tile when the user sits in the prize top-N. Disclaimer is inline because
 * the actual payout is locked only at `closeEpoch`.
 */
export function MyPosition({ wallet }: MyPositionProps) {
    const { data: me, isLoading: meLoading } = useMyLeaderboardPosition(wallet);
    const { data: top } = useLeaderboardTop(50);

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

    if (meLoading || !me) {
        return (
            <section className="mx-auto max-w-5xl px-4 py-10">
                <div className="h-24 animate-pulse rounded-xl border border-[#1E1E1E] bg-[#111]" />
            </section>
        );
    }

    const hasScore = me.totalScore !== '0';
    const topN = top?.topN ?? 10;
    const inPrizeRange = me.rank !== null && me.rank <= topN;

    // Pro-rata share against the same top-N the CLI snapshots. Pure ratio —
    // we render % only because the leaf amount is 1e18-scaled (not USDC).
    const topRows = (top?.entries ?? []).slice(0, topN);
    const totalTopScore = topRows.reduce((acc, e) => acc + BigInt(e.totalScore), BigInt(0));
    const sharePct = inPrizeRange
        ? shareBps(BigInt(me.totalScore), totalTopScore) / 100
        : 0;

    return (
        <section className="mx-auto max-w-5xl px-4 py-10">
            <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6">
                <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
                    <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
                    Your position
                </div>

                <div className="mt-3 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                    <Stat label="Rank" value={me.rank !== null ? `#${me.rank}` : '—'} />
                    <Stat label="Cumulative payout" value={`${fmtScore(me.totalScore)} USDC`} />
                    <Stat label="Wallet" value={`${wallet.slice(0, 6)}…${wallet.slice(-4)}`} />
                    {inPrizeRange && (
                        <Stat
                            label="Projection (live)"
                            value={`${sharePct.toFixed(2)}%`}
                            tone="gold"
                        />
                    )}
                </div>

                {inPrizeRange && (
                    <div className="font-mono-ctv mt-4 text-[10px] uppercase tracking-[0.14em] text-white/45">
                        Final payout calculated when epoch closes · pool grows with each settled market
                    </div>
                )}

                {!hasScore && (
                    <div className="font-mono-ctv mt-4 text-[11px] uppercase tracking-[0.14em] text-white/45">
                        Place a winning prediction to enter the ladder.
                    </div>
                )}
            </div>
        </section>
    );
}

function Stat({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'gold' }) {
    return (
        <div>
            <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                {label}
            </div>
            <div
                className="font-display mt-1 text-[22px] font-extrabold uppercase tracking-tight tabular-nums"
                style={{ color: tone === 'gold' ? '#F5C518' : '#fff' }}
            >
                {value}
            </div>
        </div>
    );
}
