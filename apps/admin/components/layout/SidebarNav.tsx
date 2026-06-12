"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ENTRIES, NAV_SOON } from "@/config/nav";
import { useAdminSession } from "@/providers/AdminSessionProvider";
import { isAllowedForNav } from "@/lib/rbac";
import { useOverview } from "@/hooks/api/useOverview";
import { Icon } from "@/components/common/Icon";

export function SidebarNav() {
  const { role } = useAdminSession();
  const pathname = usePathname();
  const { data: overview } = useOverview();

  const openReports = overview?.openReports?.total ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="font-mono-ctv px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Operations</div>
      <nav className="mt-2 flex flex-col gap-1 px-3">
        {NAV_ENTRIES.filter((e) => isAllowedForNav(role, e.roles)).map((entry) => {
          const active = entry.href === "/" ? pathname === "/" : pathname.startsWith(entry.href);
          const badge = entry.badge === "openReports" && openReports > 0 ? openReports : null;
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={`font-mono-ctv relative flex h-9 items-center gap-2.5 rounded-md px-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                active ? "bg-[#E8001D]/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && <span aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-[#E8001D]" />}
              <Icon n={entry.icon} s={14} className={active ? "text-[#FF1737]" : "text-white/35"} />
              <span>{entry.label}</span>
              {badge != null && (
                <span className="font-mono-ctv ml-auto rounded border border-[#F5C518]/40 bg-[#F5C518]/10 px-1 py-px text-[8px] font-bold tabular-nums text-[#F5C518]">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="font-mono-ctv mt-7 px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Coming soon</div>
      <div className="mt-2 flex flex-col gap-1 px-3">
        {NAV_SOON.map((it) => (
          <div
            key={it.label}
            className="font-mono-ctv flex h-9 items-center gap-2.5 rounded-md px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/25"
          >
            <Icon n={it.icon} s={14} className="text-white/20" />
            <span>{it.label}</span>
            <span className="font-mono-ctv ml-auto rounded border border-[#2A2A2A] px-1 py-px text-[7px] font-bold uppercase tracking-[0.12em] text-white/25">
              Soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
