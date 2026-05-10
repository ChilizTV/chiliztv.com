"use client";

import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  dim?: boolean;
}

/**
 * Streamer-modal eyebrow — slimmer/quieter than the live-page eyebrow.
 * No leading bar; just tracked-out red (or muted) caps.
 */
export function Eyebrow({ children, dim = false }: EyebrowProps) {
  return (
    <div
      className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.2em]"
      style={{ color: dim ? "rgba(255,255,255,0.35)" : "#E8001D" }}
    >
      {children}
    </div>
  );
}
