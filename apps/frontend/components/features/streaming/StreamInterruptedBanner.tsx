"use client";

import { AlertTriangle, RotateCcw, X } from "lucide-react";

interface StreamInterruptedBannerProps {
  readonly onRestart: () => void;
  readonly onDismiss: () => void;
}

/**
 * Shown when a browser stream dropped without an explicit "End" click —
 * tab kill, network loss, browser crash. OBS streams never reach this
 * affordance (cf. D5 + `wasInterrupted` policy).
 */
export function StreamInterruptedBanner({ onRestart, onDismiss }: StreamInterruptedBannerProps) {
  return (
    <div
      role="alert"
      className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-xl border px-5 py-4"
      style={{
        borderColor: "rgba(232,0,29,0.45)",
        background: "linear-gradient(90deg, rgba(232,0,29,0.12) 0%, rgba(232,0,29,0.03) 60%, transparent 100%)",
      }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #E8001D, transparent)" }} />
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-[2px] shrink-0 text-[#E8001D]" aria-hidden />
        <div>
          <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8001D]">
            Stream interrupted
          </div>
          <div className="font-display mt-1 text-[15px] font-bold uppercase leading-tight tracking-[-0.005em] text-white">
            Your browser feed dropped before you ended it.
          </div>
          <div className="font-mono-ctv mt-1 text-[10px] uppercase tracking-[0.14em] text-white/55">
            Network loss, tab closed, or browser crash. Restart to go live again.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRestart}
          className="font-mono-ctv inline-flex items-center gap-2 rounded-md bg-[#E8001D] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
          style={{ boxShadow: "0 8px 24px rgba(232,0,29,0.25)" }}
        >
          <RotateCcw size={11} />
          Restart stream
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#2A2A2A] text-white/65 transition-colors hover:border-[#3A3A3A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
