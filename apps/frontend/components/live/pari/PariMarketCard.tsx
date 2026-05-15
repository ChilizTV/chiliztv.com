'use client';

import { formatUnits, type Address } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Flame } from 'lucide-react';

import {
  usePariMarketSpec,
  usePariMarketCore,
  usePariMarketTotalPool,
  MARKET_STATE_LABEL,
  marketTypeKey,
} from '@/hooks/usePariMatch';
import { useFootballPariMatchReadGetOutcomePool } from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { MARKET_META, OUTCOME_COLORS, outcomeLabels } from './marketMeta';
import { OutcomeButton } from './OutcomeButton';

export interface PariMarketSelection {
  marketId: number;
  marketTypeKey: string;
  marketLabel: string;
  /** PariMatchBase.MarketState enum (0..5). Surfaced so the bet dialog can
   *  show state-specific banners (e.g. "Open this market" CTA when Inactive). */
  marketState: number;
  outcome: number;
  outcomeLabel: string;
  accent: string;
  totalPool: bigint;
  /** Pool for the selected outcome. The bet dialog uses this for the live
   *  payout estimate; it stays close to the on-chain value via wagmi cache. */
  outcomePool: bigint;
}

interface PariMarketCardProps {
  matchAddress: Address;
  marketId: number;
  homeTeam?: string;
  awayTeam?: string;
  onSelectOutcome: (selection: PariMarketSelection) => void;
}

/**
 * One pari-mutuel market rendered Polymarket-style:
 *   - Header chip with market icon, label, hint, and live state.
 *   - One OutcomeButton per outcome, each with its implied probability bar.
 *   - Footer with total-pool USDC volume + a pulse highlight when the pool
 *     grows (someone just placed a bet on this market).
 *
 * High-cardinality markets (correct score = 100 outcomes, first scorer = 256,
 * goals_exact / points_exact = arbitrary line+1) collapse to a 6-row preview
 * with a "show all" toggle so the page never tries to render hundreds of
 * outcome rows at once.
 */
