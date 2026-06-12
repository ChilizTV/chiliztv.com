"use client";

import { Loader2 } from "lucide-react";

export function AdminLoadingScreen({ label }: Readonly<{ label: string }>) {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <div className="font-mono-ctv inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
        <Loader2 size={14} className="animate-spin text-[#E8001D]" />
        {label}
      </div>
    </main>
  );
}
