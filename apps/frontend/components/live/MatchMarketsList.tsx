"use client";

import { useState } from "react";
import { type Address, keccak256, toBytes } from "viem";
import { Trophy, Target, Users, Hash, Flag, Clock3, type LucideIcon } from "lucide-react";
import {
  useBettingMatchReadMarketCount,
  useBettingMatchReadGetMarketInfo,
} from "@/lib/contracts/generated";
import { MarketBetDialog } from "./MarketBetDialog";
import { BET_TOKEN_SYMBOL, formatBetAmount } from "./utils/betToken";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";

// Pin contract reads to Chiliz Spicy testnet so they don't depend on the
// connected wallet's active chain (otherwise the request never fires).
const BETTING_CHAIN_ID = 88882 as const;

// Reverse lookup: keccak256(marketTypeName) → display key used by MARKET_META.
const MARKET_TYPE_HASH_TO_KEY: Record<string, string> = {
  [keccak256(toBytes("WINNER"))]: "winner",
  [keccak256(toBytes("GOALS_TOTAL"))]: "goalstotal",
  [keccak256(toBytes("BOTH_SCORE"))]: "bothscore",
  [keccak256(toBytes("CORRECT_SCORE"))]: "correctscore",
  [keccak256(toBytes("FIRST_SCORER"))]: "firstscorer",
  [keccak256(toBytes("HALFTIME"))]: "halftime",
};

interface MatchMarketsListProps {
  contractAddress?: Address;
  walletAddress?: string;
  homeTeam?: string;
  awayTeam?: string;
}

interface MarketMeta {
  label: string;
  hint: string;
  icon: LucideIcon;
}

const MARKET_META: Record<string, MarketMeta> = {
  winner: { label: "Match Result", hint: "Home / Draw / Away", icon: Trophy },
  goalstotal: { label: "Total Goals", hint: "Over / Under", icon: Target },
  bothscore: { label: "Both Teams Score", hint: "Yes / No", icon: Users },
  correctscore: { label: "Correct Score", hint: "Exact final score", icon: Hash },
  firstscorer: { label: "First Goal", hint: "Home / Away / None", icon: Flag },
  halftime: { label: "Halftime Result", hint: "Score at half", icon: Clock3 },
};

const SUPPORTED_BET_KEYS = new Set([
  "winner",
  "goalstotal",
  "bothscore",
  "firstscorer",
  "halftime",
]);

const STATE_LABELS = ["Inactive", "Open", "Suspended", "Closed", "Resolved", "Cancelled"];
const STATE_COLORS: Record<string, { bg: string; fg: string }> = {
  Open: { bg: "rgba(0,200,83,0.12)", fg: "#00C853" },
  Suspended: { bg: "rgba(245,197,24,0.12)", fg: "#F5C518" },
  Closed: { bg: "rgba(232,0,29,0.12)", fg: "#E8001D" },
  Resolved: { bg: "rgba(120,120,120,0.12)", fg: "#888" },
  Cancelled: { bg: "rgba(120,120,120,0.12)", fg: "#888" },
  Inactive: { bg: "rgba(120,120,120,0.12)", fg: "#555" },
};

export interface MarketSelection {
  marketId: number;
  marketLabel: string;
  marketTypeKey: string;
  line: number;
  state: number;
  totalPool: bigint;
}

function formatLine(line: number, marketKey: string): string | null {
  if (line === 0) return null;
  if (marketKey === "goalstotal") return `O/U ${(line / 10).toFixed(1)}`;
  return String(line);
}

interface MarketRowProps {
  contractAddress: Address;
  marketId: number;
  onBet: (selection: MarketSelection) => void;
}

