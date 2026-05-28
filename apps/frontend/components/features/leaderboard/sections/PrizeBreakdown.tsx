'use client';

import { useLeaderboardTop } from '@/hooks/api';
import { Eyebrow } from '../primitives';
import { shareBps } from '../domain/buildAllocations';

function truncate(addr: string): string {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Pro-rata projection — top-N predictors with their projected merkle leaf
 * amount. The math here is a byte-for-byte mirror of the CLI's
 * `buildAllocations`, so the value shown matches exactly what
 * `useMyClaimableEpochs` will return once the next epoch closes.
 */
export function PrizeBreakdown() {
    const { data, isLoading } = useLeaderboardTop(50);
    const topN = data?.topN ?? 10;
    const entries = (data?.entries ?? []).slice(0, topN);
    const rows = entries.map((e) => ({
        userAddress: e.userAddress,
        totalScore: BigInt(e.totalScore),
    }));
    const totalScore = rows.reduce((acc, r) => acc + r.totalScore, BigInt(0));
    const isEmpty = !isLoading && (rows.length === 0 || totalScore === BigInt(0));

    return (
        <section
            id="lb-split"
            className="relative z-[4] mx-auto max-w-[1400px] px-8 py-20 sm:px-14 sm:py-24"
        >
            <div className="mb-12 flex flex-col gap-3">
                <Eyebrow color="#F5C518">Projection (live)</Eyebrow>
                <h2
                    className="font-display m-0 uppercase leading-[0.92] tracking-[-0.012em] text-white"
                    style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800 }}
                >
                    How the pool <span style={{ color: '#F5C518' }}>splits</span>.
                </h2>
                <p className="max-w-[620px] text-[15px] font-light leading-[1.55] text-white/55">
                    Top {topN} predictors split the pool by their share of total cumulative payouts. The bigger your score, the bigger your slice.
                </p>
            </div>

            {isLoading && (
                <div className="rounded-xl border border-[#1E1E1E] bg-[#111] px-5 py-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[#E8001D]" />
                </div>
            )}

            {isEmpty && (
                <div className="font-mono-ctv rounded-xl border border-[#1E1E1E] bg-[#111] px-5 py-16 text-center text-[11px] uppercase tracking-[0.18em] text-white/45">
                    No qualifying scores yet — predictions in progress.
                </div>
            )}

            {!isEmpty && !isLoading && (
                <div className="overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111]">
                    {entries.map((entry) => {
                        const share = shareBps(BigInt(entry.totalScore), totalScore) / 100;
                        return (
                            <div
                                key={entry.userAddress}
                                className="grid items-center gap-4 border-b border-[#1E1E1E] px-5 py-4 last:border-0"
                                style={{ gridTemplateColumns: '56px minmax(0,1fr) 1fr' }}
                            >
                                <span className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
                                    #{entry.rank}
                                </span>
                                <span className="font-mono-ctv truncate text-[12px] tabular-nums text-white/85">
                                    {truncate(entry.userAddress)}
                                </span>
                                <span
                                    className="font-display text-right text-[18px] font-extrabold uppercase tracking-tight tabular-nums"
                                    style={{ color: '#F5C518' }}
                                >
                                    {share.toFixed(2)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="font-mono-ctv mt-7 flex items-start gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
                <span aria-hidden>ⓘ</span>
                <span className="max-w-[640px] leading-[1.55]">
                    Final payout calculated when epoch closes. Pool grows with each settled market. Unclaimed funds roll over to the next epoch.
                </span>
            </div>
        </section>
    );
}
