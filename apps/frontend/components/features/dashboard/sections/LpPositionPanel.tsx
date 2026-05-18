'use client';

import { useMemo } from 'react';
import type { LpPosition } from '@/hooks/useLpPosition';
import { useLiquidityPool } from '@/hooks/useLiquidityPool';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { usePoolApy } from '@/hooks/api/usePoolApy';
import { chilizConfig } from '@/config/chiliz.config';
import { formatUnits } from 'viem';
import { DashEyebrow } from '../components/DashEyebrow';
import { ActionPill } from '../components/ActionPill';
import { Sparkline } from '../components/Sparkline';
import { PnlBadge } from '../components/PnlBadge';
import { EmptyCard } from '../components/EmptyState';
import { EMPTY_ICONS } from '../components/EmptyIcons';
import { SectionHeadDash } from '../components/SectionHeadDash';
import { fmtUsd, fmtNum, fmtCountdown } from '../domain/formatters';

interface LpPositionPanelProps {
    readonly lp: LpPosition;
    readonly onDeposit: () => void;
    readonly onWithdraw: () => void;
}

const COOLDOWN_TOTAL_SEC = 60 * 60; // contract default — used to compute the progress bar

function bigToNum(value: bigint | undefined, decimals: number | undefined): number {
    if (value === undefined || decimals === undefined) return 0;
    return Number(formatUnits(value, decimals));
}

