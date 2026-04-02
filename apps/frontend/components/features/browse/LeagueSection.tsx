"use client";

import Image from "next/image";
import type { BrowseLeagueDto } from "@chiliztv/shared/dto/matches/BrowseMatchesDto";
import { MatchCard } from "./MatchCard";

interface LeagueSectionProps {
  league: BrowseLeagueDto;
  now: Date;
  /** Set to false for flat time-sorted views (league.id === 0) */
  showHeader?: boolean;
}

export function LeagueSection({ league, now, showHeader = true }: LeagueSectionProps) {
  return (
    <section className="w-full">
      {/* League header */}
      {showHeader && (
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="flex-shrink-0 w-7 h-7">
            {league.league.logoUrl ? (
              <Image
                src={league.league.logoUrl}
                alt={league.league.name}
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                {league.league.name.charAt(0)}
              </div>
            )}
          </div>

          <h2 className="text-sm font-bold text-white truncate">{league.league.name}</h2>

          {league.league.country && (
            <span className="text-xs text-gray-500 hidden sm:inline">{league.league.country}</span>
          )}

          <div className="flex-1 h-px bg-gradient-to-r from-gray-700/60 to-transparent mx-2" />

          <span className="flex-shrink-0 text-xs font-semibold text-gray-400 bg-gray-800/60 border border-gray-700/50 rounded-full px-2 py-0.5">
            {league.matches.length} match{league.matches.length > 1 ? "es" : ""}
          </span>
        </div>
      )}

      {/* Match cards — pre-sorted by applySort upstream */}
      <div className="flex flex-col gap-3 pl-1">
        {league.matches.map((match) => (
          <MatchCard key={match.id} match={match} now={now} />
        ))}
      </div>
    </section>
  );
}
