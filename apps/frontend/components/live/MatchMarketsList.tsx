"use client";

import { useEffect, useState } from "react";
import { type Address } from "viem";
import { Trophy, Target, Users, Hash, Flag, Clock3, type LucideIcon } from "lucide-react";
import { isBettable, type BettableResult } from "@chiliztv/domain/matches/policies/BettablePolicy";
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

/** Buffer en secondes avant le kickoff durant lequel on bloque les paris. */
const KICKOFF_BUFFER_SEC = 120;

/** Match metadata nécessaire au check `isBettable`. */
export interface MatchBettableContext {
  /** Code brut API-Football : NS / 1H / HT / 2H / FT / PST / ... */
  status: string;
  /** Kickoff ISO string. */
  kickoffAt: string;
}

interface MatchMarketsListProps {
  contractAddress?: Address;
  walletAddress?: string;
  homeTeam?: string;
  awayTeam?: string;
  /** Per-market DB odds — drives the cells + gates the bet when missing. */
  matchOdds?: MatchOdds;
  /** Match metadata pour le check `isBettable` (couche 2 du defense-in-depth). */
  match?: MatchBettableContext;
}

/**
 * Pill texte affiché quand le marché on-chain est `Open` mais le match
 * n'est plus pari-able selon la policy domain.
 */
function bettableBlockLabel(verdict: BettableResult, kickoffAt: string, now: Date): string {
  if (verdict.ok) return '';
  switch (verdict.reason) {
    case 'LIVE':
      return 'Live · Betting closed';
    case 'HALFTIME':
      return 'Halftime · Betting closed';
    case 'KICKOFF_BUFFER': {
      const mins = Math.max(1, Math.ceil((new Date(kickoffAt).getTime() - now.getTime()) / 60_000));
      return `Kicks off in ${mins}m · Betting closed`;
    }
    case 'FINISHED':
      return 'Awaiting resolution';
    case 'POSTPONED':
      return 'Postponed';
    case 'UNKNOWN':
    default:
      return 'Predictions unavailable';
  }
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
  match?: MatchBettableContext;
  now: Date | null;
  onBet: (selection: MarketSelection) => void;
}

function MarketRow({ contractAddress, marketId, homeTeam, awayTeam, matchOdds, match, now, onBet }: MarketRowProps) {
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

  // Couche 2 du defense-in-depth no-live-betting : la policy domain bloque
  // les paris dès qu'on entre dans le buffer kickoff / le match passe live /
  // est postponed. Si `now` n'est pas encore résolu (SSR), on n'applique pas
  // le check — fallback sur le state on-chain seul.
  const verdict: BettableResult =
    match && now
      ? isBettable(match, now, { kickoffBufferSec: KICKOFF_BUFFER_SEC })
      : { ok: true };
  const blockedByPolicy = !verdict.ok;
  const canBet = isOpen && !blockedByPolicy && !!spec?.supportsBetting && dbOdds.hasAny;
  const policyMessage = match && now ? bettableBlockLabel(verdict, match.kickoffAt, now) : '';

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
      className="px-4 py-4"
      style={{ borderTop: marketId > 0 ? "1px solid #1E1E1E" : "none" }}
    >
      {/* Top row : icon + label + state + pool */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
        >
          <Icon size={14} style={{ color: "#fff" }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display truncate text-[16px] font-extrabold uppercase tracking-tight text-white">
              {label}
            </span>
            {lineLabel && (
              <span className="font-mono-ctv rounded-sm border border-[#1E1E1E] bg-[#141414] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/65">
                O/U {lineLabel}
              </span>
            )}
          </div>
          <div className="font-mono-ctv mt-1 truncate text-[10px] uppercase tracking-[0.16em] text-white/45">
            {hint}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className="font-mono-ctv rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{
              background: `${stateColor}1a`,
              color: stateColor,
              border: `1px solid ${stateColor}33`,
            }}
          >
            {stateName}
          </span>
          <span className="font-mono-ctv text-[10px] tabular-nums text-white/45">
            {formatBetAmount(totalPool, assetDecimals)} {BET_TOKEN_SYMBOL}
          </span>
        </div>
      </div>

      {/* Odds-not-available hint */}
      {isOpen && spec?.supportsBetting && !dbOdds.hasAny && !blockedByPolicy && (
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

      {/* Policy gate — pari bloqué pour cause de live / halftime / buffer / postponed. */}
      {isOpen && spec?.supportsBetting && blockedByPolicy && policyMessage && (
        <div
          role="status"
          aria-label={policyMessage}
          className="mt-2 px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.16em] font-mono-ctv"
          style={{
            background: "rgba(232,0,29,0.08)",
            border: "1px solid rgba(232,0,29,0.3)",
            color: "#E8001D",
          }}
        >
          {policyMessage}
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
                className="group flex items-center justify-between rounded-md px-3 py-2.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                style={{
                  background: "#0d0d0d",
                  border: "1px solid #1E1E1E",
                  color: cellBettable ? "#fff" : "#666",
                  cursor: cellBettable ? "pointer" : "not-allowed",
                  opacity: cellBettable ? 1 : 0.4,
                }}
                onMouseEnter={(e) => {
                  if (!cellBettable) return;
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "rgba(232,0,29,0.08)";
                  el.style.borderColor = "#E8001D";
                }}
                onMouseLeave={(e) => {
                  if (!cellBettable) return;
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "#0d0d0d";
                  el.style.borderColor = "#1E1E1E";
                }}
              >
                <span className="font-display truncate text-[12px] font-extrabold uppercase tracking-tight">
                  {o.label}
                </span>
                <span
                  className="font-mono-ctv ml-2 text-[12px] font-bold tabular-nums"
                  style={{ color: cellOdds !== null ? "#E8001D" : "#666" }}
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
  match,
}: MatchMarketsListProps) {
  const [activeMarket, setActiveMarket] = useState<MarketSelection | null>(null);

  // Clock — null en SSR pour éviter un hydration mismatch, ticke toutes les
  // 15s côté client. Suffit largement pour détecter une transition vers le
  // kickoff buffer (changement 1-fois, pas un compteur en temps réel).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

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
            match={match}
            now={now}
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
        match={match}
        now={now}
      />
    </>
  );
}

function SkeletonRow({ first = false }: { first?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-4"
      style={{ borderTop: first ? "none" : "1px solid #1E1E1E" }}
    >
      <div className="h-9 w-9 animate-pulse rounded-md" style={{ background: "#1E1E1E" }} />
      <div className="flex-1">
        <div className="mb-1.5 h-3 w-24 animate-pulse rounded" style={{ background: "#1E1E1E" }} />
        <div className="h-2.5 w-32 animate-pulse rounded" style={{ background: "#141414" }} />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="font-mono-ctv px-4 py-10 text-center text-[11px] uppercase tracking-[0.16em] text-white/45">
      {message}
    </div>
  );
}
