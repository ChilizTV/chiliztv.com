"use client";

import { usePathname } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

import { useAdminSession } from "@/providers/AdminSessionProvider";
import { clearAdminToken } from "@/lib/api/auth";
import { breadcrumbFor } from "@/lib/breadcrumb";
import { useOverview } from "@/hooks/api/useOverview";
import { Icon } from "@/components/common/Icon";
import { LiveDot } from "@/components/common/LiveDot";
import { CopyButton } from "@/components/common/CopyButton";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "#E8001D",
  admin: "#F5C518",
  moderator: "#2dd4a4",
  finance: "#0072CE",
};

export function TopBar() {
  const { wallet, role } = useAdminSession();
  const { handleLogOut } = useDynamicContext();
  const pathname = usePathname();
  const { data: overview } = useOverview();

  const { section, page } = breadcrumbFor(pathname);
  const live = overview?.liveCount ?? 0;
  const color = ROLE_COLORS[role] ?? "#fff";

  // The guard's effect sees the wallet disappear and falls back to the
  // connect screen; the JWT is cleared so the next wallet re-signs.
  const disconnect = () => {
    clearAdminToken();
    void handleLogOut().catch(() => undefined);
  };

  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-[#1E1E1E] px-6">
      <div className="font-mono-ctv flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
        <span className="text-white/30">{section}</span>
        <Icon n="chevronRight" s={10} className="text-white/20" />
        <span className="text-white/80">{page}</span>
      </div>
      <div className="flex items-center gap-3">
        {live > 0 && (
          <span className="font-mono-ctv flex items-center gap-2 rounded-md border border-[#E8001D]/40 bg-[#E8001D]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF1737]">
            <LiveDot />
            <span>{live} live</span>
          </span>
        )}
        <span
          className="font-mono-ctv rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color, background: `${color}14`, border: `1px solid ${color}40` }}
        >
          {role.replace("_", " ")}
        </span>
        <span className="flex items-center gap-1">
          <span className="font-mono-ctv text-[11px] tracking-[0.06em] text-white/55" title={wallet}>
            {wallet.slice(0, 6)}…{wallet.slice(-4)}
          </span>
          <CopyButton value={wallet} label="Copy wallet address" />
        </span>
        <span aria-hidden="true" className="h-4 w-px bg-[#1E1E1E]" />
        <button
          type="button"
          onClick={disconnect}
          className="font-mono-ctv flex items-center gap-1.5 rounded-md border border-[#2A2A2A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65 transition-colors hover:border-[#E8001D]/50 hover:text-white"
        >
          <Icon n="logOut" s={12} />
          <span>Disconnect</span>
        </button>
      </div>
    </header>
  );
}
