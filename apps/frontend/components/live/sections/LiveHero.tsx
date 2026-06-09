"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { fmtMatchScore } from "@chiliztv/domain/matches/format/matchScore";
import { TeamFormBadge } from "@/components/shared/TeamFormBadge";
import { StaleDataBadge } from "@/components/shared/StaleDataBadge";
import { Eyebrow, Pill, PulseDot } from "../primitives";

const LIVE_STATUSES = new Set(["1H", "2H", "ET", "BT", "P", "HT", "LIVE"]);
const ENDED_STATUSES = new Set(["FT", "AET", "PEN", "Match Finished"]);

interface LiveHeroProps {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  /**
   * Optional AET/PEN breakdown. When present, the helper renders
   * "3 — 2 a.e.t." or "5 — 4 pen (1 — 1)" under the primary score.
   */
  scoreBreakdown?: {
    ninety: { home: number; away: number };
    aet?: { home: number; away: number };
    pen?: { home: number; away: number };
  } | null;
  homeLogo?: string;
  awayLogo?: string;
  homeForm?: string | null;
  awayForm?: string | null;
  status?: string;
  /** Live elapsed minute, when surfaced by the data source. */
  elapsed?: number;
  /** ISO kickoff time — rendered for upcoming matches. */
  kickoffAt?: string;
  league?: string;
  onChainMatch?: boolean;
  /** Backend signal that API-Football is in degraded mode — score may be stale. */
  dataStale?: boolean;
  onBack?: () => void;
}

function formatKickoff(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortName(name: string): string {
  return (name || "")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase();
}

function TeamCrest({ name, logo, size = 56 }: { name: string; logo?: string; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-md"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1E1E1E 0%, #0A0A0A 130%)",
        border: "1px solid #2A2A2A",
      }}
    >
      {logo && !err ? (
        <Image
          src={logo}
          alt={name}
          width={Math.round(size * 0.85)}
          height={Math.round(size * 0.85)}
          className="object-contain"
          onError={() => setErr(true)}
        />
      ) : (
        <span className="font-display text-[18px] font-extrabold uppercase tracking-tight text-white">
          {shortName(name)}
        </span>
      )}
    </div>
  );
}

function TeamSide({
  name,
  logo,
  side,
  form,
}: {
  name: string;
  logo?: string;
  side: "home" | "away";
  form?: string | null;
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        side === "away" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <TeamCrest name={name} logo={logo} />
      <div className="flex min-w-0 flex-col">
        <span className="font-display max-w-[12ch] truncate text-[18px] font-extrabold uppercase tracking-tight text-white sm:max-w-[18ch] sm:text-[22px]">
          {name}
        </span>
        <div className={`mt-1 flex items-center gap-2 ${side === "away" ? "flex-row-reverse" : ""}`}>
          <span className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/35">
            {shortName(name)}
          </span>
          <TeamFormBadge form={form} size="md" />
        </div>
      </div>
    </div>
  );
}

export function LiveHero({
  homeTeam,
  awayTeam,
  homeScore = 0,
  awayScore = 0,
  scoreBreakdown,
  homeLogo,
  awayLogo,
  homeForm,
  awayForm,
  status,
  elapsed,
  kickoffAt,
  league,
  onChainMatch = false,
  dataStale = false,
  onBack,
}: LiveHeroProps) {
  const isLive = !!status && LIVE_STATUSES.has(status);
  const isFT = !!status && ENDED_STATUSES.has(status);
  const isUpcoming = !isLive && !isFT;
  // Formatted score — picks AET / PEN / FT branch from the helper. `primary`
  // ("3 — 2") goes into the giant typographic block; `suffix` ("a.e.t." or
  // "pen (1 — 1)") renders as the caption underneath, replacing "Full time"
  // when the match went to extra time.
  const scoreFmt = fmtMatchScore({
    status: status ?? '',
    score: !isUpcoming ? { home: homeScore, away: awayScore } : null,
    scoreBreakdown,
  });

  return (
    <section className="border-b border-[#1E1E1E] bg-[#0A0A0A]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-7 sm:px-10 sm:py-9 lg:flex-row lg:items-center lg:justify-between">
        {/* Left — meta + score */}
        <div className="min-w-0">
          <Eyebrow>
            {league || "Match"}
            <span className="text-white/30">·</span>
            {isLive && (
              <span className="inline-flex items-center gap-1.5">
                <PulseDot color="#E8001D" size={5} /> Live
              </span>
            )}
            {isLive && elapsed != null && elapsed > 0 && (
              <>
                <span className="text-white/30">·</span>
                <span className="text-white">{elapsed}&apos;</span>
              </>
            )}
            {isFT && <span className="text-white/55">Full time</span>}
            {isUpcoming && <span className="text-white/55">{formatKickoff(kickoffAt)}</span>}
            {dataStale && (
              <>
                <span className="text-white/30">·</span>
                <StaleDataBadge stale />
              </>
            )}
          </Eyebrow>

          <div className="mt-4 flex items-center gap-5 sm:gap-7">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to discover"
                className="font-mono-ctv hidden items-center gap-2 rounded-md border border-[#1E1E1E] bg-[#111] px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition-colors hover:border-[#3A3A3A] hover:text-white sm:inline-flex"
              >
                <ArrowLeft size={14} />
                Discover
              </button>
            )}

            <TeamSide name={homeTeam} logo={homeLogo} side="home" form={homeForm} />

            <div className="flex flex-col items-center gap-1">
              {isUpcoming ? (
                <div
                  className="font-display flex items-baseline gap-3 leading-[0.85] tracking-[-0.02em] text-white/55"
                  style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800 }}
                >
                  vs
                </div>
              ) : (
                <div
                  className="font-display flex items-baseline gap-3 leading-[0.85] tracking-[-0.02em] text-white"
                  style={{ fontSize: "clamp(48px, 7vw, 88px)", fontWeight: 800 }}
                >
                  {/* Render the formatted primary directly so the em-dash uses the same neutral colour. */}
                  <span>{scoreFmt.primary}</span>
                </div>
              )}
              <span className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/35">
                {isLive
                  ? elapsed != null && elapsed > 0
                    ? `Min ${elapsed}`
                    : "Live"
                  : isFT
                    ? scoreFmt.suffix ?? "Full time"
                    : "Upcoming"}
              </span>
            </div>

            <TeamSide name={awayTeam} logo={awayLogo} side="away" form={awayForm} />
          </div>
        </div>

        {/* Right — pills */}
        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
          {isLive && (
            <Pill color="#fff" border="#1E1E1E" bg="#111">
              <PulseDot color="#E8001D" size={5} /> Live now
            </Pill>
          )}
          {onChainMatch && (
            <Pill
              color="#F5C518"
              border="rgba(245,197,24,0.4)"
              bg="rgba(245,197,24,0.06)"
            >
              On-chain match
            </Pill>
          )}
        </div>
      </div>
    </section>
  );
}
