'use client';

import { AlertTriangle, Flag, ShieldAlert } from 'lucide-react';

import type { ReportReasonCode } from '@chiliztv/shared';

import { REASON_LABELS, groupForReason, isSevere } from './domain/reasonGroups';

interface ConfirmStepProps {
  reason: ReportReasonCode;
  freeText: string;
  onFreeTextChange: (value: string) => void;
}

export function ConfirmStep({ reason, freeText, onFreeTextChange }: ConfirmStepProps) {
  const severe = isSevere(reason);
  const group = groupForReason(reason);

  return (
    <div className="flex flex-col gap-4">
      {/* selected reason summary */}
      <div className="flex items-center justify-between rounded-lg border border-[#1E1E1E] bg-[#0d0d0d] px-3.5 py-3">
        <span className="flex flex-col">
          <span className="font-mono-ctv text-[8.5px] font-bold uppercase tracking-[0.16em] text-white/35">
            {group?.title}
          </span>
          <span className="mt-1 text-[14px] font-medium leading-none text-white">
            {REASON_LABELS[reason]}
          </span>
        </span>
        {severe ? (
          <span className="text-[#E8001D]">
            <ShieldAlert size={18} />
          </span>
        ) : (
          <span className="text-white/25">
            <Flag size={16} />
          </span>
        )}
      </div>

      {/* consequence mention — gold attention state, severity ≥ 4 only */}
      {severe && (
        <div
          className="flex items-start gap-2.5 rounded-lg px-3.5 py-3"
          style={{ border: '1px solid rgba(245,197,24,0.32)', background: 'rgba(245,197,24,0.06)' }}
        >
          <span className="mt-px text-[#F5C518]">
            <AlertTriangle size={16} />
          </span>
          <span className="text-[12px] leading-snug text-[#F5C518]/90">
            <b className="font-semibold text-[#F5C518]">Immediate action possible.</b> Content
            matching this reason can be reviewed and removed right away, before the usual
            community threshold.
          </span>
        </div>
      )}

      {/* optional details */}
      <div>
        <label className="font-mono-ctv mb-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
          <span>Add details · optional</span>
          <span className={freeText.length > 460 ? 'text-[#F5C518]' : 'text-white/30'}>
            {freeText.length}/500
          </span>
        </label>
        <textarea
          value={freeText}
          onChange={(e) => onFreeTextChange(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="What should a moderator know?"
          className="font-mono-ctv w-full resize-none rounded-lg border border-[#2A2A2A] bg-[#0d0d0d] px-3.5 py-3 text-[12px] leading-relaxed text-white placeholder-white/30 outline-none transition-colors focus:border-[#E8001D]"
        />
      </div>
    </div>
  );
}
