'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useReportConfig, useUpdateReportConfig } from '@/hooks/api/useReportConfig';
import type { ReportConfigDto } from '@/lib/api/endpoints/moderation';
import { useAdminSession } from '@/providers/AdminSessionProvider';
import { isAllowedForNav } from '@/lib/rbac';

const FIELDS: Array<{ key: keyof ReportConfigDto; label: string; hint: string }> = [
  { key: 'quorumPct', label: 'Quorum %', hint: 'threshold = max(floor, ceil(eligible × pct))' },
  { key: 'floorCount', label: 'Floor count', hint: 'minimum distinct reports' },
  { key: 'minPresenceSec', label: 'Min presence (s)', hint: 'eligibility window in the live' },
  { key: 'banFirstHours', label: 'First ban (h)', hint: 'escalation step 1' },
  { key: 'banSecondHours', label: 'Second ban (h)', hint: 'escalation step 2 — then permanent' },
  { key: 'bypassSeverityThreshold', label: 'Bypass severity', hint: 'severity that skips the quorum' },
];

export function ConfigForm() {
  const { role } = useAdminSession();
  const canEdit = isAllowedForNav(role, ['admin']);
  const { data, isLoading } = useReportConfig();
  const update = useUpdateReportConfig();
  const [draft, setDraft] = useState<ReportConfigDto | null>(null);

  useEffect(() => {
    if (data && !draft) setDraft(data);
  }, [data, draft]);

  if (isLoading || !draft) {
    return <p className="font-mono-ctv mt-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(draft, {
      onSuccess: () => toast.success('Config updated — hot reload within 30s'),
      onError: () => toast.error('Update failed'),
    });
  };

  return (
    <form onSubmit={submit} className="mt-6 max-w-2xl rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ key, label, hint }) => (
          <label key={key} className="block">
            <span className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
              {label}
            </span>
            <input
              type="number"
              value={draft[key]}
              disabled={!canEdit}
              onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })}
              className="font-mono-ctv mt-1.5 w-full rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[13px] tabular-nums text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D] disabled:opacity-50"
            />
            <span className="font-mono-ctv mt-1 block text-[9px] uppercase tracking-[0.1em] text-white/30">
              {hint}
            </span>
          </label>
        ))}
      </div>

      {canEdit ? (
        <button
          type="submit"
          disabled={update.isPending}
          className="font-mono-ctv mt-5 rounded-md bg-[#E8001D] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[#FF1737] disabled:opacity-50"
        >
          {update.isPending ? 'Saving…' : 'Save config'}
        </button>
      ) : (
        <p className="font-mono-ctv mt-5 text-[10px] uppercase tracking-[0.12em] text-white/35">
          Read-only — config writes require the admin role.
        </p>
      )}
    </form>
  );
}
