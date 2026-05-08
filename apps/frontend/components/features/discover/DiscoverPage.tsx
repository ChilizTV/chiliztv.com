"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrowseMatches } from "@/hooks/api/useBrowseMatches";
import {
  buildStreams,
  flattenMatches,
  type LeagueDto,
} from "./domain";
import {
  BackgroundFX,
  DiscoverCTA,
  DiscoverTicker,
  MatchExplorer,
  PoolPanel,
  SmokeBackdrop,
  TopStreamersSection,
} from "./sections";

const TICK_MS = 30_000;

/**
 * DiscoverPage — orchestrates real BrowseMatches API data and renders
 * sections in order. State is centralised here; sections stay pure and
 * side-effect free. No mock fallback: if the API has nothing, sections
 * render their own empty/loading affordances.
 */
export function DiscoverPage() {
  const { data, isLoading } = useBrowseMatches();
  // `now` is null on the server / first paint to keep SSR markup deterministic
  // (same `new Date()` would otherwise render a different minute on the server
  // and on the client → hydration mismatch). It's set on mount, then ticked.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // `data.leagues` is reassigned to a new array on every refetch, so memoise
  // it (and downstream derivations) to keep `useMemo` deps stable.
  const leagues = useMemo<LeagueDto[]>(() => data?.leagues ?? [], [data]);

  const allMatches = useMemo(() => flattenMatches(leagues), [leagues]);
  const topStreams = useMemo(() => buildStreams(allMatches, 8), [allMatches]);
  const streamsLive = useMemo(
    () => allMatches.flatMap((m) => m.streamsPreview).length,
    [allMatches],
  );

  return (
    <div
      className="relative min-h-screen overflow-x-clip text-white"
      style={{ background: "#0A0A0A" }}
    >
      <BackgroundFX />
      {/* Sticky live ticker — sits at the very top, follows on scroll. */}
      <DiscoverTicker matches={allMatches} now={now} />
      <SmokeBackdrop>
        <PoolPanel />
      </SmokeBackdrop>
      <MatchExplorer
        matches={allMatches}
        leagues={leagues}
        now={now}
        isLoading={isLoading}
      />
      <TopStreamersSection streams={topStreams} />
      <DiscoverCTA
        liveCount={streamsLive}
        marketsOpen={allMatches.length * 3}
        tvl="$4.82M"
      />
    </div>
  );
}
