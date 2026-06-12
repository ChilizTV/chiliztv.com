"use client";

import Image from "next/image";

import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";

const ENV_LABEL = process.env.NEXT_PUBLIC_STAGING === "true" ? "Staging" : "Prod";

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh">
      <aside className="flex w-52 shrink-0 flex-col border-r border-[#1E1E1E]">
        <div className="flex items-center gap-2 px-5 pb-5 pt-5">
          <Image src="/predcast-logo-on-dark.svg" alt="PredCast" width={98} height={15} priority className="h-[15px] w-auto" />
          <span className="font-mono-ctv rounded border border-[#E8001D]/40 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
            Admin
          </span>
        </div>
        <SidebarNav />
        <div className="mt-auto border-t border-[#1E1E1E] px-5 py-4">
          <div className="font-mono-ctv flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
            <span className="h-[5px] w-[5px] rounded-full bg-[#2dd4a4]" />
            <span>{ENV_LABEL} · Chiliz Chain</span>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-7 py-6">{children}</main>
      </div>
    </div>
  );
}
