'use client';

import { useEffect, useMemo, useState } from 'react';
import { useBrowseMatches } from '@/hooks/api/useBrowseMatches';
import {
  flattenMatches,
  getMinute,
  isLive,
  type FlatMatch,
  type LeagueDto,
} from '@/components/features/discover/domain';

const TICK_MS = 30_000;

const abbr = (name: string) =>
  name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase();

const fmtKickoff = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

const fmtOdds = (m: FlatMatch) =>
  m.odds
    ? `${(m.odds.home ?? 0).toFixed(2)} / ${(m.odds.draw ?? 0).toFixed(2)} / ${(m.odds.away ?? 0).toFixed(2)}`
    : '—';

function Item({ match, now }: { match: FlatMatch; now: Date | null }) {
  const live = isLive(match.status);
  const minuteValue = live ? getMinute(match.status, match.kickoffAt, now) : null;
  const minuteLabel = minuteValue !== null ? `${minuteValue}'` : 'LIVE';
  return (
    <span className="inline-flex items-center gap-3">
      {live ? (
        <span className="inline-flex items-center gap-1.5 font-bold text-[#E8001D]">
          <span className="ctv-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#E8001D]" />
          {minuteLabel}
        </span>
      ) : (
        <span className="text-white/45">{fmtKickoff(match.kickoffAt)}</span>
      )}
      <span className="font-bold text-white">
        {abbr(match.homeTeam.name)}{' '}
        <span className="font-bold text-[#E8001D]">
          {match.score ? `${match.score.home}-${match.score.away}` : 'vs'}
        </span>{' '}
        {abbr(match.awayTeam.name)}
      </span>
      <span className="text-[#2A2A2A]">·</span>
      <span>{fmtOdds(match)}</span>
      <span className="text-[#2A2A2A]">·</span>
      <span className="text-white/45">{match.leagueName}</span>
    </span>
  );
}

export function LiveTicker() {
  const { data, isLoading } = useBrowseMatches();
  const [now, setNow] = useState<Date | null>(null);

  // Tick `now` so the live-minute label refreshes without remounting.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const leagues = useMemo<LeagueDto[]>(() => data?.leagues ?? [], [data]);
  const allMatches = useMemo(() => flattenMatches(leagues), [leagues]);

  // Live first, then upcoming by kickoff, then everything else. Show ALL
  // matches regardless of status (the user wants the full feed, not a curated subset).
  const items = useMemo(() => {
    const live = allMatches.filter((m) => isLive(m.status));
    const upcoming = allMatches
      .filter((m) => m.status === 'NS')
      .sort(
        (a, b) =>
          new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
      );
    const liveIds = new Set(live.map((m) => m.id));
    const upcomingIds = new Set(upcoming.map((m) => m.id));
    const rest = allMatches.filter(
      (m) => !liveIds.has(m.id) && !upcomingIds.has(m.id),
    );
    return [...live, ...upcoming, ...rest];
  }, [allMatches]);

  // Keep the bar visible while loading / when empty so the page chrome
  // doesn't reflow on hydrate.
  if (items.length === 0) {
    return (
      <div
        className="relative z-[4] overflow-hidden border-y border-[#1E1E1E] bg-[#111] py-[14px]"
        aria-label="Live matches ticker"
      >
        <div className="font-mono-ctv text-center text-[12px] uppercase tracking-[0.18em] text-white/45">
          {isLoading ? 'Loading matches…' : 'No matches right now — check back soon.'}
        </div>
      </div>
    );
  }

  // Duplicate so the CSS keyframe seamlessly translates by -50%.
  const loop = [...items, ...items];

  return (
    <div
      className="relative z-[4] overflow-hidden border-y border-[#1E1E1E] bg-[#111] py-[14px]"
      style={{
        maskImage:
          'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage:
          'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
      }}
      aria-label="Live matches ticker"
    >
      <div
        className="ctv-marquee font-mono-ctv flex gap-12 whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.06em] text-white/65"
        role="marquee"
      >
        {loop.map((m, i) => (
          <Item key={`${m.id}-${i}`} match={m} now={now} />
        ))}
      </div>
    </div>
  );
}
