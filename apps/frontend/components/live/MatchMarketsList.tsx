"use client";

import { useState } from "react";
import { type Address } from "viem";
import { Trophy, Target, Users, Hash, Flag, Clock3, type LucideIcon } from "lucide-react";
import {
  useBettingMatchReadGetMarketInfo,
  useBettingMatchReadMarketCount,
  useBettingMatchFactoryReadGetSportType,
  useFootballMatchReadGetFootballMarket,
  useBettingMatchWatchOddsUpdated,
} from "@/lib/contracts/generated";
import { useQueryClient } from "@tanstack/react-query";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { formatBetAmount, BET_TOKEN_SYMBOL } from "./utils/betToken";
import { chilizConfig } from "@/config/chiliz.config";
import {
  getMarketSpec,
  getOddsForMarket,
  isHiddenMarket,
  isFootballMatch,
  stateLabel as catalogStateLabel,
  stateAccent,
  MarketState,
  type MarketKey,
} from "@/lib/contracts/markets";
import type { MatchOdds } from "@/types/api.types";
import { MarketBetDialog } from "./MarketBetDialog";
import { UnsupportedSportPanel } from "./UnsupportedSportPanel";

// Pin contract reads to Chiliz Spicy testnet so they don't depend on the
// connected wallet's active chain (otherwise the request never fires).
const BETTING_CHAIN_ID = 88882 as const;

interface MatchMarketsListProps {
  contractAddress?: Address;
  walletAddress?: string;
  homeTeam?: string;
  awayTeam?: string;
  /** Per-market DB odds — drives the cells + gates the bet when missing. */
  matchOdds?: MatchOdds;
}

// Icon mapping is UI-side. The catalog (Lot 1) stays presentation-agnostic.
const MARKET_ICONS: Record<MarketKey, LucideIcon> = {
  winner: Trophy,
  goalstotal: Target,
  bothscore: Users,
  halftime: Clock3,
  firstscorer: Flag,
};

export interface MarketSelection {
  marketId: number;
  marketLabel: string;
  marketTypeHash: `0x${string}`;
  line: number;
  state: number;
  totalPool: bigint;
  /** Optional pre-selected outcome (0/1/2) when the user clicked a specific odds cell. */
  defaultSelection?: number;
  /** Per-outcome odds from the DB JSONB (selection → decimal). Empty map = bet disabled. */
  oddsBySelection?: ReadonlyMap<number, number>;
}

interface MarketRowProps {
  contractAddress: Address;
  marketId: number;
  homeTeam?: string;
  awayTeam?: string;
  matchOdds?: MatchOdds;
  onBet: (selection: MarketSelection) => void;
}

