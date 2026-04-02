"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLiveMatches, useUpcomingMatches } from "@/hooks/api";
import { Match } from "@/types/api.types";
import { Zap, Clock, Loader2 } from "lucide-react";
import { formatCountdown } from "@/lib/utils/formatting/date";
import { clamp } from "@/lib/utils/formatting/number";
import {
  getMatchStatus,
  getStatusConfig,
  getCardStyle,
} from "@/components/features/streaming/utils";

const DISPLAY_COUNT = 3;

function pickRandom<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return [...arr];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function getMatchTime(match: Match, now: Date): string {
  const matchDate = new Date(match.startTime);
  if (match.status === "FT" || match.status === "Match Finished") return "FT";
  if (match.status === "1H") {
    const elapsed = Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60));
    return `${clamp(elapsed, 0, 45)}'`;
  }
  if (match.status === "2H") {
    const elapsed = Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60));
    return `${clamp(elapsed, 46, 90)}'`;
  }
  if (match.status === "HT") return "HT";
  return formatCountdown(matchDate);
}

function TeamBadge({ name, logoUrl, side }: { name: string; logoUrl?: string; side: "home" | "away" }) {
  const [imgError, setImgError] = useState(false);
  const fallbackGradient = side === "home"
    ? "from-blue-600 to-blue-800"
    : "from-red-600 to-red-800";

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      {logoUrl && !imgError ? (
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700 shrink-0">
          <Image
            src={logoUrl}
            alt={name}
            fill
            className="object-contain p-0.5"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className={`w-10 h-10 rounded-full bg-linear-to-br ${fallbackGradient} flex items-center justify-center text-white font-bold text-sm shrink-0 border border-gray-600`}>
          {name.charAt(0)}
        </div>
      )}
      <p className="text-white font-semibold text-xs truncate w-full text-center">{name}</p>
    </div>
  );
}

export function HeroMatchList() {
  const router = useRouter();
  const { data: liveMatches = [], isLoading: liveLoading } = useLiveMatches();
  const { data: upcomingMatches = [], isLoading: upcomingLoading } = useUpcomingMatches();
  const [now, setNow] = useState(() => new Date());

  const { displayMatches, isLiveMode } = useMemo(() => {
    if (liveMatches.length > 0) {
      return { displayMatches: pickRandom(liveMatches, DISPLAY_COUNT), isLiveMode: true };
    }
    if (upcomingMatches.length > 0) {
      return { displayMatches: pickRandom(upcomingMatches, DISPLAY_COUNT), isLiveMode: false };
    }
    return { displayMatches: [], isLiveMode: false };
  }, [liveMatches, upcomingMatches]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  if (liveLoading || upcomingLoading) {
    return (
      <div
        className="w-full max-w-6xl mx-auto rounded-2xl border border-white/10 py-8 flex items-center justify-center"
        style={{ fontFamily: "Lexend, sans-serif" }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (displayMatches.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-1" style={{ fontFamily: "Lexend, sans-serif" }}>
      <div className="flex items-center gap-2 text-white font-semibold text-sm mb-4 justify-center">
        {isLiveMode ? (
          <>
            <Zap className="w-4 h-4 text-red-400 animate-pulse" />
            Live now
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 text-primary" />
            Upcoming
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {displayMatches.map((match) => {
          const displayStatus = getMatchStatus(match);
          const cfg = getStatusConfig(displayStatus);
          const StatusIcon = cfg.icon;
          const score =
            match.homeScore != null && match.awayScore != null
              ? `${match.homeScore} - ${match.awayScore}`
              : null;

          return (
            <button
              key={match.id}
              type="button"
              onClick={() => router.push(`/live/${match.id}`)}
              className={`${getCardStyle(displayStatus)} border rounded-2xl p-4 text-left hover:scale-[1.02] hover:shadow-2xl active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black`}
            >
              {/* Header: league + status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                {match.league && (
                  <p className="text-gray-400 text-xs truncate">{match.league}</p>
                )}
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold shrink-0 ${cfg.textColor} ${cfg.bgColor} ${cfg.borderColor} ${cfg.animate}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  <span>{getMatchTime(match, now)}</span>
                </div>
              </div>

              {/* Teams + score row */}
              <div className="flex items-center justify-between gap-2">
                <TeamBadge name={match.homeTeam} logoUrl={match.homeTeamLogo} side="home" />

                <div className="flex flex-col items-center shrink-0 px-1">
                  {score ? (
                    <span className="text-white font-bold text-xl tabular-nums">{score}</span>
                  ) : (
                    <span className="text-gray-500 text-sm font-medium">vs</span>
                  )}
                </div>

                <TeamBadge name={match.awayTeam} logoUrl={match.awayTeamLogo} side="away" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
