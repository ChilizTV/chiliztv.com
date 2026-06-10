"use client";

import { useMemo } from "react";
import {
    fmtUsdcCompact,
    fmtViewers,
    getCountdown,
    getMinute,
    isLive,
    type FlatMatch,
} from "../domain";
import { fmtMatchScore } from "@chiliztv/domain/matches/format/matchScore";
import { useMatchPoolDistribution } from "../hooks";
import { TeamFormBadge } from "@/components/shared/TeamFormBadge";
import { TeamLogo } from "./TeamLogo";
import { PendingPanel } from "./PendingPanel";
import { BeFirstBar } from "./BeFirstBar";
import { DistributionBar } from "./DistributionBar";
import { StakeZone } from "./StakeZone";

/**
 * Match card — "Magnetic stake" layout from the claude.ai/design handoff
 * (Match Card - Balanced.html). The card has three mutually-exclusive
 * lower-block states, decided in this order:
 *
 *   1. `pending`  — `contractAddress == null`. Worker is still deploying
 *                   the proxy on-chain. Shows the shimmer "Markets opening
 *                   soon" panel. No CTA.
 *   2. `befirst`  — contract deployed but every market pool is empty
 *                   (`distribution.source === 'empty'`). Magnetic red
 *                   stake zone with "Be first / Your stake sets the
 *                   price" framing — explains the pari-mutuel mechanic
 *                   without words.
 *   3. `live`     — at least one market has volume. Distribution bar +
 *                   magnetic red stake zone surfacing the growing pool $.
 *
 * The stake zone is full-bleed against the card bottom (`-mx-5 -mb-4`)
 * so it reads as the card's base, not a footer button. The pari-mutuel
 * selling point — a real, growing pool — lives ON the red surface, so
 * value and action are a single object.
 *
 * Sub-blocks live in dedicated files: {@link PendingPanel}, {@link BeFirstBar},
 * {@link DistributionBar}, {@link StakeZone}. This orchestrator stays thin.
 */
export function MatchCardDonut({
    match,
    now,
    onPredict,
}: {
    match: FlatMatch;
    /** `null` until the client clock has been initialised post-hydration. */
    now: Date | null;
    onPredict?: (match: FlatMatch) => void;
}) {
    const live = isLive(match.status);
    const minute = live ? getMinute(match.status, match.kickoffAt, now, match.elapsed) : null;
    const totalViewers = match.streamsPreview.reduce((s, sp) => s + sp.viewers, 0);

    const distribution = useMatchPoolDistribution({
        contractAddress: match.contractAddress,
    });

    const pending = match.contractAddress == null;
    const isBeFirst = !pending && distribution.source === "empty";
    const isStakeable = !pending && distribution.source === "pool";

    const fmt = useMemo(
        () =>
            fmtMatchScore({
                status: match.status,
                score: match.score,
                scoreBreakdown: match.scoreBreakdown,
            }),
        [match.status, match.score, match.scoreBreakdown],
    );

    return (
        <article
            className={[
                // base — flex column card, brand surface
                "group relative flex w-full flex-col rounded-xl border bg-[#111] px-5 pb-4 pt-4",
                // hover lifts the card and lays a soft shadow under it. Slower
                // than the stake-zone (300ms vs 220ms) so the zone reads as
                // the focal magnet and the card body as supporting motion.
                // `motion-safe:` skips the transform/shadow for users with
                // `prefers-reduced-motion: reduce`; the border-color cue stays.
                "transition-all duration-300 ease-out",
                "motion-safe:hover:-translate-y-0.5",
                // border + hover shadow — red-tinted for live cards, neutral
                // dark for the rest. Border color is in the className (not
                // inline) so the `hover:` modifier can actually override it.
                live
                    ? "border-[#E8001D]/35 motion-safe:hover:shadow-[0_14px_36px_-14px_rgba(232,0,29,0.35)]"
                    : "border-[#1E1E1E] hover:border-[#2A2A2A] motion-safe:hover:shadow-[0_14px_36px_-14px_rgba(0,0,0,0.55)]",
            ].join(" ")}
        >
            {live && (
                <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent, #E8001D, transparent)",
                    }}
                />
            )}

            {/* Header — league + status chip */}
            <div className="flex items-center justify-between gap-3 pb-4">
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

            {/* Teams + score / kickoff */}
            <div
                className="grid items-start gap-3 pb-4"
                style={{ gridTemplateColumns: "1fr auto 1fr" }}
            >
                <div className="flex min-w-0 flex-col items-start gap-2.5">
                    <TeamLogo name={match.homeTeam.name} logo={match.homeTeam.logoUrl} size={42} />
                    <span className="font-display w-full truncate text-[16px] font-bold uppercase leading-none tracking-[-0.005em] text-white">
                        {match.homeTeam.name}
                    </span>
                    <TeamFormBadge form={match.homeForm} size="sm" />
                </div>

                <div className="flex flex-col items-center gap-1 px-1 pt-1">
                    {fmt.variant !== "none" ? (
                        <>
                            <div className="font-display whitespace-nowrap text-[40px] font-extrabold leading-none tracking-[-0.02em] text-white/90">
                                {fmt.primary}
                            </div>
                            {fmt.suffix && (
                                <span className="font-mono-ctv text-[9px] uppercase tracking-[0.16em] text-white/45">
                                    {fmt.suffix}
                                </span>
                            )}
                        </>
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

                <div className="flex min-w-0 flex-col items-end gap-2.5 text-right">
                    <TeamLogo name={match.awayTeam.name} logo={match.awayTeam.logoUrl} size={42} />
                    <span className="font-display w-full truncate text-[16px] font-bold uppercase leading-none tracking-[-0.005em] text-white">
                        {match.awayTeam.name}
                    </span>
                    <TeamFormBadge form={match.awayForm} size="sm" />
                </div>
            </div>

            {/* Lower block — branches by state */}
            {pending ? (
                <PendingPanel />
            ) : isBeFirst ? (
                <>
                    <BeFirstBar marketLabel={distribution.marketLabel} />
                    <StakeZone variant="befirst" onClick={() => onPredict?.(match)} />
                </>
            ) : isStakeable ? (
                <>
                    <DistributionBar
                        shares={distribution.shares ?? []}
                        labels={distribution.outcomeLabels}
                        favIdx={distribution.favIdx}
                    />
                    <StakeZone
                        variant="live"
                        pool={fmtUsdcCompact(distribution.totalPool)}
                        marketLabel={distribution.marketLabel}
                        onClick={() => onPredict?.(match)}
                    />
                </>
            ) : null}
        </article>
    );
}
