"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

/**
 * Bottom sheet wrapper used on mobile (`lg:hidden`) to host the live ChatPanel.
 * Slides up from the bottom, capped at ~60dvh so the video remains visible.
 */
export function MobileChatBottomSheet({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 lg:hidden"
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Live chat"
        className={`pointer-events-auto flex flex-col overflow-hidden rounded-t-2xl border-t border-[#1E1E1E] bg-[#0d0d0d] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: "60dvh", maxHeight: "60dvh" }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-[#2A2A2A]"
        />

        <header className="flex items-center justify-between border-b border-[#1E1E1E] bg-[#111] px-4 pt-5 pb-3">
          <span className="font-mono-ctv inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
            <span
              aria-hidden
              className="block h-1.5 w-1.5 rounded-full bg-[#E8001D]"
              style={{ boxShadow: "0 0 6px #E8001D" }}
            />
            Live chat
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#1E1E1E] bg-[#0d0d0d] text-white/55 transition-colors hover:border-[#3A3A3A] hover:text-white"
          >
            <X size={14} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
