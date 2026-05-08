"use client";

import { useMemo } from "react";
import {
  getCountdown,
  getMinute,
  isLive,
  fmtViewers,
  type FlatMatch,
} from "../domain";
import { OddsPill } from "./OddsPill";
import { TeamLogo } from "./TeamLogo";

type OddsKey = "home" | "draw" | "away";

export function MatchCard({
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

  // Identify the favourite (lowest odds) for the accent pill — in betting,
  // shorter odds = higher implied probability, so the lowest non-null wins.
  const favKey = useMemo<OddsKey | null>(() => {
    if (!match.odds) return null;
    const entries: [OddsKey, number][] = (
      [
        ["home", match.odds.home],
        ["draw", match.odds.draw],
        ["away", match.odds.away],
      ] as const
    ).filter((e): e is [OddsKey, number] => typeof e[1] === "number");
    if (entries.length === 0) return null;
    return entries.sort((a, b) => a[1] - b[1])[0][0];
  }, [match.odds]);

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111] transition-all duration-200 hover:-translate-y-px hover:border-[#2A2A2A]"
      style={{
        boxShadow: live ? "0 0 0 1px rgba(232,0,29,0.05) inset" : "none",
      }}
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

      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
        <div className="font-mono-ctv flex min-w-0 items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
          <span aria-hidden className="block h-0.5 w-3.5 flex-shrink-0 bg-[#E8001D]" />
          <span className="truncate">{match.leagueName}</span>
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
            {match.status === "NS"
              ? getCountdown(match.kickoffAt, now)
              : match.status}
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
              style={{ color: "#E8001D" }}
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

      {match.odds && (
        <div className="grid grid-cols-3 gap-2 px-5 pb-4">
          {(["home", "draw", "away"] as const).map((k) => {
            const v = match.odds?.[k];
            if (typeof v !== "number") return <span key={k} />;
            const label = k === "home" ? "1" : k === "draw" ? "X" : "2";
            return <OddsPill key={k} label={label} value={v} accent={favKey === k} />;
          })}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-[#1E1E1E] bg-[#0d0d0d] px-5 py-3">
        <button
          type="button"
          onClick={() => onPredict?.(match)}
          className="font-mono-ctv flex flex-1 items-center justify-center gap-2 rounded-md bg-[#E8001D] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d]"
          style={{ boxShadow: "0 6px 20px rgba(232,0,29,0.25)" }}
        >
          Predict
          <span aria-hidden>→</span>
        </button>
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
        <div className="font-mono-ctv ml-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.06em] text-white/45">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {totalViewers > 0 ? fmtViewers(totalViewers) : "—"}
        </div>
      </div>
    </article>
  );
}