export function PariMarketCard({
  matchAddress,
  marketId,
  homeTeam,
  awayTeam,
  onSelectOutcome,
}: PariMarketCardProps) {
  const { spec, isLoading: loadingSpec } = usePariMarketSpec(matchAddress, marketId);
  const { core, isLoading: loadingCore } = usePariMarketCore(matchAddress, marketId);
  const { totalPool } = usePariMarketTotalPool(matchAddress, marketId);
  const { assetDecimals } = usePoolDecimals();

  const COLLAPSED_LIMIT = 6;
  const [expanded, setExpanded] = useState(false);

  // Derived values (always defined to keep hooks order stable below).
  const key = spec ? marketTypeKey(spec.marketType) : 'unknown';
  const meta = MARKET_META[key] ?? MARKET_META.unknown;
  const stateLabel = core ? (MARKET_STATE_LABEL[core.state] ?? '—') : '—';
  const outcomeCount = spec ? spec.maxOutcome + 1 : 0;
  const visibleCount =
    expanded || outcomeCount <= COLLAPSED_LIMIT ? outcomeCount : COLLAPSED_LIMIT;

  const labels = useMemo(
    () =>
      spec
        ? outcomeLabels(key, spec.maxOutcome, spec.line, homeTeam, awayTeam)
        : [],
    [spec, key, homeTeam, awayTeam],
  );

  if (loadingSpec || loadingCore || !spec || !core) {
    return <CardSkeleton />;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      className="overflow-hidden rounded-xl"
      style={{
        background: 'linear-gradient(180deg, #141414 0%, #0F0F0F 100%)',
        border: '1px solid #2A2A2A',
        boxShadow: '0 4px 24px -10px rgba(0,0,0,0.6)',
      }}
    >
      {/* Top accent strip */}
      <div
        className="h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${meta.accent} 0%, transparent 70%)` }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-md"
          style={{ background: `${meta.accent}1F`, border: `1px solid ${meta.accent}44` }}
        >
          <meta.icon size={16} style={{ color: meta.accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-[14px] font-bold uppercase tracking-[0.06em]"
            style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {meta.label}
          </div>
          <div
            className="truncate text-[11px]"
            style={{ color: '#666', fontFamily: "'Barlow', sans-serif" }}
          >
            {meta.hint}
          </div>
        </div>
        <StateChip state={core.state} label={stateLabel} accent={meta.accent} />
      </div>

      {/* Outcomes grid */}
      <div className="space-y-2 px-4 pb-3 pt-2">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: visibleCount === 2 ? '1fr 1fr' : '1fr',
          }}
        >
          {Array.from({ length: visibleCount }, (_, i) => (
            <OutcomeRow
              key={i}
              matchAddress={matchAddress}
              marketId={marketId}
              outcome={i}
              label={labels[i] ?? `Outcome ${i}`}
              totalPool={totalPool}
              outcomeCount={outcomeCount}
              accent={
                key === 'winner' || key === 'halftime' || key === 'highest_quarter'
                  ? OUTCOME_COLORS[i % OUTCOME_COLORS.length]
                  : meta.accent
              }
              onPick={(outcomePool) =>
                onSelectOutcome({
                  marketId,
                  marketTypeKey: key,
                  marketLabel: meta.label,
                  marketState: core.state,
                  outcome: i,
                  outcomeLabel: labels[i] ?? `Outcome ${i}`,
                  accent: meta.accent,
                  totalPool,
                  outcomePool,
                })
              }
            />
          ))}
        </div>

        {outcomeCount > COLLAPSED_LIMIT && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 w-full rounded-md py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: '#141414',
              color: '#888',
              border: '1px dashed #2A2A2A',
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            {expanded ? 'Collapse' : `Show all ${outcomeCount} outcomes`}
          </button>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between border-t px-4 py-2"
        style={{ borderColor: '#1E1E1E' }}
      >
        <PoolFlash totalPool={totalPool} decimals={assetDecimals} accent={meta.accent} />
        <span
          className="text-[10px] uppercase tracking-[0.12em]"
          style={{ color: '#555', fontFamily: "'Barlow', sans-serif" }}
        >
          {outcomeCount} outcome{outcomeCount === 1 ? '' : 's'} · pari-mutuel
        </span>
      </div>
    </motion.div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StateChip({ state, label, accent }: { state: number; label: string; accent: string }) {
  const isOpen = state === 1;
  return (
    <motion.span
      animate={isOpen ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
      transition={isOpen ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      className="flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
      style={{
        background: isOpen ? `${accent}1F` : '#1E1E1E',
        color: isOpen ? accent : '#888',
        fontFamily: "'Barlow', sans-serif",
        border: `1px solid ${isOpen ? `${accent}55` : '#2A2A2A'}`,
      }}
    >
      {label}
    </motion.span>
  );
}

interface OutcomeRowProps {
  matchAddress: Address;
  marketId: number;
  outcome: number;
  label: string;
  totalPool: bigint;
  /** Used to show an equal-distribution placeholder when totalPool == 0. */
  outcomeCount: number;
  accent: string;
  onPick: (outcomePool: bigint) => void;
}

function OutcomeRow({
  matchAddress,
  marketId,
  outcome,
  label,
  totalPool,
  outcomeCount,
  accent,
  onPick,
}: OutcomeRowProps) {
  const { data: rawPool } = useFootballPariMatchReadGetOutcomePool({
    address: matchAddress,
    args: [BigInt(marketId), BigInt(outcome)],
    chainId: chilizConfig.chainId,
    query: { refetchInterval: 5_000 },
  });
  const pool = (rawPool as bigint | undefined) ?? 0n;
  // When the pool is empty (brand-new market, no bets yet), Polymarket-vibe
  // requires the bar to *look alive* instead of all-zeros. Show equal
  // distribution as a placeholder so the user can see the outcomes evenly.
  const probability =
    totalPool > 0n
      ? Number((pool * 10_000n) / totalPool) / 10_000
      : outcomeCount > 0
        ? 1 / outcomeCount
        : 0;

  // Buttons are always clickable: the bet dialog handles the actual state
  // gating with a clear banner + CTA when the market isn't Open. This
  // matches Polymarket's pattern (you can always inspect a market).
  return (
    <OutcomeButton
      label={label}
      probability={probability}
      accent={accent}
      disabled={false}
      placeholder={totalPool === 0n}
      onClick={() => onPick(pool)}
    />
  );
}

/**
 * Pool size with a brief glow when the value increases (someone just bet on
 * this market). Tracks prev value in a ref and toggles a keyed motion span
 * for re-entry animation on growth.
 */
function PoolFlash({
  totalPool,
  decimals,
  accent,
}: {
  totalPool: bigint;
  decimals: number | undefined;
  accent: string;
}) {
  const [flashKey, setFlashKey] = useState(0);
  const prev = useRef(totalPool);

  useEffect(() => {
    if (totalPool > prev.current) {
      setFlashKey((k) => k + 1);
    }
    prev.current = totalPool;
  }, [totalPool]);

  const formatted =
    decimals !== undefined
      ? Number(formatUnits(totalPool, decimals)).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '—';

  return (
    <div className="flex items-center gap-1.5">
      <Flame size={11} style={{ color: accent }} />
      <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: '#666' }}>
        Pool
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={flashKey}
          initial={{ scale: 1, color: '#fff' }}
          animate={{ scale: [1.1, 1], color: [accent, '#fff'] }}
          transition={{ duration: 0.6 }}
          className="text-[12px] font-bold tabular-nums"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {formatted}
        </motion.span>
      </AnimatePresence>
      <span className="text-[10px]" style={{ color: '#666' }}>
        USDC
      </span>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl px-4 py-4"
      style={{ background: '#0F0F0F', border: '1px solid #1E1E1E' }}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md" style={{ background: '#1E1E1E' }} />
        <div className="flex-1">
          <div className="mb-1 h-3 w-32 rounded" style={{ background: '#1E1E1E' }} />
          <div className="h-2 w-20 rounded" style={{ background: '#141414' }} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-14 rounded-lg" style={{ background: '#141414' }} />
        <div className="h-14 rounded-lg" style={{ background: '#141414' }} />
      </div>
    </div>
  );
}
