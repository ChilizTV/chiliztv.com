"use client";

import { useAdminSession } from "@/providers/AdminSessionProvider";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "#E8001D",
  admin: "#F5C518",
  moderator: "#2dd4a4",
  finance: "#0072CE",
};

export function TopBar() {
  const { wallet, role } = useAdminSession();
  const color = ROLE_COLORS[role] ?? "#fff";

  return (
    <header className="flex items-center justify-between border-b border-[#1E1E1E] px-6 py-3">
      <div className="font-display text-[18px] font-extrabold uppercase tracking-tight text-white">
        PredCast <span className="text-[#E8001D]">Admin</span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="font-mono-ctv rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color, background: `${color}14`, border: `1px solid ${color}40` }}
        >
          {role.replace("_", " ")}
        </span>
        <span className="font-mono-ctv text-[11px] tracking-[0.06em] text-white/55" title={wallet}>
          {wallet.slice(0, 6)}…{wallet.slice(-4)}
        </span>
      </div>
    </header>
  );
}
