"use client";

import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh">
      <aside className="w-52 shrink-0 border-r border-[#1E1E1E] py-5">
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
