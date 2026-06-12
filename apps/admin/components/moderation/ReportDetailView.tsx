'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useReportDetail, useReviewReport, useReverseAction } from '@/hooks/api/useReports';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { WalletLabel } from './WalletLabel';

function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div>
      <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">{label}</div>
      <div className="mt-1 text-[13px] text-white/85">{children}</div>
    </div>
  );
}

export function ReportDetailView({ id }: Readonly<{ id: string }>) {
  const { data, isLoading } = useReportDetail(id);
  const review = useReviewReport(id);
  const reverse = useReverseAction();
  const [note, setNote] = useState('');

  if (isLoading) {
    return <p className="font-mono-ctv mt-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>;
  }
  if (!data) {
    return <p className="font-mono-ctv mt-6 text-[11px] uppercase tracking-[0.14em] text-[#FF1737]">Report not found.</p>;
  }

  const { report, triggeredAction } = data;
  const reviewable = report.status === 'open';

  const act = (verdict: 'dismiss' | 'close') => {
    review.mutate(
      { verdict, note: note || undefined },
      {
        onSuccess: () => toast.success(verdict === 'dismiss' ? 'Report dismissed' : 'Report closed'),
        onError: () => toast.error('Review failed — the report may already be handled'),
      },
    );
  };

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
        <div className="flex items-center gap-3">
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Reason">{report.reasonCode}</Field>
          {report.reasonFreeText && <Field label="Free text">{report.reasonFreeText}</Field>}
          <Field label="Target">
            <span className="font-mono-ctv text-[11px] uppercase tracking-[0.12em]">{report.targetType}</span>{' '}
            <span className="font-mono-ctv text-[11px] text-white/55">{report.targetId}</span>
          </Field>
          <Field label="Reporter"><WalletLabel wallet={report.reporterWallet} /></Field>
          <Field label="Created">{new Date(report.createdAt).toLocaleString('en-GB')}</Field>
          {report.reviewedAt && (
            <Field label="Reviewed">
              {new Date(report.reviewedAt).toLocaleString('en-GB')} by{' '}
              {report.reviewedByWallet && <WalletLabel wallet={report.reviewedByWallet} />}
              {report.reviewNote && <span className="text-white/55"> — {report.reviewNote}</span>}
            </Field>
          )}
        </div>

        {reviewable && (
          <div className="mt-6 border-t border-[#1E1E1E] pt-4">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Review note (optional)"
              className="font-mono-ctv w-full rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[12px] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={review.isPending}
                onClick={() => act('dismiss')}
                className="font-mono-ctv rounded-md border border-[#2A2A2A] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/65 hover:text-white disabled:opacity-50"
              >
                Dismiss
              </button>
              <button
                type="button"
                disabled={review.isPending}
                onClick={() => act('close')}
                className="font-mono-ctv rounded-md bg-[#E8001D] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[#FF1737] disabled:opacity-50"
              >
                Close as handled
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
        <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
          Triggered action
        </div>
        {!triggeredAction && (
          <p className="mt-3 text-[12px] font-light text-white/45">
            No automatic action fired for this report.
          </p>
        )}
        {triggeredAction && (
          <div className="mt-4 grid gap-4">
            <Field label="Kind">
              <span className="font-mono-ctv text-[11px] uppercase tracking-[0.12em]">{triggeredAction.kind}</span>
            </Field>
            <Field label="Trigger">
              <span className="font-mono-ctv text-[11px] uppercase tracking-[0.12em]">
                {triggeredAction.quorumSnapshot.trigger}
              </span>
            </Field>
            <Field label="Triggered at">{new Date(triggeredAction.triggeredAt).toLocaleString('en-GB')}</Field>
            {triggeredAction.reversedAt ? (
              <Field label="Reversed">
                {new Date(triggeredAction.reversedAt).toLocaleString('en-GB')}
                {triggeredAction.reversedByWallet && (
                  <> by <WalletLabel wallet={triggeredAction.reversedByWallet} /></>
                )}
              </Field>
            ) : (
              <button
                type="button"
                disabled={reverse.isPending}
                onClick={() =>
                  reverse.mutate(
                    { actionId: triggeredAction.id },
                    {
                      onSuccess: () => toast.success('Action reversed'),
                      onError: () => toast.error('Reverse failed — already reversed?'),
                    },
                  )
                }
                className="font-mono-ctv w-fit rounded-md border border-[#E8001D]/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#FF1737] hover:bg-[#E8001D]/10 disabled:opacity-50"
              >
                Reverse action
                {triggeredAction.kind === 'soft_delete_message' ? ' (restores message)' : ''}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
