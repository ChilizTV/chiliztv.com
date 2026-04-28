"use client";

import { useState, useEffect, useRef } from "react";
import type { BrowseMatchDto, StreamPreviewDto } from "@chiliztv/shared/dto/matches/BrowseMatchesDto";
import { useBrowseMatches } from "@/hooks/api/useBrowseMatches";
import { PoolStatsSection } from "./PoolStatsSection";
import { DiscoverMatchCard } from "./DiscoverMatchCard";
import { StreamCard, type StreamCardData } from "./StreamCard";
import { MOCK_LEAGUES } from "./mockMatches";

type FlatMatch = BrowseMatchDto & { leagueName: string };
type Tab = "all" | "live" | "upcoming";

const LIVE_STATUSES = new Set(["1H", "2H", "ET", "BT", "P", "LIVE"]);

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: "#E8001D" }} />
      <h2
        className="text-[22px] font-bold uppercase tracking-[0.05em] leading-none"
        style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#fff" }}
      >
        {children}
      </h2>
    </div>
  );
}

function buildStreams(matches: FlatMatch[]): StreamCardData[] {
  return matches
    .flatMap((m) =>
      m.streamsPreview.map((sp: StreamPreviewDto) => ({
        streamId: sp.streamId,
        streamerName: sp.streamerName,
        thumbnailUrl: sp.thumbnailUrl,
        viewers: sp.viewers,
        matchId: m.id,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        score: m.score,
      }))
    )
    .sort((a, b) => b.viewers - a.viewers)
    .slice(0, 8)
    .map((s, i) => ({ ...s, featured: i === 0 }));
}

export function DiscoverPage() {
  const { data } = useBrowseMatches();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [now, setNow] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const allMatches: FlatMatch[] =
    data && data.leagues.length > 0
      ? data.leagues.flatMap((l) =>
          l.matches.map((m) => ({ ...m, leagueName: l.league.name }))
        )
      : MOCK_LEAGUES.flatMap((l) =>
          l.matches.map((m) => ({ ...m, leagueName: l.league.name }))
        );

  const liveMatches = allMatches.filter((m) => LIVE_STATUSES.has(m.status));
  const upcomingMatches = allMatches.filter((m) => m.status === "NS");
  const topStreams = buildStreams(allMatches);

  const filtered =
    activeTab === "live"
      ? liveMatches
      : activeTab === "upcoming"
      ? upcomingMatches
      : allMatches;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "live", label: "Live", count: liveMatches.length },
    { key: "upcoming", label: "Upcoming" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 sm:py-14 flex flex-col gap-12">

        {/* Page title */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: "#E8001D" }} />
            <h1
              className="text-[34px] sm:text-[44px] font-black uppercase tracking-[0.05em] leading-none text-white"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Discover
            </h1>
          </div>
          <p className="text-[13px] ml-4" style={{ color: "#888", fontFamily: "'Barlow', sans-serif" }}>
            Live sports. Live community. On-chain.
          </p>
        </div>

        {/* Pool */}
        <PoolStatsSection />

        {/* Top Streamers */}
        {topStreams.length > 0 && (
          <section>
            <SectionTitle>Top Streamers</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topStreams.map((s) => (
                <StreamCard key={s.streamId} stream={s} />
              ))}
            </div>
          </section>
        )}

        {/* Matches */}
        <section>
          <SectionTitle>Matches</SectionTitle>

          {/* Tab bar */}
          <div className="flex gap-0 mb-6" style={{ borderBottom: "1px solid #2A2A2A" }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors duration-150"
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  color: activeTab === t.key ? "#fff" : "#888",
                  borderBottom: `2px solid ${activeTab === t.key ? "#E8001D" : "transparent"}`,
                  marginBottom: "-1px",
                }}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(0,200,83,0.15)", color: "#00C853" }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[14px]" style={{ color: "#555" }}>
              No matches for this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m) => (
                <DiscoverMatchCard key={m.id} match={m} leagueName={m.leagueName} now={now} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
