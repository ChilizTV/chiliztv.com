"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Clock, Eye } from "lucide-react";
import Image from "next/image";
import type { Match } from "@/types/api.types";
import { BrowseMatch } from "@/types/browse.types";
import { getFanToken } from "@/utils/FanTokens";
import {
  getMatchStatus,
  getStatusConfig,
  getCardStyle,
  formatScore,
  getMatchTime,
  MatchStatus,
} from "@/components/features/streaming/utils";
import { StreamPreviewRow } from "./StreamPreviewRow";

interface MatchCardProps {
  match: BrowseMatch;
  now: Date;
}

/** Minimal adapter so existing utils (which expect Match) work with BrowseMatch */
function toMatchLike(match: BrowseMatch): Pick<Match, "status" | "startTime"> {
  return { status: match.status, startTime: match.kickoffAt } as Pick<
    Match,
    "status" | "startTime"
  >;
}

export function MatchCard({ match, now }: MatchCardProps) {
  const router = useRouter();
  const [homeLogoError, setHomeLogoError] = useState(false);
  const [awayLogoError, setAwayLogoError] = useState(false);
  const matchLike = toMatchLike(match);
  const displayStatus = getMatchStatus(matchLike as Match);
  const cfg = getStatusConfig(displayStatus);
  const StatusIcon = cfg.icon;
  const time = getMatchTime(matchLike as Match, now);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/live/${match.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(`/live/${match.id}`);
      }}
      className={`${getCardStyle(displayStatus)} border rounded-2xl p-5 backdrop-blur-xl w-full cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl group relative overflow-hidden`}
    >
      {/* Shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12 translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
      </div>

      {/* Teams + Score row */}
      <div className="flex items-center justify-between gap-4">
        {/* Home team */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full border border-gray-700/50 flex items-center justify-center text-white font-bold text-sm shadow overflow-hidden">
              {match.homeTeam.logoUrl && !homeLogoError ? (
                <Image
                  src={match.homeTeam.logoUrl}
                  alt={match.homeTeam.name}
                  fill
                  className="object-contain rounded-full"
                  onError={() => setHomeLogoError(true)}
                />
              ) : (
                match.homeTeam.name.charAt(0)
              )}
            </div>
            {(() => {
              const token = getFanToken(match.homeTeam.name);
              if (!token) return null;
              return (
                <a
                  href={token.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute -bottom-1.5 -right-1.5 w-5 h-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={token.image}
                    alt={token.symbol}
                    width={20}
                    height={20}
                    className="rounded-full border border-gray-600 bg-black p-0.5"
                  />
                </a>
              );
            })()}
          </div>
          <span className="font-bold text-base text-white truncate group-hover:text-blue-100 transition-colors">
            {match.homeTeam.name}
          </span>
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center flex-shrink-0 min-w-[80px]">
          <span
            className={`text-2xl font-bold ${
              displayStatus === MatchStatus.PREDICTION_OPEN
                ? "text-gray-600"
                : "text-white"
            }`}
          >
            {formatScore(match.score?.home, match.score?.away)}
          </span>
          {displayStatus === MatchStatus.PREDICTION_OPEN && (
            <span className="text-xs text-gray-500 font-medium">vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
          <span className="font-bold text-base text-white truncate text-right group-hover:text-blue-100 transition-colors">
            {match.awayTeam.name}
          </span>
          <div className="relative flex-shrink-0">
            <div className="relative w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full border border-gray-700/50 flex items-center justify-center text-white font-bold text-sm shadow overflow-hidden">
              {match.awayTeam.logoUrl && !awayLogoError ? (
                <Image
                  src={match.awayTeam.logoUrl}
                  alt={match.awayTeam.name}
                  fill
                  className="object-contain rounded-full"
                  onError={() => setAwayLogoError(true)}
                />
              ) : (
                match.awayTeam.name.charAt(0)
              )}
            </div>
            {(() => {
              const token = getFanToken(match.awayTeam.name);
              if (!token) return null;
              return (
                <a
                  href={token.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute -bottom-1.5 -right-1.5 w-5 h-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={token.image}
                    alt={token.symbol}
                    width={20}
                    height={20}
                    className="rounded-full border border-gray-600 bg-black p-0.5"
                  />
                </a>
              );
            })()}
          </div>
        </div>

        {/* Time + Status */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-700 bg-black/40 text-xs font-semibold text-gray-300">
            <Clock className="w-3 h-3" />
            <span>{time}</span>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-semibold ${cfg.textColor} ${cfg.bgColor} ${cfg.borderColor} ${cfg.animate}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span className="hidden sm:inline">{cfg.text}</span>
          </div>
          {displayStatus === MatchStatus.LIVE && match.streamsPreview.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400">
              <Eye className="w-3 h-3" />
              <span>{match.streamsPreview.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Odds row */}
      {match.odds && (match.odds.home !== null || match.odds.draw !== null || match.odds.away !== null) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          <span className="text-xs text-zinc-500">Odds</span>
          {match.odds.home !== null && (
            <span className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 text-xs rounded-md">
              H {match.odds.home.toFixed(2)}
            </span>
          )}
          {match.odds.draw !== null && (
            <span className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 text-xs rounded-md">
              D {match.odds.draw.toFixed(2)}
            </span>
          )}
          {match.odds.away !== null && (
            <span className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 text-xs rounded-md">
              A {match.odds.away.toFixed(2)}
            </span>
          )}
        </div>
      )}

      {/* Stream preview row */}
      <StreamPreviewRow streams={match.streamsPreview} matchId={match.id} />
    </article>
  );
}
