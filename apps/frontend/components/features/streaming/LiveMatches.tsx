"use client";

import { useState, useMemo } from "react";
import { Calendar } from "lucide-react";
import { useBrowseMatches } from "@/hooks/api";
import { LoadingState } from "@/components/common/states/LoadingState";
import { ErrorState } from "@/components/common/states/ErrorState";
import { useMatchTimeUpdate } from "./hooks";
import { getMatchStatus, MatchStatus } from "./utils";
import { LeagueSection } from "@/components/features/browse/LeagueSection";
import { BrowseFilterBar, StatusFilter } from "@/components/features/browse/BrowseFilterBar";
import type { BrowseLeagueDto, BrowseMatchDto } from "@chiliztv/shared/dto/matches/BrowseMatchesDto";
import type { SortMode } from "@/types/browse.types";
import { applySort } from "@/utils/browse-sorting";
import type { Match } from "@/types/api.types";

/**
 * @notice Live matches page component
 * @dev Displays matches grouped by league, filterable by status and league
 */
export default function LiveMatches() {
  const { data, isLoading, error, refetch } = useBrowseMatches();
  const now = useMatchTimeUpdate();

  const [activeLeagueKey, setActiveLeagueKey] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<StatusFilter | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("league_asc");

  const leagues = useMemo(() => data?.leagues ?? [], [data?.leagues]);

  const filteredLeagues = useMemo<BrowseLeagueDto[]>(() => {
    return leagues
      .map((league) => {
        // League filter — composite key handles duplicate IDs in test data
        const leagueKey = `${league.league.id}_${league.league.name}`;
        if (activeLeagueKey !== null && leagueKey !== activeLeagueKey) return null;

        // Status filter
        if (activeStatus === null) return league;

        const filteredMatches = league.matches.filter((match: BrowseMatchDto) => {
          const ds = getMatchStatus({
            status: match.status,
            startTime: match.kickoffAt,
          } as unknown as Match);
          if (activeStatus === "live") return ds === MatchStatus.LIVE;
          if (activeStatus === "upcoming") return ds === MatchStatus.PREDICTION_OPEN;
          if (activeStatus === "finished") return ds === MatchStatus.ENDED;
          return true;
        });

        if (filteredMatches.length === 0) return null;
        return { ...league, matches: filteredMatches };
      })
      .filter((l): l is BrowseLeagueDto => l !== null);
  }, [leagues, activeLeagueKey, activeStatus]);

  const sortedLeagues = useMemo<BrowseLeagueDto[]>(
    () => applySort(filteredLeagues, sortMode),
    [filteredLeagues, sortMode],
  );

  if (isLoading) {
    return <LoadingState message="Loading matches..." />;
  }

  if (error) {
    return <ErrorState message="Error loading matches" onRetry={() => refetch()} />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white px-4 md:px-8 py-16"
      style={{ fontFamily: "Lexend, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-gray-300 bg-clip-text text-transparent">
            Live Matches
          </h1>
          <p className="text-gray-400 text-lg">Follow your favorite teams in real-time</p>
          <div className="mt-4 text-sm text-gray-500">Auto-refresh every minute</div>
        </header>

        {leagues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-full border border-gray-700/50">
                <Calendar className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Matches Available</h2>
            <p className="text-gray-400 text-center max-w-md mb-8">
              There are currently no matches scheduled. Check back soon for upcoming games and live
              streams!
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50"
            >
              Refresh
            </button>
          </div>
        ) : (
          <>
            <BrowseFilterBar
              leagues={leagues}
              activeLeagueKey={activeLeagueKey}
              activeStatus={activeStatus}
              sortMode={sortMode}
              onLeagueChange={setActiveLeagueKey}
              onStatusChange={setActiveStatus}
              onSortChange={setSortMode}
            />

            {sortedLeagues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-gray-400 text-lg mb-2">No matches found for the selected filters</p>
                <button
                  onClick={() => {
                    setActiveLeagueKey(null);
                    setActiveStatus(null);
                  }}
                  className="mt-4 text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <section className="flex flex-col gap-10 w-full">
                {sortedLeagues.map((league) => (
                  <LeagueSection
                    key={`${league.league.id}_${league.league.name}`}
                    league={league}
                    now={now}
                    showHeader={league.league.id !== 0}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