function MarketRow({ contractAddress, marketId, homeTeam, awayTeam, matchOdds, onBet }: MarketRowProps) {
  const qc = useQueryClient();
  const { data, isLoading, queryKey } = useBettingMatchReadGetMarketInfo({
    address: contractAddress,
    args: [BigInt(marketId)],
    chainId: BETTING_CHAIN_ID,
  });
  const { assetDecimals } = usePoolDecimals();

  // FootballMatch view returns the `line` (int16) along with current odds.
  // Used for GOALS_TOTAL Over/Under labels (`Over 2.5`).
  const { data: footballMarket, queryKey: footballQK } =
    useFootballMatchReadGetFootballMarket({
      address: contractAddress,
      args: [BigInt(marketId)],
      chainId: BETTING_CHAIN_ID,
    });

  // Live odds invalidation — when the resolver pushes new odds, refetch.
  useBettingMatchWatchOddsUpdated({
    address: contractAddress,
    chainId: BETTING_CHAIN_ID,
    args: { marketId: BigInt(marketId) },
    onLogs() {
      void qc.invalidateQueries({ queryKey });
      void qc.invalidateQueries({ queryKey: footballQK });
    },
  });

  if (isLoading || !data) {
    return <SkeletonRow first={marketId === 0} />;
  }

  // getMarketInfo returns: (bytes32 marketType, uint8 state, uint32 currentOdds, uint64 result, uint256 totalPool)
  const [marketTypeHash, state, , , totalPool] = data as readonly [
    `0x${string}`,
    number,
    number,
    bigint,
    bigint,
  ];

  // Hidden markets (CORRECT_SCORE) are filtered out entirely — return null so
  // the parent's loop renders nothing for this row index.
  if (isHiddenMarket(marketTypeHash)) return null;

  const spec = getMarketSpec(marketTypeHash);
  const label = spec?.label ?? "Unknown market";
  const hint = spec?.hint ?? "";
  const Icon = spec ? MARKET_ICONS[spec.key] ?? Hash : Hash;
  const line = footballMarket ? Number((footballMarket as readonly [string, number, number, number, number, bigint, bigint])[1]) : 0;
  const lineLabel = spec?.hasLine && line > 0 ? `${(line / 10).toFixed(1)}` : null;
  const isOpen = state === MarketState.Open;

  // Per-outcome odds from the DB JSONB. Single source of truth — no fake odds
  // when the admin hasn't posted any. `bySelection` empty ⇒ bet disabled here.
  const dbOdds = spec ? getOddsForMarket(matchOdds, spec.key) : { bySelection: new Map<number, number>(), hasAny: false };
  const canBet = isOpen && !!spec?.supportsBetting && dbOdds.hasAny;

  const stateName = catalogStateLabel(state);
  const stateColor = stateAccent(state);

  const outcomes = spec ? spec.getOutcomes(line, homeTeam, awayTeam) : [];

  const handleCellClick = (selectionIdx: number) => {
    if (!canBet) return;
    onBet({
      marketId,
      marketLabel: label,
      marketTypeHash,
      line,
      state,
      totalPool,
      defaultSelection: selectionIdx,
      oddsBySelection: dbOdds.bySelection,
    });
  };

  return (
    <div
      className="px-4 py-3"
      style={{ borderTop: marketId > 0 ? "1px solid #1E1E1E" : "none" }}
    >
      {/* Top row : icon + label + state + pool */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "#1E1E1E" }}
        >
          <Icon size={14} style={{ color: "#888" }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[13px] font-bold uppercase truncate"
              style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {label}
            </span>
            {lineLabel && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: "#1E1E1E",
                  color: "#888",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                O/U {lineLabel}
              </span>
            )}
          </div>
          <div
            className="text-[11px] truncate mt-0.5"
            style={{ color: "#555", fontFamily: "'Barlow', sans-serif" }}
          >
            {hint}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className="text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded"
            style={{
              background: `${stateColor}1f`,
              color: stateColor,
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            {stateName}
          </span>
          <span
            className="text-[11px]"
            style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatBetAmount(totalPool, assetDecimals)} {BET_TOKEN_SYMBOL}
          </span>
        </div>
      </div>

      {/* Odds-not-available hint */}
      {isOpen && spec?.supportsBetting && !dbOdds.hasAny && (
        <div
          className="mt-2 px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.16em]"
          style={{
            background: "rgba(245,197,24,0.08)",
            border: "1px solid rgba(245,197,24,0.3)",
            color: "#F5C518",
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          Odds not posted yet — betting disabled
        </div>
      )}

      {/* Outcome cells — clickable, pre-fill defaultSelection in the dialog. */}
      {outcomes.length > 0 && (
        <div
          className="mt-3 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${outcomes.length}, minmax(0, 1fr))` }}
        >
          {outcomes.map((o) => {
            const cellOdds = dbOdds.bySelection.get(o.selection) ?? null;
            const cellBettable = canBet && cellOdds !== null;
            return (
            <button
              key={o.selection}
              type="button"
              onClick={() => handleCellClick(o.selection)}
              disabled={!cellBettable}
              className="flex items-center justify-between px-3 py-2 rounded transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
              style={{
                background: "#1A1A1A",
                border: "1px solid #2A2A2A",
                color: cellBettable ? "#fff" : "#666",
                cursor: cellBettable ? "pointer" : "not-allowed",
                opacity: cellBettable ? 1 : 0.4,
              }}
              onMouseEnter={(e) => {
                if (!cellBettable) return;
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "rgba(232,0,29,0.10)";
                el.style.borderColor = "#E8001D";
              }}
              onMouseLeave={(e) => {
                if (!cellBettable) return;
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "#1A1A1A";
                el.style.borderColor = "#2A2A2A";
              }}
            >
              <span
                className="text-[11px] font-bold uppercase tracking-[0.04em] truncate"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {o.label}
              </span>
              <span
                className="text-[12px] font-bold tabular-nums ml-2"
                style={{ color: cellOdds !== null ? "#E8001D" : "#666", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {cellOdds !== null ? `× ${cellOdds.toFixed(2)}` : "—"}
              </span>
            </button>
          );
          })}
        </div>
      )}
    </div>
  );
}

export function MatchMarketsList({
  contractAddress,
  walletAddress,
  homeTeam,
  awayTeam,
  matchOdds,
}: MatchMarketsListProps) {
  const [activeMarket, setActiveMarket] = useState<MarketSelection | null>(null);

  // Sport-type guard (Lot 2.5) — if this match is basketball, render the
  // "coming soon" placeholder instead of the football markets list.
  const { data: sportType } = useBettingMatchFactoryReadGetSportType({
    address: chilizConfig.bettingMatchFactory,
    args: contractAddress ? [contractAddress] : undefined,
    chainId: BETTING_CHAIN_ID,
    query: { enabled: !!contractAddress },
  });
  const isFootball = sportType === undefined ? true : isFootballMatch(sportType);

  const { data: marketCountData, isLoading } = useBettingMatchReadMarketCount({
    address: contractAddress,
    chainId: BETTING_CHAIN_ID,
    query: { enabled: !!contractAddress && isFootball },
  });

  if (!contractAddress) {
    return <EmptyState message="No betting contract attached to this match." />;
  }

  if (!isFootball) {
    return <UnsupportedSportPanel />;
  }

  const count = marketCountData ? Number(marketCountData) : 0;

  if (isLoading && count === 0) {
    return (
      <div>
        <SkeletonRow first />
        <SkeletonRow />
      </div>
    );
  }

  if (count === 0) {
    return <EmptyState message="No markets opened yet on this match." />;
  }

  return (
    <>
      <div>
        {Array.from({ length: count }, (_, i) => (
          <MarketRow
            key={i}
            contractAddress={contractAddress}
            marketId={i}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            matchOdds={matchOdds}
            onBet={setActiveMarket}
          />
        ))}
      </div>

      <MarketBetDialog
        open={!!activeMarket}
        onClose={() => setActiveMarket(null)}
        contractAddress={contractAddress}
        walletAddress={walletAddress}
        selection={activeMarket}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />
    </>
  );
}

function SkeletonRow({ first = false }: { first?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderTop: first ? "none" : "1px solid #1E1E1E" }}
    >
      <div className="w-8 h-8 rounded" style={{ background: "#1E1E1E" }} />
      <div className="flex-1">
        <div className="h-3 w-24 rounded mb-1.5" style={{ background: "#1E1E1E" }} />
        <div className="h-2.5 w-32 rounded" style={{ background: "#141414" }} />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="px-4 py-8 text-center text-[12px]"
      style={{ color: "#555", fontFamily: "'Barlow', sans-serif" }}
    >
      {message}
    </div>
  );
}
