'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import type { Address } from 'viem';

import { usePariMatch } from '@/hooks/usePariMatch';
import { PariMarketCard, type PariMarketSelection } from './PariMarketCard';
import { PariBetDialog } from './PariBetDialog';
import { RecentActivityTicker } from './RecentActivityTicker';

interface PariMarketsListProps {
  matchAddress: Address | undefined;
  walletAddress?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

/**
 * The full pari-mutuel betting panel:
 *   - one `PariMarketCard` per market on the match
 *   - a `PariBetDialog` that opens on any outcome click
 *   - a `RecentActivityTicker` showing live `PositionTaken` events
 *
 * Reads market count from `marketCount()` on the match proxy. Each market
 * card pulls its own metadata + outcome pools via wagmi hooks bound to a
 * 5-second refetch interval.
 */
export function PariMarketsList({
  matchAddress,
  walletAddress,
  homeTeam,
  awayTeam,
  homeTeamLogo,
  awayTeamLogo,
}: PariMarketsListProps) {
  const { matchName, marketCount, feeBps } = usePariMatch(matchAddress);
  const [selection, setSelection] = useState<PariMarketSelection | null>(null);

  if (!matchAddress) {
    return <Placeholder text="No pari-mutuel contract bound to this match yet." />;
  }

  if (marketCount === 0) {
    return (
      <div className="space-y-3">
        <Header matchName={matchName} marketCount={0} feeBps={feeBps} />
        <Placeholder text="No markets opened on this match yet. Use the admin console to add the first one." />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Header matchName={matchName} marketCount={marketCount} feeBps={feeBps} />

      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {Array.from({ length: marketCount }, (_, i) => (
            <PariMarketCard
              key={i}
              matchAddress={matchAddress}
              marketId={i}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              onSelectOutcome={setSelection}
            />
          ))}
        </div>
      </AnimatePresence>

      <RecentActivityTicker matchAddress={matchAddress} />

      <PariBetDialog
        open={!!selection}
        onClose={() => setSelection(null)}
        matchAddress={matchAddress}
        walletAddress={walletAddress}
        selection={selection}
        homeTeamLogo={homeTeamLogo}
        awayTeamLogo={awayTeamLogo}
        feeBps={feeBps}
      />
    </div>
  );
}

function Header({
  matchName,
  marketCount,
  feeBps,
}: {
  matchName: string;
  marketCount: number;
  feeBps: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-lg px-3 py-2"
      style={{
        background: 'linear-gradient(90deg, rgba(232,0,29,0.08) 0%, rgba(0,0,0,0) 70%)',
        border: '1px solid #1E1E1E',
      }}
    >
      <Layers size={14} style={{ color: '#E8001D' }} />
      <span
        className="text-[12px] font-bold uppercase tracking-[0.12em]"
        style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        Markets
      </span>
      <span
        className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em]"
        style={{
          background: '#141414',
          color: '#888',
          border: '1px solid #2A2A2A',
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {marketCount}
      </span>
      <div className="flex-1" />
      <span
        className="truncate text-[11px]"
        style={{ color: '#666', fontFamily: "'Barlow', sans-serif" }}
        title={matchName}
      >
        {matchName || '—'}
      </span>
      <span
        className="text-[10px] uppercase tracking-[0.1em]"
        style={{ color: '#555', fontFamily: "'Barlow', sans-serif" }}
      >
        Fee {(feeBps / 100).toFixed(2)}%
      </span>
    </motion.div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div
      className="px-4 py-8 text-center text-[12px]"
      style={{
        background: '#0F0F0F',
        border: '1px dashed #2A2A2A',
        borderRadius: 12,
        color: '#666',
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      {text}
    </div>
  );
}
