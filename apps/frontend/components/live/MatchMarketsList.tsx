"use client";

import { useEffect, useMemo, useState } from "react";
import { type Address, formatUnits } from "viem";
import { Trophy, Target, Users, Hash, Flag, Clock3, type LucideIcon } from "lucide-react";
import { isBettable, type BettableResult } from "@chiliztv/domain/matches/policies/BettablePolicy";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePariMatchFactoryReadGetSportType,
  usePariMatchBaseWatchMarketStateChanged,
  usePariMatchBaseWatchMarketResolved,
  usePariMatchBaseWatchMarketCancelled,
  usePariMatchBaseWatchPositionTaken,
} from "@/lib/contracts/generated";
import { useMarketPools } from "@/hooks/api/useMarketPools";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { formatBetAmount, BET_TOKEN_SYMBOL } from "./utils/betToken";
import { chilizConfig } from "@/config/chiliz.config";
import { queryKeys } from "@/lib/query/keys";
import {
  getMarketSpec,
  getOddsForMarket,
  isHiddenMarket,
  isFootballMatch,
  stateLabel as catalogStateLabel,
  stateAccent,
  MarketState,
  type MarketKey,
  type MarketPoolSnapshot,
} from "@/lib/contracts/markets";
import type { MatchOdds } from "@/types/api.types";
import { MarketBetDialog } from "./MarketBetDialog";
import { UnsupportedSportPanel } from "./UnsupportedSportPanel";

