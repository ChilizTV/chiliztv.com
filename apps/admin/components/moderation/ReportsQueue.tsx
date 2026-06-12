'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useReports } from '@/hooks/api/useReports';
import { useOverview } from '@/hooks/api/useOverview';
import type { ReportStatus } from '@/lib/api/endpoints/moderation';
import { Card } from '@/components/common/Card';
import { THead } from '@/components/common/THead';
import { TRow } from '@/components/common/TRow';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterChips } from '@/components/common/FilterChips';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { WalletLabel } from './WalletLabel';

const COLS = '64px minmax(0,1.5fr) 120px 150px 140px 140px';

export function ReportsQueue() {
  const [status, setStatus] = useState<ReportStatus | undefined>('open');
  const [cursor, setCursor] = useState<string | null>(null);
  const { data, isLoading } = useReports({ status, cursor });
  const { data: overview } = useOverview();

  const filters: Array<{ label: string; value: ReportStatus | undefined; count?: number }> = [
    { label: 'Open', value: 'open', count: overview?.openReports?.total },
    { label: 'Auto-actioned', value: 'auto_actioned' },
    { label: 'Dismissed', value: 'dismissed' },
    { label: 'Closed', value: 'closed' },
    { label: 'All', value: undefined },
  ];

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between">
        <FilterChips
          items={filters}
          active={status}
          onSelect={(value) => {
            setStatus(value);
            setCursor(null);
          }}
        />
        <span className="font-mono-ctv text-[9px] uppercase tracking-[0.12em] text-white/30">Severity first · newest</span>
      </div>

      <Card className="mt-4 overflow-hidden">
        <THead cols={COLS}>
          <span>Severity</span>
          <span>Reason</span>
          <span>Target</span>
          <span>Reporter</span>
          <span className="text-right">Created</span>
          <span>Status</span>
        </THead>

        {isLoading && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>
        )}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <EmptyState icon="shieldCheck" title="No reports for this filter" hint="Reports filed during lives land here, sorted by severity." />
        )}
        {data?.items.map((report) => (
          <Link key={report.id} href={`/moderation/reports/${report.id}`} className="block">
            <TRow cols={COLS} accent={report.severity >= 4 ? '#E8001D' : undefined} className="cursor-pointer">
              <SeverityBadge severity={report.severity} />
              <span className="min-w-0 truncate text-white/85">{report.reasonCode}</span>
              <span className="font-mono-ctv text-[10px] uppercase tracking-[0.12em] text-white/50">{report.targetType}</span>
              <WalletLabel wallet={report.reporterWallet} />
              <span className="font-mono-ctv text-right text-[11px] tabular-nums text-white/50">
                {new Date(report.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <StatusBadge status={report.status} />
            </TRow>
          </Link>
        ))}
      </Card>

      {data?.nextCursor && (
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono-ctv text-[10px] uppercase tracking-[0.12em] text-white/35">Keyset · 25 per page</span>
          <button
            type="button"
            onClick={() => setCursor(data.nextCursor)}
            className="font-mono-ctv rounded-md border border-[#2A2A2A] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/65 transition-colors hover:text-white"
          >
            Next page →
          </button>
        </div>
      )}
    </div>
  );
}
