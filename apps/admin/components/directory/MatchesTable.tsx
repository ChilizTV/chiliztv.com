'use client';

import { useState } from 'react';

import { useAdminMatches } from '@/hooks/api/useAdminMatches';
import type { AdminMatchSummaryDto } from '@/lib/api/endpoints/directory';
import { fmtUsdcRaw } from '@/lib/format/amounts';
import { Card } from '@/components/common/Card';
import { THead } from '@/components/common/THead';
import { TRow } from '@/components/common/TRow';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterChips } from '@/components/common/FilterChips';
import { Icon } from '@/components/common/Icon';
import { CopyButton } from '@/components/common/CopyButton';
import { WalletLabel } from '@/components/moderation/WalletLabel';
import { MatchStatusBadge } from './MatchStatusBadge';
import { MatchRowActions } from './MatchRowActions';
import { TeamLabel } from './TeamLabel';

const COLS = 'minmax(0,1.9fr) minmax(0,0.8fr) 54px 80px 150px 56px 90px 110px 130px';
const LIVE = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'SUSP', 'INT']);
const FINISHED = new Set(['FT', 'AET', 'PEN', 'CANC', 'ABD', 'AWD', 'WO']);

type MatchFilter = 'live' | 'upcoming' | 'finished' | 'all';

function bucket(status: string): Exclude<MatchFilter, 'all'> {
  if (LIVE.has(status)) return 'live';
  if (FINISHED.has(status)) return 'finished';
  return 'upcoming';
}

export function MatchesTable() {
  const { data, isLoading } = useAdminMatches();
  const [filter, setFilter] = useState<MatchFilter>('all');

  const all = data ?? [];
  const counts = {
    live: all.filter((m) => bucket(m.status) === 'live').length,
    upcoming: all.filter((m) => bucket(m.status) === 'upcoming').length,
    finished: all.filter((m) => bucket(m.status) === 'finished').length,
  };
  const rows: AdminMatchSummaryDto[] = filter === 'all' ? all : all.filter((m) => bucket(m.status) === filter);

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between">
        <FilterChips<MatchFilter>
          items={[
            { label: 'Live', value: 'live', count: counts.live },
            { label: 'Upcoming', value: 'upcoming', count: counts.upcoming },
            { label: 'Finished', value: 'finished', count: counts.finished },
            { label: 'All', value: 'all' },
          ]}
          active={filter}
          onSelect={setFilter}
        />
        <span className="font-mono-ctv text-[9px] uppercase tracking-[0.12em] text-white/30">
          Deploy &amp; close are two-step confirms
        </span>
      </div>

      <Card className="mt-4 overflow-hidden">
        <THead cols={COLS}>
          <span>Match</span>
          <span>League</span>
          <span>Score</span>
          <span>Status</span>
          <span>Contract</span>
          <span className="text-right">Bets</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Kickoff</span>
          <span className="text-right">Actions</span>
        </THead>

        {isLoading && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>
        )}
        {!isLoading && rows.length === 0 && (
          <EmptyState icon="activity" title="No matches for this filter" hint="Synced fixtures and their contracts appear here." />
        )}
        {rows.map((match) => (
          <TRow key={match.id} cols={COLS} accent={LIVE.has(match.status) ? '#E8001D' : undefined}>
            <span className="flex min-w-0 items-center gap-1.5">
              <TeamLabel name={match.homeTeamName} logo={match.homeTeamLogo} />
              <span className="shrink-0 text-white/30">vs</span>
              <TeamLabel name={match.awayTeamName} logo={match.awayTeamLogo} />
            </span>
            <span className="font-mono-ctv min-w-0 truncate text-[10px] uppercase tracking-[0.08em] text-white/45">
              {match.leagueName}
            </span>
            <span className="tabular-nums text-white/85">
              {match.score ? `${match.score.home}–${match.score.away}` : '—'}
            </span>
            <MatchStatusBadge status={match.status} />
            {match.bettingContractAddress ? (
              <span className="flex items-center gap-1">
                <WalletLabel wallet={match.bettingContractAddress} />
                <CopyButton value={match.bettingContractAddress} label="Copy contract address" />
              </span>
            ) : (
              <span className="font-mono-ctv flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FF1737]">
                <Icon n="alertCircle" s={11} />
                <span>Missing</span>
              </span>
            )}
            <span className="text-right tabular-nums text-white/85">{match.betCount || '—'}</span>
            <span className="text-right tabular-nums text-white/85">
              {match.totalStaked === '0' ? '—' : fmtUsdcRaw(match.totalStaked)}
            </span>
            <span className="font-mono-ctv text-right text-[11px] tabular-nums text-white/50">
              {new Date(match.matchDate).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
            <span className="text-right">
              <MatchRowActions match={match} />
            </span>
          </TRow>
        ))}
      </Card>
    </div>
  );
}
