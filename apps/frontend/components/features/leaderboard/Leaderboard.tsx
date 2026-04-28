"use client";

import { useState } from "react";
import { getAllFanTokens } from "@/utils/FanTokens";
import { MonthlyCashPrizePool } from "../../leaderboard/MonthlyCashPrizePool";
import { LeaderboardHeader, AchievementBadges, PredictorCard, TokenHolderCard } from "./components";
import { mockTopPredictors, mockTopTokenHolders } from "./utils";

type Tab = "predicts" | "tokens";
type Period = "week" | "month" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  week: "This Week",
  month: "This Month",
  all: "All Time",
};

const COL_PREDICTS = ["#", "Predictor", "Preds", "Win Rate", "Earned $CHZ", "Streak"];
const COL_TOKENS   = ["#", "Holder", "Tokens", "Portfolio"];

export function Leaderboard() {
  const [activeTab, setActiveTab]     = useState<Tab>("predicts");
  const [activePeriod, setActivePeriod] = useState<Period>("month");

  const fanTokens = getAllFanTokens();
  const getTokenLogo = (symbol: string): string => {
    const t = fanTokens.find((t: { symbol: string }) => t.symbol === symbol);
    return t?.image ?? `https://via.placeholder.com/24?text=${symbol}`;
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "predicts", label: "Top Predictors" },
    { key: "tokens",   label: "Token Holders"  },
  ];

  const cols = activeTab === "predicts" ? COL_PREDICTS : COL_TOKENS;

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 sm:py-14 flex flex-col gap-10">

        <LeaderboardHeader />
        <MonthlyCashPrizePool />
        <AchievementBadges />

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          {/* Period pills */}
          <div className="flex gap-1">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className="px-4 py-1.5 text-[11px] font-semibold tracking-[0.07em] uppercase rounded transition-all duration-150"
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  background: activePeriod === p ? "#1E1E1E" : "transparent",
                  border:     `1px solid ${activePeriod === p ? "#3A3A3A" : "transparent"}`,
                  color:      activePeriod === p ? "#fff" : "#555",
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Table card */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: "#141414", border: "1px solid #2A2A2A" }}
        >
          {/* Tab bar */}
          <div className="flex" style={{ borderBottom: "1px solid #2A2A2A" }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="px-6 py-3 text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors duration-150"
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  color:        activeTab === t.key ? "#fff" : "#555",
                  borderBottom: `2px solid ${activeTab === t.key ? "#E8001D" : "transparent"}`,
                  marginBottom: "-1px",
                  background:   activeTab === t.key ? "#1E1E1E" : "transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Column headers — desktop */}
          <div
            className="hidden sm:flex items-center gap-3 px-4 py-2.5 text-[9px] font-semibold tracking-[0.12em] uppercase"
            style={{ background: "#1A1A1A", borderBottom: "1px solid #2A2A2A", color: "#444" }}
          >
            <div className="w-10 flex-shrink-0">{cols[0]}</div>
            <div className="flex-1">{cols[1]}</div>
            {cols.slice(2).map((h) => (
              <div key={h} className="w-24 text-center flex-shrink-0">{h}</div>
            ))}
          </div>

          {/* Rows */}
          <div>
            {activeTab === "predicts"
              ? mockTopPredictors.map((p) => (
                  <PredictorCard key={p.rank} predictor={p} tokenLogo={getTokenLogo(p.favoriteTeam)} />
                ))
              : mockTopTokenHolders.map((h) => (
                  <TokenHolderCard key={h.rank} holder={h} tokenLogo={getTokenLogo(h.topToken)} />
                ))}
          </div>
        </div>

      </div>
    </div>
  );
}