function MarketRow({ contractAddress, marketId, onBet }: MarketRowProps) {
  const { data, isLoading } = useBettingMatchReadGetMarketInfo({
    address: contractAddress,
    args: [BigInt(marketId)],
    chainId: BETTING_CHAIN_ID,
  });
  const { assetDecimals } = usePoolDecimals();

  if (isLoading || !data) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderTop: marketId > 0 ? "1px solid #1E1E1E" : "none" }}
      >
        <div className="w-8 h-8 rounded" style={{ background: "#1E1E1E" }} />
        <div className="flex-1">
          <div className="h-3 w-24 rounded mb-1.5" style={{ background: "#1E1E1E" }} />
          <div className="h-2.5 w-32 rounded" style={{ background: "#141414" }} />
        </div>
      </div>
    );
  }

  // getMarketInfo returns: (bytes32 marketType, uint8 state, uint32 currentOdds, uint64 result, uint256 totalPool)
  const [marketTypeHash, state, , , totalPool] = data as readonly [
    `0x${string}`,
    number,
    number,
    bigint,
    bigint,
  ];

  const key = MARKET_TYPE_HASH_TO_KEY[marketTypeHash.toLowerCase()] ?? "unknown";
  const meta = MARKET_META[key] ?? {
    label: "Unknown market",
    hint: "",
    icon: Trophy,
  };
  const Icon = meta.icon;
  const stateLabel = STATE_LABELS[state] ?? "—";
  const stateColors = STATE_COLORS[stateLabel] ?? STATE_COLORS.Inactive;
  // Line is no longer returned by getMarketInfo — set to 0 (display omitted for non-OU markets anyway).
  const line = 0;
  const lineLabel = formatLine(line, key);
  const isOpen = state === 1;
  const canBet = isOpen && SUPPORTED_BET_KEYS.has(key);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderTop: marketId > 0 ? "1px solid #1E1E1E" : "none" }}
    >
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
            {meta.label}
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
              {lineLabel}
            </span>
          )}
        </div>
        <div
          className="text-[11px] truncate mt-0.5"
          style={{ color: "#555", fontFamily: "'Barlow', sans-serif" }}
        >
          {meta.hint}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className="text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded"
          style={{
            background: stateColors.bg,
            color: stateColors.fg,
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          {stateLabel}
        </span>
        <span
          className="text-[11px]"
          style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}
        >
          {formatBetAmount(totalPool, assetDecimals)} {BET_TOKEN_SYMBOL}
        </span>
      </div>

      <button
        onClick={() =>
          onBet({
            marketId,
            marketLabel: meta.label,
            marketTypeKey: key,
            line,
            state,
            totalPool,
          })
        }
        disabled={!canBet}
        className="h-9 px-3 rounded text-[11px] font-bold tracking-[0.08em] uppercase transition-colors duration-150 flex-shrink-0"
        style={{
          background: canBet ? "#E8001D" : "#1E1E1E",
          border: `1px solid ${canBet ? "#E8001D" : "#2A2A2A"}`,
          color: canBet ? "#fff" : "#555",
          cursor: canBet ? "pointer" : "not-allowed",
          fontFamily: "'Barlow', sans-serif",
        }}
        onMouseEnter={(e) => {
          if (!canBet) return;
          (e.currentTarget as HTMLButtonElement).style.background = "#B0001A";
        }}
        onMouseLeave={(e) => {
          if (!canBet) return;
          (e.currentTarget as HTMLButtonElement).style.background = "#E8001D";
        }}
      >
        Predict
      </button>
    </div>
  );
}

export function MatchMarketsList({
  contractAddress,
  walletAddress,
  homeTeam,
  awayTeam,
}: MatchMarketsListProps) {
  const [activeMarket, setActiveMarket] = useState<MarketSelection | null>(null);

  const { data: marketCountData, isLoading } = useBettingMatchReadMarketCount({
    address: contractAddress,
    chainId: BETTING_CHAIN_ID,
    query: { enabled: !!contractAddress },
  });

  if (!contractAddress) {
    return <EmptyState message="No betting contract attached to this match." />;
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
