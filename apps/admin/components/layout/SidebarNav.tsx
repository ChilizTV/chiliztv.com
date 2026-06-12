"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ENTRIES } from "@/config/nav";
import { useAdminSession } from "@/providers/AdminSessionProvider";
import { isAllowedForNav } from "@/lib/rbac";

export function SidebarNav() {
  const { role } = useAdminSession();
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ENTRIES.filter((e) => isAllowedForNav(role, e.roles)).map((entry) => {
        const active = pathname === entry.href;
        return (
          <Link
            key={entry.href}
            href={entry.href}
            className={`font-mono-ctv rounded-md px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
              active ? "bg-[#E8001D]/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
          >
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}
