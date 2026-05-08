"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EmptyState,
  FilterBar,
  LeagueSection,
  MatchCard,
  leagueKey,
  type TabDescriptor,
} from "../components";
import {
  groupByLeague,
  isLive,
  sortMatches,
  type FlatMatch,
  type LeagueDto,
  type MatchTab,
  type SortMode,
} from "../domain";

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

export function MatchExplorer({
  matches,
  leagues,
  now,
  isLoading = false,
}: {
  matches: FlatMatch[];
  leagues: LeagueDto[];
  /** `null` until the client clock has been initialised post-hydration. */
  now: Date | null;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<MatchTab>("all");
  const [league, setLeague] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("time_asc");
  const [showFinished, setShowFinished] = useState(false);

  const liveCount = useMemo(
    () => matches.filter((m) => isLive(m.status)).length,
    [matches],
  );
  const upcomingCount = useMemo(
    () => matches.filter((m) => m.status === "NS").length,
    [matches],
  );

  const filtered = useMemo(() => {
    let arr = matches;
    if (!showFinished) arr = arr.filter((m) => !FINISHED_STATUSES.has(m.status));
    if (tab === "live") arr = arr.filter((m) => isLive(m.status));
    if (tab === "upcoming") arr = arr.filter((m) => m.status === "NS");
    if (league) arr = arr.filter((m) => `${m.leagueId}_${m.leagueName}` === league);
    return sortMatches(arr, sort);
  }, [matches, tab, league, sort, showFinished]);

  // `league_*` sort modes switch the layout from a flat grid to per-league
  // sections. Memoised so we don't rebucket on every parent re-render.
  const grouped = sort === "league_asc" || sort === "league_desc";
  const groups = useMemo(
    () =>
      grouped
        ? groupByLeague(filtered, sort === "league_asc" ? "asc" : "desc")
        : null,
    [grouped, filtered, sort],
  );

  const goToMatch = useCallback(
    (m: FlatMatch) => router.push(`/live/${m.id}`),
    [router],
  );

  const tabs: TabDescriptor[] = [
    { key: "all", label: "All", count: matches.length },
    { key: "live", label: "Live", count: liveCount },
    { key: "upcoming", label: "Upcoming", count: upcomingCount },
  ];

  return (
    <section id="explorer" className="relative z-[4]">
      <FilterBar
        tabs={tabs}
        activeTab={tab}
        onTab={setTab}
        leagues={leagues}
        activeLeague={league}
        onLeague={setLeague}
        sortMode={sort}
        onSort={setSort}
        showFinished={showFinished}
        onToggleFinished={() => setShowFinished((v) => !v)}
      />

      <div className="mx-auto max-w-[1400px] px-8 pb-20 pt-12 sm:px-14 sm:pb-28 sm:pt-16">
        {filtered.length === 0 ? (
          isLoading ? (
            <EmptyState
              label="Loading matches"
              hint="Fetching live fixtures from the network…"
            />
          ) : matches.length === 0 ? (
            <EmptyState
              label="No matches available"
              hint="Live data is unavailable. Check back at kickoff."
            />
          ) : (
            <EmptyState
              label={
                tab === "live"
                  ? "No live matches right now"
                  : "Nothing matches that filter"
              }
              hint="Try clearing the league or switching tab."
            />
          )
        ) : groups ? (
          groups.map((g) => (
            <LeagueSection
              key={g.leagueId}
              league={g.leagueName}
              logo={g.leagueLogo}
              matches={g.matches}
              now={now}
              onPredict={goToMatch}
              onWatch={goToMatch}
            />
          ))
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                now={now}
                onPredict={goToMatch}
                onWatch={goToMatch}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Re-export leagueKey for tests / parents that need to derive a key.
export { leagueKey };
