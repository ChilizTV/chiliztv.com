"use client";

import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  color?: string;
  dim?: boolean;
}

export function Eyebrow({ children, color = "#E8001D", dim = false }: EyebrowProps) {
  const c = dim ? "rgba(255,255,255,0.45)" : color;
  return (
    <div
      className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em]"
      style={{ color: c }}
    >
      <span aria-hidden className="block h-0.5 w-4" style={{ background: c }} />
      {children}
    </div>
  );
}
