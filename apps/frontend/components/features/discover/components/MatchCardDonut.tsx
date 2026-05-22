"use client";

import { useMemo } from "react";
import {
    fmtUsdcCompact,
    fmtViewers,
    getCountdown,
    getMinute,
    isLive,
    shortName,
    type FlatMatch,
} from "../domain";
import { useMatchPoolDistribution } from "../hooks";
import { Donut, donutColor } from "./Donut";
import { TeamLogo } from "./TeamLogo";

const ACCENT = "#E8001D";

/**
 * Donut match card — radial 1X2 distribution + per-row legend + footer
 * CTA. Branches over the shape returned by `useMatchPoolDistribution`:
 *   - `source: 'pool'`    → live shares, `Pool · $X` caption
 *   - `source: 'oddsRef'` → devigorized sharp-book reference, italic caption
 *   - `source: 'empty'`   → dashed donut + "Be first to stake" CTA
 */
export function MatchCardDonut({
    match,
    now,
    onPredict,
    onWatch,
}: {
    match: FlatMatch;
    /** `null` until the client clock has been initialised post-hydration. */
    now: Date | null;
    onPredict?: (match: FlatMatch) => void;
    onWatch?: (match: FlatMatch) => void;
}) {
    const live = isLive(match.status);
    const minute = live ? getMinute(match.status, match.kickoffAt, now) : null;
    const totalViewers = match.streamsPreview.reduce((s, sp) => s + sp.viewers, 0);

    const distribution = useMatchPoolDistribution({
        contractAddress: match.contractAddress,
        oddsRef: match.odds,
    });

    const homeShort = useMemo(() => shortName(match.homeTeam.name), [match.homeTeam.name]);
    const awayShort = useMemo(() => shortName(match.awayTeam.name), [match.awayTeam.name]);

    return (
        <article
            className="group relative flex w-full flex-col overflow-hidden rounded-xl border bg-[#111] transition-all duration-200 hover:border-[#2A2A2A]"
            style={{ borderColor: live ? "rgba(232,0,29,0.35)" : "#1E1E1E" }}
        >
            {live && (
                <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                        background: "linear-gradient(90deg, transparent, #E8001D, transparent)",
                    }}
                />
            )}

            <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
                <div className="font-mono-ctv flex min-w-0 items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
                    <span aria-hidden className="block h-0.5 w-3.5 shrink-0 bg-[#E8001D]" />
                    <span className="truncate">{match.leagueName}</span>
                    {totalViewers > 0 && (
                        <span className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-sm border border-[#1E1E1E] bg-[#0e0e0e] px-1.5 py-[2px] text-[9px] uppercase tracking-[0.16em] text-white/65">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="#E8001D" aria-hidden>
                                <polygon points="6 4 20 12 6 20 6 4" />
                            </svg>
                            {fmtViewers(totalViewers)}
                        </span>
                    )}
                </div>
                {live ? (
                    <span className="font-mono-ctv inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
                        <span
                            className="ctv-pulse-dot inline-block h-[6px] w-[6px] rounded-full bg-[#E8001D]"
                            style={{ boxShadow: "0 0 8px #E8001D" }}
                        />
                        Live{minute !== null ? ` · ${minute}'` : ""}
                    </span>
                ) : (
                    <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
                        {match.status === "NS" ? getCountdown(match.kickoffAt, now) : match.status}
                    </span>
                )}
            </div>

            <div
                className="grid items-center gap-3 px-5 py-4"
                style={{ gridTemplateColumns: "1fr auto 1fr" }}
            >
                <div className="flex min-w-0 flex-col items-start gap-2.5">
                    <TeamLogo name={match.homeTeam.name} logo={match.homeTeam.logoUrl} size={42} />
                    <span className="font-display w-full truncate text-[16px] font-bold uppercase leading-none tracking-[-0.005em] text-white">
                        {match.homeTeam.name}
                    </span>
                </div>

                <div className="flex flex-col items-center gap-1 px-1">
                    {live && match.score ? (
                        <div
                            className="font-display flex items-baseline gap-2 text-[42px] font-extrabold leading-none tracking-[-0.02em]"
                            style={{ color: ACCENT }}
                        >
                            <span>{match.score.home}</span>
                            <span className="text-[20px] text-white/30">·</span>
                            <span>{match.score.away}</span>
                        </div>
                    ) : match.score ? (
                        <div className="font-display text-[42px] font-extrabold leading-none tracking-[-0.02em] text-white/85">
                            {match.score.home}–{match.score.away}
                        </div>
                    ) : (
                        <>
                            <span className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/45">
                                vs
                            </span>
                            <span className="font-display text-[22px] font-extrabold leading-none tracking-[-0.02em] text-white">
                                {new Date(match.kickoffAt).toLocaleTimeString("en-GB", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </>
                    )}
                </div>

                <div className="flex min-w-0 flex-col items-end gap-2.5">
                    <TeamLogo name={match.awayTeam.name} logo={match.awayTeam.logoUrl} size={42} />
                    <span className="font-display w-full truncate text-right text-[16px] font-bold uppercase leading-none tracking-[-0.005em] text-white">
                        {match.awayTeam.name}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 px-5 pb-4">
                <div
                    className="relative flex shrink-0 items-center justify-center"
                    style={{ width: 96, height: 96 }}
                >
                    {distribution.source === "empty" ? (
                        <div className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-[#2A2A2A] p-2 text-center font-mono-ctv text-[9px] uppercase tracking-[0.16em] text-white/35">
                            No reference yet
                        </div>
                    ) : (
                        distribution.shares && distribution.favIdx !== null && (
                            <>
                                <Donut shares={distribution.shares} favIdx={distribution.favIdx} />
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <span
                                        className="font-display text-[22px] font-extrabold leading-none tracking-[-0.02em]"
                                        style={{ color: donutColor(distribution.favIdx, distribution.shares.length) }}
                                    >
                                        {Math.round(distribution.shares[distribution.favIdx] * 100)}%
                                    </span>
                                    <span className="font-mono-ctv mt-1 text-[8px] uppercase tracking-[0.18em] text-white/55">
                                        {distribution.outcomeLabels[distribution.favIdx] ?? "—"}
                                    </span>
                                </div>
                            </>
                        )
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    {/* Market badge — clarifies which market the donut is showing
                        when the WINNER pool is empty and we fall back to e.g.
                        GOALS_TOTAL. Italic when we're rendering the cosmetic
                        sharp-book reference instead of live shares. */}
                    <div className="font-mono-ctv flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-white/45">
                        <span
                            aria-hidden
                            className="block h-px w-2.5"
                            style={{ background: ACCENT }}
                        />
                        <span className={distribution.source === "oddsRef" ? "italic" : undefined}>
                            {distribution.marketLabel}
                        </span>
                    </div>
                    {(distribution.outcomeLabels.length > 0
                        ? distribution.outcomeLabels
                        : ["Home", "Draw", "Away"]
                    ).map((rawLabel, i, arr) => {
                        const isFav = distribution.favIdx === i;
                        const pct = distribution.shares
                            ? Math.round((distribution.shares[i] ?? 0) * 100)
                            : null;
                        const label =
                            distribution.marketKey === "winner" || distribution.marketKey === "halftime"
                                ? i === 0
                                    ? `${homeShort} win`
                                    : i === arr.length - 1
                                        ? `${awayShort} win`
                                        : rawLabel
                                : rawLabel;
                        return (
                            <div key={`${distribution.marketKey}-${i}`} className="flex items-center gap-2">
                                <span
                                    aria-hidden
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 2,
                                        background: donutColor(i, arr.length),
                                        opacity: isFav ? 1 : 0.45,
                                    }}
                                />
                                <span className="font-mono-ctv flex-1 truncate text-[10px] uppercase tracking-[0.14em] text-white/55">
                                    {label}
                                </span>
                                <span
                                    className="font-display text-[13px] font-bold tracking-[-0.005em]"
                                    style={{ color: isFav ? "#fff" : "rgba(255,255,255,0.65)" }}
                                >
                                    {pct === null ? "—" : `${pct}%`}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto flex items-center gap-2 border-t border-[#1E1E1E] bg-[#0d0d0d] px-5 py-3">
                <button
                    type="button"
                    onClick={() => onPredict?.(match)}
                    className="font-mono-ctv flex flex-1 items-center justify-center gap-2 rounded-md bg-[#E8001D] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d]"
                    style={{ boxShadow: "0 6px 20px rgba(232,0,29,0.25)" }}
                >
                    {distribution.source === "pool" ? "Stake" : "Be first to stake"}
                    <span aria-hidden>→</span>
                </button>
                <div className="font-mono-ctv flex items-center gap-2 px-2 text-[10px] uppercase tracking-[0.14em] text-white/55">
                    {distribution.source === "pool" ? (
                        <>
                            <span className="text-white/45">Pool</span>
                            <span className="font-bold text-white">{fmtUsdcCompact(distribution.totalPool)}</span>
                        </>
                    ) : distribution.source === "oddsRef" ? (
                        <>
                            <span className="text-white/45">Ref</span>
                            <span className="font-bold italic text-white/70">Sharp books</span>
                        </>
                    ) : (
                        <>
                            <span className="text-white/45">Pool</span>
                            <span className="font-bold text-white">—</span>
                        </>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => onWatch?.(match)}
                    aria-label={`Watch ${match.homeTeam.name} vs ${match.awayTeam.name}`}
                    className="flex h-9 w-10 items-center justify-center rounded-md border border-[#2A2A2A] bg-transparent text-white/65 transition-colors hover:border-[#E8001D] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                >
                    <span
                        aria-hidden
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: "8px solid currentColor",
                            borderTop: "5px solid transparent",
                            borderBottom: "5px solid transparent",
                        }}
                    />
                </button>
            </div>
        </article>
    );
}
