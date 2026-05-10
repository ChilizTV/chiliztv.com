"use client";

import { type ReactNode } from "react";

interface SettlementFooterProps {
  /** Main CTA label, e.g. "Donate $5 →" or "Subscribe · $15 →". */
  ctaLabel: ReactNode;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Lock-icon caption under the CTA. */
  note: string;
  /** Optional warning/error block rendered above the CTA. */
  alert?: ReactNode;
}

export function SettlementFooter({
  ctaLabel,
  onSubmit,
  disabled,
  loading,
  note,
  alert,
}: SettlementFooterProps) {
  return (
    <div className="mt-6 border-t border-[#1F1F1F] bg-[#0a0a0a] px-7 py-5">
      {alert}

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || loading}
        className="font-display w-full rounded-xl py-4 text-center uppercase tracking-[0.06em] transition-all disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: "#E8001D",
          color: "#fff",
          fontSize: 16,
          fontWeight: 800,
          boxShadow: disabled || loading ? "none" : "0 8px 24px -8px rgba(232,0,29,0.55)",
        }}
      >
        {ctaLabel}
      </button>

      <div className="font-mono-ctv mt-3 flex items-center justify-center gap-1.5 text-center text-[9px] uppercase tracking-[0.18em] text-white/35">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        {note}
      </div>
    </div>
  );
}
