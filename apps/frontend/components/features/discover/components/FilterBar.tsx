"use client";

import { useState } from "react";
import {
  SORT_OPTIONS,
  type LeagueDto,
  type MatchTab,
  type SortMode,
} from "../domain";

export interface TabDescriptor {
  key: MatchTab;
  label: string;
  count?: number;
}

interface FilterBarProps {
  tabs: TabDescriptor[];
  activeTab: MatchTab;
  onTab: (t: MatchTab) => void;
  leagues: LeagueDto[];
  activeLeague: string | null;
  onLeague: (key: string | null) => void;
  sortMode: SortMode;
  onSort: (s: SortMode) => void;
  showFinished: boolean;
  onToggleFinished: () => void;
}

/**
 * Stable key for league filtering — pairs id and name to avoid collisions
 * if the API ever returns reused ids across competitions.
 */
export const leagueKey = (l: LeagueDto): string =>
  `${l.league.id}_${l.league.name}`;

export function FilterBar({
  tabs,
  activeTab,
  onTab,
  leagues,
  activeLeague,
  onLeague,
  sortMode,
  onSort,
  showFinished,
  onToggleFinished,
}: FilterBarProps) {
  return (
    <div className="relative z-[5] border-y border-[#1E1E1E] bg-[#111]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-0 px-8 sm:px-14">
        {/* Row 1: status tabs + sort */}
        <div className="flex flex-col items-start justify-between gap-3 border-b border-[#1E1E1E] py-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((t) => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onTab(t.key)}
                  className="font-mono-ctv inline-flex items-center gap-2 rounded-md border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                  style={{
                    borderColor: active ? "#E8001D" : "#2A2A2A",
                    background: active ? "rgba(232,0,29,0.08)" : "transparent",
                    color: active ? "#fff" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {t.key === "live" && (
                    <span
                      className="ctv-pulse-dot inline-block h-[5px] w-[5px] rounded-full bg-[#E8001D]"
                      style={{ boxShadow: "0 0 6px #E8001D" }}
                    />
                  )}
                  {t.label}
                  {typeof t.count === "number" && t.count > 0 && (
                    <span
                      className="ml-1 inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-sm px-1 text-[9px] font-bold"
                      style={{
                        background: active ? "rgba(232,0,29,0.2)" : "#1A1A1A",
                        color: active ? "#E8001D" : "rgba(255,255,255,0.65)",
                      }}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
            <label className="ml-2 inline-flex cursor-pointer items-center gap-2 border-l border-[#1E1E1E] pl-4">
              <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
                Show finished
              </span>
              <FinishedSwitch on={showFinished} onChange={onToggleFinished} />
            </label>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="font-mono-ctv hidden text-[10px] uppercase tracking-[0.16em] text-white/45 sm:inline">
              Sort
            </span>
            {SORT_OPTIONS.map((s) => {
              const active = sortMode === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onSort(s.value)}
                  className="font-mono-ctv rounded-md border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                  style={{
                    borderColor: active ? "#E8001D" : "#2A2A2A",
                    color: active ? "#fff" : "rgba(255,255,255,0.55)",
                    background: active ? "rgba(232,0,29,0.08)" : "transparent",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: leagues */}
        <div className="-mx-2 flex items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onLeague(null)}
            className="font-mono-ctv flex-shrink-0 rounded-md border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
            style={{
              borderColor: activeLeague === null ? "#E8001D" : "#2A2A2A",
              background:
                activeLeague === null ? "rgba(232,0,29,0.08)" : "transparent",
              color:
                activeLeague === null ? "#fff" : "rgba(255,255,255,0.55)",
              marginLeft: 8,
            }}
          >
            All leagues
          </button>
          {leagues.map((l) => {
            const key = leagueKey(l);
            const active = activeLeague === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onLeague(key)}
                className="font-mono-ctv flex flex-shrink-0 items-center gap-2 rounded-md border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                style={{
                  borderColor: active ? "#E8001D" : "#2A2A2A",
                  background: active ? "rgba(232,0,29,0.08)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.55)",
                }}
              >
                {l.league.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.league.logoUrl}
                    alt=""
                    className="h-3.5 w-3.5 object-contain"
                    style={{ filter: "grayscale(100%) brightness(1.4)" }}
                  />
                )}
                {l.league.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FinishedSwitch({
  on,
  onChange,
}: {
  on: boolean;
  onChange: () => void;
}) {
  // Tracked locally too so the switch is interactive even before the parent
  // wires the toggle through (defensive UI).
  const [local, setLocal] = useState(on);
  const checked = on || local;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        setLocal((v) => !v);
        onChange();
      }}
      className="relative h-4 w-7 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
      style={{
        background: checked ? "rgba(232,0,29,0.5)" : "#1A1A1A",
        borderColor: checked ? "#E8001D" : "#2A2A2A",
      }}
    >
      <span
        className="absolute top-[1px] block h-2.5 w-2.5 rounded-full bg-white transition-all"
        style={{ left: checked ? 14 : 2 }}
      />
    </button>
  );
}
