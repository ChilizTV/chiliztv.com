'use client';

import Link from 'next/link';

import { useReports } from '@/hooks/api/useReports';
import { Card } from '@/components/common/Card';
import { CardHead } from '@/components/common/CardHead';
import { TRow } from '@/components/common/TRow';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { SeverityBadge } from '@/components/moderation/SeverityBadge';

const COLS = '48px minmax(0,1fr) 120px 70px 16px';

function age(createdAt: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60_000));
  if (mins < 60) return `${mins}m`;
  return `${Math.round(mins / 60)}h`;
}

/** Top open reports, severity first — the queue the API already sorts. */
export function AttentionQueueCard() {
  const { data, isLoading } = useReports({ status: 'open', cursor: null });
  const top = data?.items.slice(0, 4) ?? [];

  return (
    <Card>
      <CardHead
        title="Needs attention"
        count={isLoading ? undefined : (data?.items.length ?? 0)}
        right={
          <Link href="/moderation" className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.14em] text-white/40 hover:text-white">
            Open queue →
          </Link>
        }
      />
      {!isLoading && top.length === 0 && (
        <EmptyState icon="shieldCheck" title="Nothing needs review" hint="Open reports land here, sorted by severity." py="py-10" />
      )}
      {top.map((report) => (
        <Link key={report.id} href={`/moderation/reports/${report.id}`} className="block">
          <TRow cols={COLS} accent={report.severity >= 4 ? '#E8001D' : undefined} className="cursor-pointer">
            <SeverityBadge severity={report.severity} />
            <span className="min-w-0 truncate text-white/85">{report.reasonCode}</span>
            <span className="font-mono-ctv text-[10px] uppercase tracking-[0.12em] text-white/45">{report.targetType}</span>
            <span className="font-mono-ctv text-right text-[11px] tabular-nums text-white/45">{age(report.createdAt)}</span>
            <Icon n="chevronRight" s={12} className="text-white/25" />
          </TRow>
        </Link>
      ))}
    </Card>
  );
}
