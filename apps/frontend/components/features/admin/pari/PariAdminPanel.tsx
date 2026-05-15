'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';
import { motion } from 'framer-motion';
import { RefreshCw, ExternalLink } from 'lucide-react';

import { usePariMatchFactory } from '@/hooks/usePariMatchFactory';
import { usePariMatch } from '@/hooks/usePariMatch';
import { explorerAddress } from '@/lib/explorer';
import { CreateMatchForm } from './CreateMatchForm';
import { MatchMarketAdminPanel } from './MatchMarketAdminPanel';

/**
 * Top-level admin console for the pari-mutuel system:
 *   - CreateMatchForm  : deploy + wire a new match in one click.
 *   - Match selector   : pick any existing match from `factory.getAllMatches()`.
 *                        Defaults to the latest (matches what /live/999999 binds to).
 *   - MatchMarketAdminPanel : list + add + lifecycle markets on the selected match.
 *
 * No backend; everything is direct wagmi reads + writes against the
 * deployed PariMatchFactory at chilizConfig.pariMatchFactory.
 */
export function PariAdminPanel() {
  const { factoryAddress, allMatches, latestMatch, loadingMatches, refetch } =
    usePariMatchFactory();

  const [selected, setSelected] = useState<Address | undefined>(undefined);

  // Default to the latest match whenever the list refreshes.
  useEffect(() => {
    if (latestMatch && !selected) setSelected(latestMatch);
  }, [latestMatch, selected]);

  const matchOptions = useMemo(() => allMatches ?? [], [allMatches]);

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      {/* Page heading */}
      <header className="flex items-center gap-3">
        <h1
          className="text-[22px] font-bold uppercase tracking-[0.08em]"
          style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Pari-mutuel admin
        </h1>
        <div className="flex-1" />
        <a
          href={explorerAddress(factoryAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px]"
          style={{ color: '#888', fontFamily: "'JetBrains Mono', monospace" }}
        >
          factory {factoryAddress.slice(0, 6)}…{factoryAddress.slice(-4)}
          <ExternalLink size={11} />
        </a>
      </header>

      {/* Create match */}
      <CreateMatchForm onMatchCreated={() => refetch()} />

      {/* Match selector */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl"
        style={{
          background: '#0F0F0F',
          border: '1px solid #2A2A2A',
        }}
      >
        <div className="flex items-center gap-2 px-5 py-3">
          <h2
            className="text-[12px] font-bold uppercase tracking-[0.12em]"
            style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Existing matches
          </h2>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
            style={{
              background: '#1A1A1A',
              color: '#888',
              border: '1px solid #2A2A2A',
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            {matchOptions.length}
          </span>
          <div className="flex-1" />
          <button
            onClick={() => refetch()}
            disabled={loadingMatches}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{
              background: '#1A1A1A',
              color: '#888',
              border: '1px solid #2A2A2A',
              cursor: loadingMatches ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={11} />
            Refresh
          </button>
        </div>

        <div className="px-5 pb-4">
          {matchOptions.length === 0 ? (
            <div
              className="rounded py-6 text-center text-[11px]"
              style={{ color: '#555', border: '1px dashed #2A2A2A', background: '#0A0A0A' }}
            >
              No matches deployed yet. Use the form above.
            </div>
          ) : (
            <div className="space-y-1.5">
              {matchOptions.map((addr) => (
                <MatchListItem
                  key={addr}
                  address={addr}
                  selected={selected?.toLowerCase() === addr.toLowerCase()}
                  isLatest={latestMatch?.toLowerCase() === addr.toLowerCase()}
                  onClick={() => setSelected(addr)}
                />
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* Per-match admin */}
      {selected && <MatchMarketAdminPanel matchAddress={selected} />}
    </div>
  );
}

function MatchListItem({
  address,
  selected,
  isLatest,
  onClick,
}: {
  address: Address;
  selected: boolean;
  isLatest: boolean;
  onClick: () => void;
}) {
  // Each item fetches its own name; cheap since wagmi caches the call.
  const { matchName, marketCount, sportType } = usePariMatch(address);
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left"
      style={{
        background: selected ? 'rgba(232,0,29,0.08)' : '#141414',
        border: `1px solid ${selected ? '#E8001D' : '#1E1E1E'}`,
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="truncate text-[12px] font-bold uppercase tracking-[0.04em]"
            style={{
              color: selected ? '#fff' : '#ccc',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            {matchName || 'Unnamed match'}
          </span>
          {isLatest && (
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
              style={{
                background: 'rgba(0,200,83,0.12)',
                color: '#00C853',
                border: '1px solid rgba(0,200,83,0.3)',
                fontFamily: "'Barlow', sans-serif",
              }}
            >
              latest
            </span>
          )}
        </div>
        <div
          className="mt-0.5 flex items-center gap-2 text-[10px]"
          style={{ color: '#666', fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span>{address.slice(0, 8)}…{address.slice(-6)}</span>
          <span style={{ color: '#444' }}>·</span>
          <span>{sportType || '—'}</span>
          <span style={{ color: '#444' }}>·</span>
          <span>{marketCount} market{marketCount === 1 ? '' : 's'}</span>
        </div>
      </div>
    </button>
  );
}
