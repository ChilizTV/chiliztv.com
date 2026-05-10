"use client";

import { type ReactNode } from "react";

interface FeeRowProps {
  label: ReactNode;
  value: ReactNode;
  accent?: boolean;
}

function FeeRow({ label, value, accent }: FeeRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#1A1A1A] py-2 last:border-0">
      <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
        {label}
      </span>
      <span
        className={`font-mono-ctv text-[12px] font-bold tabular-nums ${
          accent ? "text-white" : "text-white/85"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

interface FeeBreakdownProps {
  rows: Array<{ label: ReactNode; value: ReactNode; accent?: boolean }>;
}

/**
 * Card-shaped key/value list used to surface the fee math in donation +
 * subscription modals (you-send / platform-fee / streamer-receives).
 */
export function FeeBreakdown({ rows }: FeeBreakdownProps) {
  return (
    <div className="rounded-xl border border-[#1F1F1F] bg-[#0a0a0a] px-4 py-1">
      {rows.map((r, i) => (
        <FeeRow key={i} label={r.label} value={r.value} accent={r.accent} />
      ))}
    </div>
  );
}
