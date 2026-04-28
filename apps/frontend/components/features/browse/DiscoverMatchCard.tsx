"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import type { BrowseMatchDto } from "@chiliztv/shared/dto/matches/BrowseMatchesDto";
import { clamp } from "@/lib/utils/formatting/number";

interface DiscoverMatchCardProps {
  match: BrowseMatchDto;
  leagueName: string;
  now: Date;
}

const LIVE_STATUSES = new Set(["1H", "2H", "ET", "BT", "P", "LIVE"]);

function getMinute(status: string, kickoffAt: string, now: Date): number {
  const elapsed = Math.floor((now.getTime() - new Date(kickoffAt).getTime()) / 60_000);
  if (status === "1H") return clamp(elapsed, 0, 45);
  if (status === "2H") return clamp(elapsed, 46, 90);
  return elapsed;
}

function getCountdown(kickoffAt: string, now: Date): string {
  const diff = Math.floor((new Date(kickoffAt).getTime() - now.getTime()) / 60_000);
  if (diff <= 0) return "Now";
  if (diff < 60) return `in ${diff}m`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
}

function formatKickoff(kickoffAt: string): string {
  return new Date(kickoffAt).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TeamLogo({ name, logo }: { name: string; logo: string | null }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
      style={{ background: "#252525", border: "1px solid #2A2A2A" }}
    >
      {logo && !err ? (
        <Image
          src={logo}
          alt={name}
          width={36}
          height={36}
          className="object-contain"
          onError={() => setErr(true)}
        />
      ) : (
        <span
          className="text-[12px] font-bold uppercase"
          style={{ color: "#888", fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {name.slice(0, 3)}
        </span>
      )}
    </div>
  );
}

export function DiscoverMatchCard({ match, leagueName, now }: DiscoverMatchCardProps) {
  const router = useRouter();
  const isLive = LIVE_STATUSES.has(match.status);
  const minute = isLive ? getMinute(match.status, match.kickoffAt, now) : null;
  const totalViewers = match.streamsPreview.reduce((s, sp) => s + sp.viewers, 0);

  return (
    <article
      className="rounded-lg overflow-hidden cursor-pointer transition-all duration-150"
      style={{ background: "#141414", border: "1px solid #2A2A2A" }}
      onClick={() => router.push(`/live/${match.id}`)}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "#3A3A3A";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "#2A2A2A";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "#1E1E1E", borderBottom: "1px solid #2A2A2A" }}
      >
        <span
          className="text-[11px] font-semibold tracking-[0.08em] uppercase truncate"
          style={{ color: "#888", fontFamily: "'Barlow', sans-serif" }}
        >
          {leagueName}
        </span>

        {isLive ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#00C853",
                animation: "pulse 1.4s infinite",
                display: "inline-block",
              }}
            />
            <span
              className="text-[11px] font-bold tracking-[0.08em]"
              style={{ color: "#00C853" }}
            >
              LIVE
            </span>
          </div>
        ) : (
          <span className="text-[11px] flex-shrink-0" style={{ color: "#555" }}>
            {match.status === "NS"
              ? getCountdown(match.kickoffAt, now)
              : formatKickoff(match.kickoffAt)}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between px-4 py-5 gap-2">
        {/* Home */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamLogo name={match.homeTeam.name} logo={match.homeTeam.logoUrl} />
          <span
            className="text-[13px] font-bold uppercase text-center truncate w-full"
            style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {match.homeTeam.name}
          </span>
        </div>

        {/* Score / separator */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 px-2">
          {isLive && match.score !== null ? (
            <>
              <span
                className="font-mono font-bold leading-none"
                style={{
                  fontSize: "24px",
                  color: "#fff",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {match.score.home} — {match.score.away}
              </span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: "#E8001D" }}
              >
                {minute}&apos;
              </span>
            </>
          ) : (
            <span
              className="text-[15px] font-semibold"
              style={{ color: "#555" }}
            >
              vs
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamLogo name={match.awayTeam.name} logo={match.awayTeam.logoUrl} />
          <span
            className="text-[13px] font-bold uppercase text-center truncate w-full"
            style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Odds row */}
      {match.odds && (match.odds.home !== null || match.odds.draw !== null || match.odds.away !== null) && (
        <div
          className="flex items-center gap-2 px-4 pb-3"
        >
          <span className="text-[10px] tracking-[0.08em] uppercase" style={{ color: "#555" }}>
            Odds
          </span>
          {match.odds.home !== null && (
            <span
              className="px-2 py-0.5 rounded text-[11px] font-mono"
              style={{ background: "#1E1E1E", color: "#888", border: "1px solid #2A2A2A" }}
            >
              H {match.odds.home.toFixed(2)}
            </span>
          )}
          {match.odds.draw !== null && (
            <span
              className="px-2 py-0.5 rounded text-[11px] font-mono"
              style={{ background: "#1E1E1E", color: "#888", border: "1px solid #2A2A2A" }}
            >
              D {match.odds.draw.toFixed(2)}
            </span>
          )}
          {match.odds.away !== null && (
            <span
              className="px-2 py-0.5 rounded text-[11px] font-mono"
              style={{ background: "#1E1E1E", color: "#888", border: "1px solid #2A2A2A" }}
            >
              A {match.odds.away.toFixed(2)}
            </span>
          )}
        </div>
      )}

      {/* Footer: CTA + viewers */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderTop: "1px solid #2A2A2A" }}
      >
        <button
          className="flex-1 py-2 rounded text-[12px] font-bold tracking-[0.06em] uppercase transition-colors duration-150"
          style={{ background: "#E8001D", color: "#fff" }}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/live/${match.id}`);
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#B0001A")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#E8001D")}
        >
          Predict
        </button>

        <button
          className="px-3 py-2 rounded text-[12px] transition-colors duration-150"
          style={{ background: "transparent", border: "1px solid #2A2A2A", color: "#888" }}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/live/${match.id}`);
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "#3A3A3A")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "#2A2A2A")}
        >
          ▶
        </button>

        {totalViewers > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Eye size={11} style={{ color: "#555" }} />
            <span className="text-[11px]" style={{ color: "#555" }}>
              {totalViewers >= 1000
                ? `${(totalViewers / 1000).toFixed(1)}K`
                : totalViewers}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
