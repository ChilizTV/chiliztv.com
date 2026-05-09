"use client";

import type { ReactNode } from "react";

interface PillProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  border?: string;
}

export function Pill({
  children,
  color = "#fff",
  bg = "transparent",
  border = "#1E1E1E",
}: PillProps) {
  return (
    <span
      className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] tabular-nums"
      style={{ color, background: bg, borderColor: border }}
    >
      {children}
    </span>
  );
}
