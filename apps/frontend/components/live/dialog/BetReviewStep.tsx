'use client';

import type { ReactNode } from 'react';

interface BetReviewStepProps {
    readonly homeTeam?: string;
    readonly awayTeam?: string;
    readonly leagueLabel: string;
    readonly marketBadge: string;
    readonly marketLabel: string;
    readonly selectionLabel: string;
    readonly stakeLabel: string;
    readonly stakeUsdcEquiv: string | null;
    readonly slippageBps: number | null;
    /** Net payout if pick wins — already post-fee, mirrors PariMatchBase payout(). */
    readonly netPayoutUsdc: number | null;
    /** Protocol fee in bps (informational). */
    readonly feeBps: number;
    /** Slice of fee re-routed to the leaderboard pool (informational). */
    readonly leaderboardFeeBps?: number;
}

function fmtUsd(n: number, dp = 2) {
    const sign = n < 0 ? '-' : '';
    return sign + '$' + Math.abs(n).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function Row({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-[#1E1E1E] py-3 last:border-0">
            <span className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{label}</span>
            <span
                className={`text-right text-[14px] font-bold text-white ${mono ? 'font-mono-ctv tabular-nums' : 'font-display'}`}
            >
                {value}
            </span>
        </div>
    );
}

function TeamCrest({ label, color }: { label?: string; color: string }) {
    const short = (label ?? 'TEAM').slice(0, 3).toUpperCase();
    return (
        <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 36, height: 36, background: color, border: '1px solid rgba(255,255,255,0.1)' }}
        >
            <span
                className="font-display font-extrabold uppercase tracking-[0.04em] text-white"
                style={{ fontSize: 11 }}
            >
                {short}
            </span>
        </div>
    );
}

export function BetReviewStep({
    homeTeam,
    awayTeam,
    leagueLabel,
    marketBadge,
    marketLabel,
    selectionLabel,
    stakeLabel,
    stakeUsdcEquiv,
    slippageBps,
    netPayoutUsdc,
    feeBps,
    leaderboardFeeBps = 100,
}: BetReviewStepProps) {
    const totalFeePct = feeBps / 100;
    const lbPct = leaderboardFeeBps / 100;
    const treasuryPct = totalFeePct - lbPct;

    return (
        <div>
            <div
                className="font-display uppercase leading-[0.95] tracking-[-0.005em] text-white"
                style={{ fontSize: 18, fontWeight: 800 }}
            >
                Confirm your prediction
            </div>
            <div className="mt-2 text-[12px] font-light leading-[1.55] text-white/55">
                Review the terms. On submit you sign one transaction — approve + prediction are bundled when possible.
            </div>

            {/* Match strip */}
            <div className="mt-5 flex items-center gap-4 rounded-xl border border-[#1E1E1E] bg-[#111] p-4">
                <TeamCrest label={homeTeam} color="#E8001D" />
                <div className="flex-1 text-center">
                    <div
                        className="font-display text-white/85 uppercase"
                        style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.005em' }}
                    >
                        {homeTeam ?? 'Home'} <span className="text-white/35">vs</span> {awayTeam ?? 'Away'}
                    </div>
                    <div className="font-mono-ctv mt-1 text-[9px] uppercase tracking-[0.16em] text-white/45">
                        {leagueLabel}
                    </div>
                </div>
                <TeamCrest label={awayTeam} color="#A50044" />
            </div>

            <div className="mt-4 rounded-xl border border-[#1E1E1E] bg-[#0d0d0d] px-5 py-2">
                <Row label="Market" value={`${marketBadge} · ${marketLabel}`} />
                <Row label="Selection" value={selectionLabel} />
                <Row
                    label="Stake"
                    value={
                        stakeUsdcEquiv ? (
                            <>
                                {stakeLabel} <span className="text-white/55">(≈ {stakeUsdcEquiv})</span>
                            </>
                        ) : (
                            stakeLabel
                        )
                    }
                    mono
                />
                {slippageBps !== null && <Row label="Swap slippage" value={`${(slippageBps / 100).toFixed(2)}%`} mono />}
                <Row
                    label="Protocol fee"
                    value={`${totalFeePct.toFixed(1)}% (${treasuryPct.toFixed(1)}% treasury · ${lbPct.toFixed(1)}% leaderboard)`}
                    mono
                />
            </div>

            {netPayoutUsdc !== null && (
                <div
                    className="mt-4 flex items-center justify-between rounded-xl border p-5"
                    style={{ borderColor: 'rgba(45,212,164,0.4)', background: 'rgba(45,212,164,0.06)' }}
                >
                    <div>
                        <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-[#2dd4a4]">
                            If your pick wins
                        </div>
                        <div className="font-mono-ctv mt-1 text-[10px] uppercase tracking-[0.16em] text-white/45">
                            Estimated payout · final amount depends on the closing pool
                        </div>
                    </div>
                    <div
                        className="font-display tabular-nums text-[#2dd4a4]"
                        style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em' }}
                    >
                        {fmtUsd(netPayoutUsdc)}
                    </div>
                </div>
            )}

            <div className="font-mono-ctv mt-3 text-[10px] uppercase tracking-[0.16em] text-white/35">
                Pari-mutuel · Chiliz Spicy · gas paid in CHZ
            </div>
        </div>
    );
}
