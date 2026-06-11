'use client';

import { X } from 'lucide-react';
import { DialogTitle } from '@chiliztv/ui';

import type { ReportTargetType } from '@chiliztv/shared';

interface ReportDialogHeaderProps {
  step: 0 | 1;
  targetType: ReportTargetType;
  onClose: () => void;
}

export function ReportDialogHeader({ step, targetType, onClose }: ReportDialogHeaderProps) {
  return (
    <header className="relative flex items-start justify-between gap-4 border-b border-[#1E1E1E] bg-[#111] px-5 py-4">
      <span
        aria-hidden
        className="absolute left-0 top-0 h-[2px] w-full"
        style={{ background: 'linear-gradient(90deg,#E8001D 0%, transparent 55%)' }}
      />
      <div className="flex flex-col gap-2.5">
        <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
          <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
          Report {targetType}
        </div>
        <DialogTitle asChild>
          <h2 className="font-display m-0 text-[22px] font-extrabold uppercase leading-[0.95] tracking-[-0.01em] text-white">
            {step === 0 ? "What's happening?" : 'Review & confirm'}
          </h2>
        </DialogTitle>
      </div>
      <div className="flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#1E1E1E] bg-[#0d0d0d] text-white/55 transition-colors hover:border-[#3A3A3A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
        >
          <X size={14} />
        </button>
        <div className="flex items-center gap-1.5" aria-hidden>
          {[0, 1].map((i) => (
            <span
              key={i}
              className="h-[3px] w-7 rounded-full transition-colors duration-300"
              style={{ background: i <= step ? '#E8001D' : '#2A2A2A' }}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
