"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrowseMatches } from "@/hooks/api/useBrowseMatches";
import {
  buildStreams,
  flattenMatches,
  fmtViewers,
  isLive,
  MOCK_LEAGUES,
  type LeagueDto,
} from "./domain";
import {
  BackgroundFX,
  DiscoverCTA,
  DiscoverHero,
  DiscoverStats,
  DiscoverTicker,
  MatchExplorer,
  PoolPanel,
  TopStreamersSection,
  type HeroStat,
  type StatRow,
} from "./sections";

const TICK_MS = 30_000;

/**
 * DiscoverPage — orchestrates all data and renders sections in order. State
 * is centralised here; sections stay pure and side-effect free.
 *
 * Real BrowseMatches API data is preferred when available; falls back to
 * the bundled mock so the page is never empty.
 */
export function DiscoverPage() {
  const { data } = useBrowseMatches();
  // `now` is null on the server / first paint to keep SSR markup deterministic
  // (same `new Date()` would otherwise render a different minute on the server
  // and on the client → hydration mismatch). It's set on mount, then ticked.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const leagues: LeagueDto[] =
    data && data.leagues.length > 0 ? data.leagues : MOCK_LEAGUES;

  const allMatches = useMemo(() => flattenMatches(leagues), [leagues]);
  const liveMatches = useMemo(
    () => allMatches.filter((m) => isLive(m.status)),
    [allMatches],
  );
  const upcomingMatches = useMemo(
    () => allMatches.filter((m) => m.status === "NS"),
    [allMatches],
  );
  const topStreams = useMemo(() => buildStreams(allMatches, 8), [allMatches]);

  const totalViewers = useMemo(
    () =>
      allMatches
        .flatMap((m) => m.streamsPreview)
        .reduce((s, sp) => s + sp.viewers, 0),
    [allMatches],
  );
  const streamsLive = useMemo(
    () => allMatches.flatMap((m) => m.streamsPreview).length,
    [allMatches],
  );

  const heroStats: HeroStat[] = [
    {
      label: "Streams live",
      value: String(streamsLive),
      sub: `across ${leagues.length} leagues`,
      accent: true,
    },
    {
      label: "Markets open",
      value: String(allMatches.length * 3),
      sub: "1X2 · O/U · BTTS",
    },
    {
      label: "Matches today",
      value: String(allMatches.length),
      sub: `${liveMatches.length} live · ${upcomingMatches.length} upcoming`,
    },
    {
      label: "Pool TVL",
      value: "$4.82M",
      sub: "▲ 12.4% · 30d",
    },
  ];

  const stripRows: StatRow[] = [
    { label: "Pool TVL", value: "$4.82M", delta: "▲ 12.4% · 30d" },
    {
      label: "Matches live",
      value: String(liveMatches.length),
      delta: "now",
    },
    {
      label: "Streams live",
      value: String(streamsLive),
      delta: `across ${leagues.length} leagues`,
    },
    {
      label: "Total viewers",
      value: fmtViewers(totalViewers),
      delta: "concurrent",
    },
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-clip text-white"
      style={{ background: "#0A0A0A" }}
    >
      <BackgroundFX />
      <DiscoverHero stats={heroStats} />
      <DiscoverTicker matches={allMatches} now={now} />
      <DiscoverStats rows={stripRows} />
      <PoolPanel />
      <MatchExplorer matches={allMatches} leagues={leagues} now={now} />
      <TopStreamersSection streams={topStreams} />
      <DiscoverCTA
        liveCount={streamsLive}
        marketsOpen={allMatches.length * 3}
        tvl="$4.82M"
      />
    </div>
  );
}