const BETTING_CHAIN_ID = chilizConfig.chainId;

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
  /** Per-market DB odds — cosmetic hint when the pool is empty. */
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
      return 'Live · Predictions closed';
    case 'HALFTIME':
      return 'Halftime · Predictions closed';
    case 'KICKOFF_BUFFER': {
      const mins = Math.max(1, Math.ceil((new Date(kickoffAt).getTime() - now.getTime()) / 60_000));
      return `Kicks off in ${mins}m · Predictions closed`;
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

const MARKET_ICONS: Record<MarketKey, LucideIcon> = {
  winner: Trophy,
  goalstotal: Target,
  bothscore: Users,
  halftime: Clock3,
  firstscorer: Flag,
  goalsexact: Hash,
  'bb-winner': Trophy,
  totalpoints: Target,
  spread: Target,
  pointsexact: Hash,
};

export interface MarketSelection {
  marketId: number;
  marketLabel: string;
  marketTypeHash: `0x${string}`;
  line: number;
  state: number;
  totalPool: bigint;
  /** Inclusive max valid outcome (uint8 on-chain). UI renders `maxOutcome + 1` cells. */
  maxOutcome: number;
  /** Optional pre-selected outcome when the user clicked a specific cell. */
  defaultSelection?: number;
  /** Cosmetic DB odds fallback (selection → decimal). Empty Map = no hint. */
  oddsBySelection?: ReadonlyMap<number, number>;
}

interface MarketRowProps {
  contractAddress: Address;
  snapshot: MarketPoolSnapshot;
  homeTeam?: string;
  awayTeam?: string;
  matchOdds?: MatchOdds;
  match?: MatchBettableContext;
  now: Date | null;
  onBet: (selection: MarketSelection) => void;
}

function MarketRow({ contractAddress, snapshot, homeTeam, awayTeam, matchOdds, match, now, onBet }: MarketRowProps) {
  const { assetDecimals } = usePoolDecimals();

  const marketId = Number(snapshot.marketId);
  const marketTypeHash = snapshot.marketType as `0x${string}`;
  const state = snapshot.state;
  const line = snapshot.line;
  const totalPool = BigInt(snapshot.totalPool);

  if (isHiddenMarket(marketTypeHash)) return null;

  const spec = getMarketSpec(marketTypeHash);
  const label = spec?.label ?? "Unknown market";
  const hint = spec?.hint ?? "";
  const Icon = spec ? MARKET_ICONS[spec.key] ?? Hash : Hash;
  const lineLabel = spec?.hasLine && line > 0 ? `${(line / 10).toFixed(1)}` : null;
  const isOpen = state === MarketState.Open;

  // DB hint — only used cosmetically when the pool is still empty.
  const dbOdds = spec
    ? getOddsForMarket(matchOdds, spec.key)
    : { bySelection: new Map<number, number>(), hasAny: false };

  const verdict: BettableResult =
    match && now
      ? isBettable(match, now, { kickoffBufferSec: KICKOFF_BUFFER_SEC })
      : { ok: true };
  const blockedByPolicy = !verdict.ok;
  const canBet = isOpen && !blockedByPolicy && !!spec?.supportsBetting;
  const policyMessage = match && now ? bettableBlockLabel(verdict, match.kickoffAt, now) : '';

  const stateName = catalogStateLabel(state);
  const stateColor = stateAccent(state);

  const outcomes = spec ? spec.getOutcomes(line, homeTeam, awayTeam) : [];
  const poolHasLiquidity = totalPool > BigInt(0);

  const handleCellClick = (selectionIdx: number) => {
    if (!canBet) return;
    onBet({
      marketId,
      marketLabel: label,
      marketTypeHash,
      line,
      state,
      totalPool,
      maxOutcome: snapshot.maxOutcome,
      defaultSelection: selectionIdx,
      oddsBySelection: dbOdds.bySelection,
    });
  };

  return (
    <div
      className="px-4 py-4"
      style={{ borderTop: marketId > 0 ? "1px solid #1E1E1E" : "none" }}
    >
      {/* Top row: icon + label + state + pool */}
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
            Pool {formatBetAmount(totalPool, assetDecimals)} {BET_TOKEN_SYMBOL}
          </span>
        </div>
      </div>

      {/* Outcome distribution bar — visible only when the pool has liquidity. */}
      {poolHasLiquidity && outcomes.length > 0 && (
        <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-[#141414]">
          {snapshot.outcomePools.map((raw: string, idx: number) => {
            const fraction = totalPool > BigInt(0)
              ? Number(BigInt(raw) * BigInt(10_000) / totalPool) / 100
              : 0;
            if (fraction <= 0) return null;
            const tint = idx === 0 ? '#E8001D' : idx === 1 ? '#F5C518' : '#2dd4a4';
            return (
              <span
                key={idx}
                style={{ width: `${fraction}%`, background: tint, opacity: 0.8 }}
                aria-hidden
              />
            );
          })}
        </div>
      )}

      {/* Policy gate — blocked by live / halftime / buffer / postponed. */}
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

      {/* Outcome cells — three display modes: probability if pool>0, ref odds
          if DB hint available, else "be the first" prompt. */}
      {outcomes.length > 0 && (
        <div
          className="mt-3 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${outcomes.length}, minmax(0, 1fr))` }}
        >
          {outcomes.map((o) => {
            const outcomeIdx = o.selection;
            const outcomePoolRaw = snapshot.outcomePools[outcomeIdx];
            const outcomePool = outcomePoolRaw ? BigInt(outcomePoolRaw) : BigInt(0);
            const probBps = snapshot.impliedProbBps[outcomeIdx] ?? 0;
            const refOdds = dbOdds.bySelection.get(outcomeIdx) ?? null;
            return (
              <button
                key={outcomeIdx}
                type="button"
                onClick={() => handleCellClick(outcomeIdx)}
                disabled={!canBet}
                className="group flex flex-col gap-1 rounded-md px-3 py-2.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                style={{
                  background: "#0d0d0d",
                  border: "1px solid #1E1E1E",
                  color: canBet ? "#fff" : "#666",
                  cursor: canBet ? "pointer" : "not-allowed",
                  opacity: canBet ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (!canBet) return;
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "rgba(232,0,29,0.08)";
                  el.style.borderColor = "#E8001D";
                }}
                onMouseLeave={(e) => {
                  if (!canBet) return;
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "#0d0d0d";
                  el.style.borderColor = "#1E1E1E";
                }}
              >
                <span className="font-display truncate text-[12px] font-extrabold uppercase tracking-tight">
                  {o.label}
                </span>
                {poolHasLiquidity ? (
                  <span className="font-mono-ctv flex items-center justify-between text-[10px] tabular-nums">
                    <span style={{ color: "#E8001D" }}>{(probBps / 100).toFixed(1)}%</span>
                    <span className="text-white/45">
                      ${Number(formatUnits(outcomePool, assetDecimals)).toLocaleString()}
                    </span>
                  </span>
                ) : refOdds !== null ? (
                  <span className="font-mono-ctv text-[10px] italic tabular-nums text-white/45">
                    Ref × {refOdds.toFixed(2)} · no positions yet
                  </span>
                ) : (
                  <span className="font-mono-ctv text-[10px] tabular-nums text-white/45">
                    Be the first to predict
                  </span>
                )}
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
  const qc = useQueryClient();
  const [activeMarket, setActiveMarket] = useState<MarketSelection | null>(null);

  // Clock — null en SSR pour éviter un hydration mismatch.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  // Sport-type guard — basketball renders the placeholder.
  const { data: sportType } = usePariMatchFactoryReadGetSportType({
    address: chilizConfig.pariMatchFactory,
    args: contractAddress ? [contractAddress] : undefined,
    chainId: BETTING_CHAIN_ID,
    query: { enabled: !!contractAddress },
  });
  const isFootball = sportType === undefined ? true : isFootballMatch(sportType);

  // Single round-trip multicall for every market on this proxy.
  const { data: pools, isLoading } = useMarketPools(contractAddress);

  const sortedMarkets = useMemo(
    () => [...(pools?.markets ?? [])].sort(
      (a, b) => Number(BigInt(a.marketId) - BigInt(b.marketId)),
    ),
    [pools?.markets],
  );

  const invalidatePools = () => {
    if (!contractAddress) return;
    void qc.invalidateQueries({
      queryKey: queryKeys.markets.pools(contractAddress.toLowerCase()),
    });
  };

  // Live invalidation — pool ratios change on every new position, state moves
  // on resolve/cancel/close, and the resolver tick.
  usePariMatchBaseWatchPositionTaken({
    address: contractAddress,
    chainId: BETTING_CHAIN_ID,
    enabled: !!contractAddress,
    onLogs: invalidatePools,
  });
  usePariMatchBaseWatchMarketStateChanged({
    address: contractAddress,
    chainId: BETTING_CHAIN_ID,
    enabled: !!contractAddress,
    onLogs: invalidatePools,
  });
  usePariMatchBaseWatchMarketResolved({
    address: contractAddress,
    chainId: BETTING_CHAIN_ID,
    enabled: !!contractAddress,
    onLogs: invalidatePools,
  });
  usePariMatchBaseWatchMarketCancelled({
    address: contractAddress,
    chainId: BETTING_CHAIN_ID,
    enabled: !!contractAddress,
    onLogs: invalidatePools,
  });

  if (!contractAddress) {
    return <EmptyState message="No prediction contract attached to this match." />;
  }

  if (!isFootball) {
    return <UnsupportedSportPanel />;
  }

  if (isLoading && !pools) {
    return (
      <div>
        <SkeletonRow first />
        <SkeletonRow />
      </div>
    );
  }

  if (sortedMarkets.length === 0) {
    return <EmptyState message="No markets opened yet on this match." />;
  }

  return (
    <>
      <div>
        {sortedMarkets.map((snapshot) => (
          <MarketRow
            key={snapshot.marketId}
            contractAddress={contractAddress}
            snapshot={snapshot}
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
