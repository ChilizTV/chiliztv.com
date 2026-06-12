'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useOverview } from '@/hooks/api/useOverview';
import { useAdminSession } from '@/providers/AdminSessionProvider';
import { isAllowedForNav } from '@/lib/rbac';
import { fmtUsdcCompact } from '@/lib/format/amounts';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatTile } from '@/components/common/StatTile';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { LiveMatchCard } from './LiveMatchCard';
import { AttentionQueueCard } from './AttentionQueueCard';
import { ActivityFeedCard } from './ActivityFeedCard';

const DIM = 'rgba(255,255,255,0.35)';

export function DashboardView() {
  const { role } = useAdminSession();
  const { data, isLoading } = useOverview();
  // Hydration safety — null on first paint, real clock after mount (CLAUDE.md §7.4).
  const [now, setNow] = useState<Date | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNow(new Date()), []);

  const canModeration = isAllowedForNav(role, ['moderator']);
  const canMarkets = isAllowedForNav(role, ['admin']);

  const reports = data?.openReports ?? null;
  const bans = data?.activeBans ?? null;
  const liveNow = data?.liveNow ?? [];
  const nextKickoff = data?.nextKickoffAt ? new Date(data.nextKickoffAt) : null;

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Match day"
        right={
          <span className="font-mono-ctv text-[10px] uppercase tracking-[0.14em] text-white/35">
            {now
              ? now.toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
              : '—'}
          </span>
        }
      />

      <div className="mt-5 grid grid-cols-4 gap-3">
        <StatTile
          label="Open reports"
          value={reports ? String(reports.total) : '—'}
          icon="flag"
          tone={reports && reports.total > 0 ? '#F5C518' : DIM}
          sub={
            reports
              ? reports.highSeverity > 0
                ? `${reports.highSeverity} high severity · S4+`
                : 'Queue is clear'
              : 'Moderator scope'
          }
          subTone={reports && reports.highSeverity > 0 ? '#F5C518' : DIM}
        />
        <StatTile
          label="Active bans"
          value={bans ? String(bans.total) : '—'}
          icon="ban"
          tone={bans && bans.total > 0 ? '#fff' : DIM}
          sub={bans ? (bans.permanent > 0 ? `${bans.permanent} permanent` : 'No permanent ban') : 'Moderator scope'}
        />
        <StatTile
          label="Live matches"
          value={String(data?.liveCount ?? 0)}
          live={(data?.liveCount ?? 0) > 0}
          icon="activity"
          tone={(data?.liveCount ?? 0) > 0 ? '#FF1737' : DIM}
          sub={
            (data?.liveCount ?? 0) > 0
              ? 'In play right now'
              : nextKickoff
                ? `Next kickoff ${nextKickoff.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                : 'No upcoming match synced'
          }
        />
        <StatTile
          label="24h volume"
          value={data ? fmtUsdcCompact(data.volume24h) : '—'}
          icon="chart"
          tone={data && Number(data.volume24h) > 0 ? '#fff' : DIM}
          sub="USDC · staked last 24h"
        />
      </div>

      {liveNow.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {liveNow.slice(0, 4).map((match) => (
            <LiveMatchCard key={match.id} match={match} canMarkets={canMarkets} />
          ))}
        </div>
      ) : (
        !isLoading && (
          <Card className="mt-3">
            <EmptyState
              icon="activity"
              title="No live matches right now"
              hint={
                nextKickoff
                  ? `Next kickoff at ${nextKickoff.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}. Markets can be deployed ahead of kickoff.`
                  : 'Synced matches appear here as soon as they go live.'
              }
              action={
                canMarkets ? (
                  <Link
                    href="/markets"
                    className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md border border-[#2A2A2A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65 transition-colors hover:border-[#3A3A3A] hover:text-white"
                  >
                    View markets
                  </Link>
                ) : undefined
              }
              py="py-10"
            />
          </Card>
        )
      )}

      <div className="mt-3 grid grid-cols-[1.25fr_1fr] gap-3">
        {canModeration && <AttentionQueueCard />}
        {data?.recentActivity != null && <ActivityFeedCard activity={data.recentActivity} />}
      </div>
    </div>
  );
}
