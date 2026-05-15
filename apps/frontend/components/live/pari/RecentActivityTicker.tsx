'use client';

import { useState } from 'react';
import { formatUnits, type Address } from 'viem';
import { AnimatePresence, motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import { useWatchContractEvent } from 'wagmi';

import { footballPariMatchAbi } from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';

interface PositionEntry {
  id: number;
  marketId: number;
  user: Address;
  outcome: number;
  stake: bigint;
  /** Unix-ms when we received the event. */
  at: number;
}

interface RecentActivityTickerProps {
  matchAddress: Address;
  accent?: string;
  /** Max rows kept on screen. Older rows fall out the bottom. */
  maxRows?: number;
}

/**
 * Live activity feed driven by `PositionTaken` events emitted on the match.
 *
 * Each event slides in from the top with a coloured pill (red flash) and
 * settles into the list. After `maxRows` entries the oldest drops out.
 *
 * useWatchContractEvent polls via the wagmi client; ~3-block default poll
 * which is fine for Chiliz Spicy (3s block time → effectively near-realtime).
 */
export function RecentActivityTicker({
  matchAddress,
  accent = '#E8001D',
  maxRows = 6,
}: RecentActivityTickerProps) {
  const [entries, setEntries] = useState<PositionEntry[]>([]);
  const { assetDecimals } = usePoolDecimals();
  const [nextId, setNextId] = useState(0);

  useWatchContractEvent({
    address: matchAddress,
    abi: footballPariMatchAbi,
    eventName: 'PositionTaken',
    chainId: chilizConfig.chainId,
    poll: true,
    onLogs(logs) {
      const additions: PositionEntry[] = [];
      let id = nextId;
      for (const log of logs) {
        // wagmi types `args` as Record<string, unknown> when the ABI item has
        // named args; force-narrow to the fields we know exist.
        const a = log.args as {
          marketId?: bigint;
          user?: Address;
          outcome?: bigint;
          stake?: bigint;
        };
        if (
          a.marketId === undefined ||
          a.user === undefined ||
          a.outcome === undefined ||
          a.stake === undefined
        ) {
          continue;
        }
        additions.push({
          id: id++,
          marketId: Number(a.marketId),
          user: a.user,
          outcome: Number(a.outcome),
          stake: a.stake,
          at: Date.now(),
        });
      }
      if (additions.length === 0) return;
      setNextId(id);
      setEntries((prev) => {
        // newest first, cap at maxRows
        const next = [...additions.reverse(), ...prev];
        return next.slice(0, maxRows);
      });
    },
  });

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: 'linear-gradient(180deg, #141414 0%, #0F0F0F 100%)',
        border: '1px solid #2A2A2A',
      }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: '#1E1E1E' }}
      >
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Radio size={12} style={{ color: accent }} />
        </motion.div>
        <span
          className="text-[12px] font-bold uppercase tracking-[0.12em]"
          style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Live activity
        </span>
        <div className="flex-1" />
        <span
          className="text-[10px] uppercase tracking-[0.1em]"
          style={{ color: '#555', fontFamily: "'Barlow', sans-serif" }}
        >
          {entries.length === 0 ? 'Waiting for bets…' : `${entries.length} recent`}
        </span>
      </div>

      <div className="min-h-[80px] py-1.5">
        <AnimatePresence initial={false}>
          {entries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 text-center text-[11px]"
              style={{ color: '#555', fontFamily: "'Barlow', sans-serif" }}
            >
              No bets yet. Place yours to break the seal.
            </motion.div>
          ) : (
            entries.map((e) => <ActivityRow key={e.id} entry={e} decimals={assetDecimals} accent={accent} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActivityRow({
  entry,
  decimals,
  accent,
}: {
  entry: PositionEntry;
  decimals: number | undefined;
  accent: string;
}) {
  const formatted =
    decimals !== undefined
      ? Number(formatUnits(entry.stake, decimals)).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '—';

  const shortAddr = `${entry.user.slice(0, 6)}…${entry.user.slice(-4)}`;
  const since = Math.max(0, Math.floor((Date.now() - entry.at) / 1000));
  const sinceLabel = since < 60 ? `${since}s ago` : `${Math.floor(since / 60)}m ago`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.96, background: `${accent}22` }}
      animate={{ opacity: 1, y: 0, scale: 1, background: 'rgba(0,0,0,0)' }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="flex items-center gap-2 px-4 py-1.5"
    >
      <span
        className="rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
        style={{
          background: `${accent}1F`,
          color: accent,
          border: `1px solid ${accent}55`,
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        M#{entry.marketId}
      </span>
      <span
        className="text-[11px]"
        style={{ color: '#888', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {shortAddr}
      </span>
      <span className="flex-1 text-[11px]" style={{ color: '#666', fontFamily: "'Barlow', sans-serif" }}>
        bet outcome {entry.outcome}
      </span>
      <span
        className="text-[11px] font-bold tabular-nums"
        style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {formatted}
      </span>
      <span className="text-[9px]" style={{ color: '#555', fontFamily: "'Barlow', sans-serif" }}>
        {sinceLabel}
      </span>
    </motion.div>
  );
}
