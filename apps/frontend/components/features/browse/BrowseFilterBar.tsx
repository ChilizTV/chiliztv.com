"use client";

import Image from "next/image";
import { Radio, Clock, CheckCircle2, ArrowUpNarrowWide, ArrowDownNarrowWide } from "lucide-react";
import { BrowseLeague, SortMode } from "@/types/browse.types";

export type StatusFilter = "live" | "upcoming" | "finished";

interface BrowseFilterBarProps {
  leagues: BrowseLeague[];
  activeLeagueKey: string | null;
  activeStatus: StatusFilter | null;
  sortMode: SortMode;
  onLeagueChange: (key: string | null) => void;
  onStatusChange: (status: StatusFilter | null) => void;
  onSortChange: (mode: SortMode) => void;
}

const STATUS_OPTIONS: {
  value: StatusFilter;
  label: string;
  Icon: React.ElementType;
  activeClass: string;
  inactiveClass: string;
}[] = [
  {
    value: "live",
    label: "Live",
    Icon: Radio,
    activeClass: "bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]",
    inactiveClass: "bg-red-500/5 border-red-900/40 text-red-700 hover:bg-red-500/10 hover:border-red-800/60 hover:text-red-500",
  },
  {
    value: "upcoming",
    label: "Upcoming",
    Icon: Clock,
    activeClass: "bg-blue-500/20 border-blue-500/60 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.2)]",
    inactiveClass: "bg-blue-500/5 border-blue-900/40 text-blue-700 hover:bg-blue-500/10 hover:border-blue-800/60 hover:text-blue-500",
  },
  {
    value: "finished",
    label: "Finished",
    Icon: CheckCircle2,
    activeClass: "bg-gray-500/20 border-gray-500/60 text-gray-300 shadow-[0_0_8px_rgba(107,114,128,0.15)]",
    inactiveClass: "bg-gray-700/10 border-gray-700/40 text-gray-600 hover:bg-gray-700/20 hover:border-gray-600/50 hover:text-gray-500",
  },
];

const LEAGUE_INACTIVE_CLASS =
  "bg-transparent border-gray-800 text-gray-600 hover:border-gray-700 hover:text-gray-400";

const SORT_OPTIONS: { value: SortMode; label: string; Icon: React.ElementType }[] = [
  { value: "league_asc",  label: "League ↑", Icon: ArrowUpNarrowWide },
  { value: "league_desc", label: "League ↓", Icon: ArrowDownNarrowWide },
  { value: "time_asc",    label: "Time ↑",   Icon: ArrowUpNarrowWide },
  { value: "time_desc",   label: "Time ↓",   Icon: ArrowDownNarrowWide },
];

export function BrowseFilterBar({
  leagues,
  activeLeagueKey,
  activeStatus,
  sortMode,
  onLeagueChange,
  onStatusChange,
  onSortChange,
}: BrowseFilterBarProps) {
  const handleStatusClick = (value: StatusFilter) => {
    onStatusChange(activeStatus === value ? null : value);
  };

  const handleLeagueClick = (key: string | null) => {
    onLeagueChange(activeLeagueKey === key ? null : key);
  };

  return (
    <div className="flex flex-col gap-2 mb-8">
      {/* Row 1 : sort */}
      <div className="flex items-center gap-2">
        {SORT_OPTIONS.map(({ value, label, Icon }) => {
          const isActive = sortMode === value;
          return (
            <button
              key={value}
              onClick={() => onSortChange(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white/10 border-white/25 text-white"
                  : LEAGUE_INACTIVE_CLASS
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Row 2 : status */}
      <div className="flex items-center gap-2">
        {STATUS_OPTIONS.map(({ value, label, Icon, activeClass, inactiveClass }) => {
          const isActive = activeStatus === value;
          return (
            <button
              key={value}
              onClick={() => handleStatusClick(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
                isActive ? activeClass : inactiveClass
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Row 2 : leagues (hidden if only one league) */}
      {leagues.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {/* "All" pill */}
          <button
            onClick={() => handleLeagueClick(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
              activeLeagueKey === null
                ? "bg-white/10 border-white/25 text-white"
                : LEAGUE_INACTIVE_CLASS
            }`}
          >
            All leagues
          </button>

          {leagues.map(({ league }) => {
            const key = `${league.id}_${league.name}`;
            const isActive = activeLeagueKey === key;
            return (
              <button
                key={key}
                onClick={() => handleLeagueClick(key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 border-white/25 text-white"
                    : LEAGUE_INACTIVE_CLASS
                }`}
              >
                {league.logoUrl ? (
                  <Image
                    src={league.logoUrl}
                    alt={league.name}
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 object-contain"
                  />
                ) : null}
                {league.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