export function LpPositionPanel({ lp, onDeposit, onWithdraw }: LpPositionPanelProps) {
    const { assetDecimals, shareDecimals } = usePoolDecimals();
    const { stats } = useLiquidityPool(chilizConfig.liquidityPool, undefined);
    const apy = usePoolApy();

    const hasPosition = (lp.shares ?? BigInt(0)) > BigInt(0);
    const cooldownReady = lp.cooldownRemainingSec <= 0;
    const cooldownPct = useMemo(() => {
        if (cooldownReady) return 100;
        const total = stats.depositCooldownSeconds ?? COOLDOWN_TOTAL_SEC;
        return Math.min(100, ((total - lp.cooldownRemainingSec) / total) * 100);
    }, [cooldownReady, lp.cooldownRemainingSec, stats.depositCooldownSeconds]);

    if (!hasPosition) {
        const apy7dEmpty = apy.data?.apy7d?.apyBps != null ? apy.data.apy7d.apyBps / 100 : null;
        const apySeriesEmpty = apy7dEmpty != null
            ? [apy7dEmpty * 0.95, apy7dEmpty * 1.02, apy7dEmpty * 0.98, apy7dEmpty, apy7dEmpty * 1.04, apy7dEmpty]
            : null;
        const tvlEmpty = bigToNum(stats.totalAssets, assetDecimals);

        return (
            <section id="pool" className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-4 pt-16 sm:px-14">
                <SectionHeadDash
                    eyebrow="Liquidity · Pool"
                    title={
                        <>
                            Become the <span className="text-[#E8001D]">house.</span>
                        </>
                    }
                />
                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                    <EmptyCard
                        icon={EMPTY_ICONS.pool}
                        title="You're not in the pool yet"
                        lead="Deposit USDC to underwrite every losing prediction on the platform. Your share earns yield from the protocol's net house edge — not from inflation."
                        cta="Open the pool →"
                        onCta={onDeposit}
                        tip="ERC-4626 vault · withdrawal cooldown 1h · exit fee 1.5%"
                    />
                    <div className="grid gap-4">
                        <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6">
                            <DashEyebrow dim>Pool TVL</DashEyebrow>
                            <div className="font-display mt-4 text-[28px] font-extrabold leading-none tracking-[-0.02em] text-white">
                                {fmtUsd(tvlEmpty, { compact: true, dp: 0 })}
                                <span className="ml-2 text-[14px] text-white/45">USDC</span>
                            </div>
                            <div className="font-mono-ctv mt-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
                                Total value locked across all LPs
                            </div>
                        </div>
                        <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6">
                            <DashEyebrow dim>APY · 7d</DashEyebrow>
                            <div className="font-display mt-4 text-[28px] font-extrabold leading-none tracking-[-0.02em] text-[#2dd4a4]">
                                {apy7dEmpty != null ? `${apy7dEmpty.toFixed(1)}%` : '—'}
                            </div>
                            {apySeriesEmpty && (
                                <Sparkline data={apySeriesEmpty} width={200} height={32} stroke="#2dd4a4" />
                            )}
                            {apy7dEmpty == null && (
                                <div className="font-mono-ctv mt-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
                                    Needs ≥7d of pool history
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const assetsUSDC = bigToNum(lp.assetsValue, assetDecimals);
    const costBasisUSDC = bigToNum(lp.costBasis, assetDecimals);
    const unrealizedUSDC = bigToNum(lp.unrealizedGain, assetDecimals);
    const feePreviewUSDC = bigToNum(lp.withdrawalFeePreview, assetDecimals);
    const sharesNum = bigToNum(lp.shares, shareDecimals);
    const totalAssets = bigToNum(stats.totalAssets, assetDecimals);
    const totalSupply = bigToNum(stats.totalSupply, shareDecimals);
    const yourSharePct = totalSupply > 0 ? (sharesNum / totalSupply) * 100 : 0;
    const unrealizedPct = costBasisUSDC > 0 ? (unrealizedUSDC / costBasisUSDC) * 100 : 0;
    const withdrawalFeeBps = stats.lpWithdrawalFeeBps ?? 0;

    const apy7d = apy.data?.apy7d?.apyBps != null ? apy.data.apy7d.apyBps / 100 : null;
    // The backend returns single snapshots, not a series. Fake a flat series only when we have a value to render the spark; otherwise hide it.
    const apySeries = apy7d != null ? [apy7d * 0.95, apy7d * 1.02, apy7d * 0.98, apy7d, apy7d * 1.04, apy7d] : null;

    return (
        <section id="pool" className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-4 pt-16 sm:px-14">
            <SectionHeadDash
                eyebrow="Liquidity provider · Pool"
                title={
                    <>
                        Your share of <span className="text-[#E8001D]">the house.</span>
                    </>
                }
                right={
                    <div className="flex flex-wrap items-center gap-3">
                        <ActionPill onClick={onWithdraw} disabled={!cooldownReady}>
                            {cooldownReady ? 'Withdraw' : `Locked · ${fmtCountdown(lp.cooldownRemainingSec * 1000)}`}
                        </ActionPill>
                        <ActionPill primary onClick={onDeposit}>
                            Deposit more <span aria-hidden>→</span>
                        </ActionPill>
                    </div>
                }
            />

            <div className="grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
                {/* Hero LP card — 2 cols × 2 rows */}
                <div className="relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111] p-7 transition-colors hover:border-[#2A2A2A] lg:col-span-2 lg:row-span-2">
                    <div
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, #E8001D, transparent)' }}
                    />
                    <DashEyebrow dim>Position · USDC</DashEyebrow>

                    <div
                        className="font-display mt-6 leading-none tracking-[-0.02em] text-white"
                        style={{ fontSize: 'clamp(44px, 4.4vw, 64px)', fontWeight: 800 }}
                    >
                        {fmtUsd(assetsUSDC, { dp: 2 })}
                    </div>
                    {costBasisUSDC > 0 && (
                        <div className="mt-3">
                            <PnlBadge value={unrealizedPct} suffix="%" size="lg" />
                        </div>
                    )}
                    <div className="font-mono-ctv mt-3 text-[11px] uppercase tracking-[0.18em] text-white/45">
                        {fmtNum(sharesNum)} shares
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#1E1E1E] pt-6">
                        <div>
                            <div className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/45">Cost basis</div>
                            <div className="font-display mt-2 text-[22px] font-bold leading-none tracking-[-0.01em] text-white">
                                {fmtUsd(costBasisUSDC, { dp: 0 })}
                            </div>
                        </div>
                        <div>
                            <div className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/45">Unrealized</div>
                            <div
                                className="font-display mt-2 text-[22px] font-bold leading-none tracking-[-0.01em]"
                                style={{ color: unrealizedUSDC >= 0 ? '#2dd4a4' : '#FF1737' }}
                            >
                                {fmtUsd(unrealizedUSDC, { signed: true, dp: 0 })}
                            </div>
                        </div>
                        <div>
                            <div className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/45">
                                Exit fee · {(withdrawalFeeBps / 100).toFixed(2)}%
                            </div>
                            <div className="font-display mt-2 text-[22px] font-bold leading-none tracking-[-0.01em] text-white/65">
                                {fmtUsd(feePreviewUSDC, { dp: 2 })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* APY 7d */}
                <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6 transition-colors hover:border-[#2A2A2A]">
                    <DashEyebrow dim>APY · 7d trailing</DashEyebrow>
                    <div className="mt-4 flex items-baseline gap-2">
                        <div className="font-display text-[44px] font-extrabold leading-none tracking-[-0.02em] text-white">
                            {apy7d != null ? apy7d.toFixed(1) : '—'}
                            {apy7d != null && <span className="text-white/45">%</span>}
                        </div>
                    </div>
                    {apySeries && (
                        <div className="mt-3">
                            <Sparkline data={apySeries} width={260} height={40} stroke="#2dd4a4" />
                        </div>
                    )}
                    <div className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
                        {apy7d != null ? 'Net of fees · backend feed' : 'Needs ≥7d of pool history'}
                    </div>
                </div>

                {/* Cooldown */}
                <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6 transition-colors hover:border-[#2A2A2A]">
                    <DashEyebrow dim accent={cooldownReady ? '#2dd4a4' : '#F5C518'}>
                        Withdrawal cooldown
                    </DashEyebrow>
                    <div
                        className="font-display mt-4 text-[44px] font-extrabold leading-none tracking-[-0.02em]"
                        style={{ color: cooldownReady ? '#2dd4a4' : '#fff' }}
                    >
                        {cooldownReady ? 'Ready' : fmtCountdown(lp.cooldownRemainingSec * 1000)}
                    </div>
                    <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full border border-[#1E1E1E] bg-[#1A1A1A]">
                        <div
                            className="h-full"
                            style={{
                                width: `${cooldownPct}%`,
                                background: cooldownReady ? '#2dd4a4' : 'linear-gradient(90deg,#F5C518,#E8001D)',
                            }}
                        />
                    </div>
                    <div className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
                        {cooldownReady ? 'Free to withdraw' : 'Since lastDepositAt'}
                    </div>
                </div>

                {/* Pool TVL share */}
                <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6 transition-colors hover:border-[#2A2A2A]">
                    <DashEyebrow dim>Pool TVL · your share</DashEyebrow>
                    <div className="mt-4 flex items-baseline gap-2">
                        <div className="font-display text-[28px] font-extrabold leading-none tracking-[-0.02em] text-white">
                            {fmtUsd(totalAssets, { compact: true, dp: 0 })}
                        </div>
                        <div className="font-mono-ctv text-[11px] uppercase tracking-[0.18em] text-white/45">USDC</div>
                    </div>
                    <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full border border-[#1E1E1E] bg-[#1A1A1A]">
                        <div className="h-full bg-[#E8001D]" style={{ width: `${Math.max(2, yourSharePct)}%` }} />
                    </div>
                    <div className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
                        You hold <span className="text-white">{yourSharePct.toFixed(2)}%</span> of supply
                    </div>
                </div>
            </div>
        </section>
    );
}
