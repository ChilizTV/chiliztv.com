"use client";

import { type ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface StreamerModalHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  onClose: () => void;
  /** Accent color for the corner halo (default red). */
  accent?: string;
}

/**
 * Header band of the streamer modals — eyebrow + display title + optional
 * sub-line. Includes a corner halo gradient and the ✕ close button.
 */
export function StreamerModalHeader({
  eyebrow,
  title,
  sub,
  onClose,
  accent = "#E8001D",
}: StreamerModalHeaderProps) {
  return (
    <div className="relative px-7 pb-5 pt-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full"
        style={{ background: `radial-gradient(circle, ${accent}25, transparent 65%)` }}
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-white/55 transition-colors hover:bg-white/5 hover:text-white"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        className="font-display mt-3 leading-[0.95] tracking-[-0.015em] text-white"
        style={{ fontSize: 30, fontWeight: 800, textTransform: "uppercase" }}
      >
        {title}
      </h2>
      {sub && (
        <p className="mt-2 text-[13px] font-light leading-[1.5] text-white/55">{sub}</p>
      )}
    </div>
  );
}
