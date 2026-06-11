'use client';

import { ShieldAlert } from 'lucide-react';

import type { ReportReasonCode } from '@chiliztv/shared';

import { isSevere, type ReasonGroupDef } from './domain/reasonGroups';
import { ReasonRow } from './ReasonRow';

interface ReasonGroupProps {
  group: ReasonGroupDef;
  reason: ReportReasonCode | null;
  onSelect: (code: ReportReasonCode) => void;
}

export function ReasonGroup({ group, reason, onSelect }: ReasonGroupProps) {
  const severe = group.tone === 'severe';
  return (
    <section
      className="rounded-xl p-2.5"
      style={
        severe
          ? { border: '1px solid rgba(232,0,29,0.28)', background: 'rgba(232,0,29,0.035)' }
          : { border: '1px solid #161616', background: 'transparent' }
      }
    >
      <header className="flex items-center justify-between px-1.5 pb-2 pt-1">
        <span className="flex items-center gap-2">
          {severe && (
            <span className="text-[#E8001D]">
              <ShieldAlert size={13} strokeWidth={2.2} />
            </span>
          )}
          <span
            className="font-display text-[14px] font-extrabold uppercase tracking-[0.01em]"
            style={{ color: severe ? '#fff' : 'rgba(255,255,255,0.82)' }}
          >
            {group.title}
          </span>
        </span>
        <span
          className="font-mono-ctv text-[8.5px] font-bold uppercase tracking-[0.16em]"
          style={{ color: severe ? 'rgba(232,0,29,0.85)' : 'rgba(255,255,255,0.32)' }}
        >
          {group.caption}
        </span>
      </header>
      <div className="flex flex-col gap-1.5">
        {group.codes.map((code) => (
          <ReasonRow
            key={code}
            code={code}
            active={reason === code}
            severe={isSevere(code)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
