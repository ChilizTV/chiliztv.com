'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReports } from '@/hooks/api/useReports';
import type { ReportStatus } from '@/lib/api/endpoints/moderation';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { WalletLabel } from './WalletLabel';

const STATUS_FILTERS: Array<{ label: string; value: ReportStatus | undefined }> = [
  { label: 'Open', value: 'open' },
  { label: 'Auto-actioned', value: 'auto_actioned' },
  { label: 'Dismissed', value: 'dismissed' },
  { label: 'Closed', value: 'closed' },
  { label: 'All', value: undefined },
];

const COLS = '70px minmax(0,1fr) 110px minmax(0,1.2fr) 130px 120px';

export function ReportsQueue() {
  const [status, setStatus] = useState<ReportStatus | undefined>('open');
  const [cursor, setCursor] = useState<string | null>(null);
  const { data, isLoading } = useReports({ status, cursor });

  return (
    <div className="mt-5">
      <div className="flex gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => {
              setStatus(f.value);
              setCursor(null);
            }}
            className={`font-mono-ctv rounded-md border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
              status === f.value
                ? 'border-[#E8001D] bg-[#E8001D]/10 text-white'
                : 'border-[#2A2A2A] text-white/55 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-[#1E1E1E] bg-[#111]">
        <div
          className="font-mono-ctv grid gap-3 border-b border-[#1E1E1E] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45"
          style={{ gridTemplateColumns: COLS }}
        >
          <span>Severity</span>
          <span>Reason</span>
          <span>Target</span>
          <span>Reporter</span>
          <span>Created</span>
          <span>Status</span>
        </div>

        {isLoading && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">
            Loading…
          </p>
        )}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">
            No reports for this filter.
          </p>
        )}
        {data?.items.map((report) => (
          <Link
            key={report.id}
            href={`/moderation/reports/${report.id}`}
            className="grid items-center gap-3 border-b border-[#1A1A1A] px-4 py-3 text-[13px] transition-colors last:border-b-0 hover:bg-white/[0.02]"
            style={{ gridTemplateColumns: COLS }}
          >
            <SeverityBadge severity={report.severity} />
            <span className="min-w-0 truncate text-white/85">{report.reasonCode}</span>
            <span className="font-mono-ctv text-[10px] uppercase tracking-[0.12em] text-white/55">
              {report.targetType}
            </span>
            <WalletLabel wallet={report.reporterWallet} />
            <span className="font-mono-ctv text-[11px] tabular-nums text-white/55">
              {new Date(report.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
            <StatusBadge status={report.status} />
          </Link>
        ))}
      </div>

      {data?.nextCursor && (
        <button
          type="button"
          onClick={() => setCursor(data.nextCursor)}
          className="font-mono-ctv mt-3 rounded-md border border-[#2A2A2A] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/65 hover:text-white"
        >
          Next page →
        </button>
      )}
    </div>
  );
}
