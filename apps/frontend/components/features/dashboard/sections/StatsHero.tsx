'use client';

import { HeroStat } from '../components/HeroStat';
import { SecondaryStat } from '../components/SecondaryStat';
import { PnlBadge } from '../components/PnlBadge';
import { WinRateBar } from '../components/WinRateBar';
import { DashEyebrow } from '../components/DashEyebrow';
import { ActionPill } from '../components/ActionPill';
import { PlaceholderSparkline } from '../components/PlaceholderSparkline';
import { fmtUsd } from '../domain/formatters';
import type { DashboardStats } from '../hooks/useDashboardStats';

interface StatsHeroProps {
    readonly stats: DashboardStats;
    readonly onPlaceFirstBet?: () => void;
    readonly onJoinPool?: () => void;
}

const EMPTY_PLACEHOLDERS = [
    { eyebrow: 'Net PnL · all time',         value: '—', sub: '0 predictions settled' },
    { eyebrow: 'Win rate · 0 predictions',   value: '—', sub: 'Avg odds × —' },
    { eyebrow: 'Open positions',             value: '0', sub: 'Nothing pending' },
] as const;

export function StatsHero({ stats, onPlaceFirstBet, onJoinPool }: StatsHeroProps) {
    const isEmpty = stats.totalBets === 0 && stats.openBets === 0 && stats.portfolioUSD === 0;

    if (isEmpty) {
        return (
            <section className="relative z-[4] mx-auto max-w-[1400px] px-8 pt-12 sm:px-14">
                <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
                    <div className="relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111] p-7">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(232,0,29,0.10), transparent 65%)',
                                filter: 'blur(8px)',
                            }}
                        />
                        <DashEyebrow dim>Portfolio · USDC equivalent</DashEyebrow>
                        <div
                            className="font-display mt-6 leading-[0.92] tracking-[-0.02em] text-white/30"
                            style={{ fontSize: 'clamp(56px, 6vw, 80px)', fontWeight: 800 }}
                        >
                            $0.00
                        </div>
                        <div className="font-mono-ctv mt-3 text-[11px] uppercase tracking-[0.18em] text-white/35">
                            No predictions · no LP shares · no fan tokens
                        </div>
                        <div className="mt-8">
                            <PlaceholderSparkline width={520} height={48} />
                        </div>
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <ActionPill primary onClick={onPlaceFirstBet}>
                                Make your first prediction →
                            </ActionPill>
                            <ActionPill onClick={onJoinPool}>Or join the pool</ActionPill>
                        </div>
                    </div>

                    {EMPTY_PLACEHOLDERS.map((c) => (
                        <div key={c.eyebrow} className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6">
                            <DashEyebrow dim>{c.eyebrow}</DashEyebrow>
                            <div
                                className="font-display mt-5 leading-none tracking-[-0.02em] text-white/30"
                                style={{ fontSize: 'clamp(34px, 3vw, 44px)', fontWeight: 800 }}
                            >
                                {c.value}
                            </div>
                            <div className="font-mono-ctv mt-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
                                {c.sub}
                            </div>
                            <div className="mt-4 h-[6px] w-full rounded-full border border-[#1E1E1E] bg-[#1A1A1A]" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="relative z-[4] mx-auto max-w-[1400px] px-8 pt-12 sm:px-14">
            <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
                <HeroStat
                    eyebrow="Portfolio · USDC equivalent"
                    value={fmtUsd(stats.portfolioUSD, { dp: 2 })}
                    sub="Across CHZ · LP shares · fan tokens"
                    spark={stats.pnlSeries ?? undefined}
                    sparkColor="#2dd4a4"
                />
                <SecondaryStat
                    eyebrow="Net PnL · all time"
                    value={
                        <span style={{ color: stats.netPnlUSD >= 0 ? '#2dd4a4' : '#FF1737' }}>
                            {fmtUsd(stats.netPnlUSD, { signed: true })}
                        </span>
                    }
                    sub={`${fmtUsd(stats.totalWonUSD)} won / ${fmtUsd(stats.totalWageredUSD)} wagered`}
                >
                    {stats.totalWageredUSD > 0 && <PnlBadge value={stats.netPnlPct} suffix="%" />}
                </SecondaryStat>
                <SecondaryStat
                    eyebrow={`Win rate · ${stats.totalBets} predictions`}
                    value={`${stats.winRatePct.toFixed(0)}%`}
                    sub={stats.avgOdds > 0 ? `Avg odds × ${stats.avgOdds.toFixed(2)}` : '—'}
                >
                    {stats.totalBets > 0 && <WinRateBar pct={stats.winRatePct} />}
                </SecondaryStat>
                <SecondaryStat
                    eyebrow="Open positions"
                    value={stats.openBets}
                    sub={`${stats.totalBets} lifetime predictions`}
                >
                    {stats.openBets > 0 && (
                        <div className="font-mono-ctv flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
                            <span className="ctv-pulse-dot inline-block h-[6px] w-[6px] rounded-full bg-[#F5C518]" />
                            Awaiting settlement
                        </div>
                    )}
                </SecondaryStat>
            </div>
        </section>
    );
}
