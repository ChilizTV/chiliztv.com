"use client";

import { useMemo, useState } from "react";
import {
  EmptyState,
  FilterBar,
  MatchCard,
  leagueKey,
  type TabDescriptor,
} from "../components";
import {
  isLive,
  sortMatches,
  type FlatMatch,
  type LeagueDto,
  type MatchTab,
  type SortMode,
} from "../domain";
import { SectionHead } from "./SectionHead";

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

export function MatchExplorer({
  matches,
  leagues,
  now,
}: {
  matches: FlatMatch[];
  leagues: LeagueDto[];
  /** `null` until the client clock has been initialised post-hydration. */
  now: Date | null;
}) {
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

  const tabs: TabDescriptor[] = [
    { key: "all", label: "All", count: matches.length },
    { key: "live", label: "Live", count: liveCount },
    { key: "upcoming", label: "Upcoming", count: upcomingCount },
  ];

  return (
    <section id="explorer" className="relative z-[4]">
      <div className="mx-auto max-w-[1400px] px-8 pb-12 pt-16 sm:px-14 sm:pb-16 sm:pt-24">
        <SectionHead
          eyebrow="Match explorer"
          title={
            <>
              Browse the action.
              <br />
              <span className="text-[#E8001D]">Pick your moment.</span>
            </>
          }
          lead="Filter, sort, predict. Every match is a smart-contract market on Chiliz Chain. Live cards stream into the pool in real time."
        />
      </div>

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

      <div className="mx-auto max-w-[1400px] px-8 pb-20 pt-10 sm:px-14 sm:pb-28">
        {filtered.length === 0 ? (
          <EmptyState
            label={
              tab === "live"
                ? "No live matches right now"
                : "Nothing matches that filter"
            }
            hint="Try clearing the league or switching tab."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <MatchCard key={m.id} match={m} now={now} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Re-export leagueKey for tests / parents that need to derive a key.
export { leagueKey };
