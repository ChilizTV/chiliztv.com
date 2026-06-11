'use client';

import { Check } from 'lucide-react';

import type { ReportReasonCode } from '@chiliztv/shared';

import { REASON_LABELS, REASON_HINTS } from './domain/reasonGroups';

interface ReasonRowProps {
  code: ReportReasonCode;
  active: boolean;
  severe: boolean;
  onSelect: (code: ReportReasonCode) => void;
}

export function ReasonRow({ code, active, severe, onSelect }: ReasonRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onSelect(code)}
      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
      style={{
        border: `1px solid ${active ? '#E8001D' : '#1E1E1E'}`,
        background: active ? 'rgba(232,0,29,0.09)' : '#0d0d0d',
      }}
    >
      <span
        className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border transition-colors"
        style={{
          borderColor: active ? '#E8001D' : severe ? 'rgba(232,0,29,0.5)' : '#3A3A3A',
          background: active ? '#E8001D' : 'transparent',
        }}
      >
        {active && <span className="block h-[7px] w-[7px] rounded-full bg-white" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[13.5px] font-medium leading-none text-white/90">
            {REASON_LABELS[code]}
          </span>
          {severe && (
            <span className="font-mono-ctv text-[8px] font-bold uppercase tracking-[0.14em] text-[#E8001D]">
              ★
            </span>
          )}
        </span>
        <span className="mt-1 block truncate text-[11px] leading-none text-white/40">
          {REASON_HINTS[code]}
        </span>
      </span>
      <span aria-hidden className="text-white/0 transition-colors group-hover:text-white/25">
        <Check size={15} />
      </span>
    </button>
  );
}
