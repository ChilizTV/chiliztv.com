"use client";

import * as React from "react";
import type { AdminSession } from "@/lib/api/endpoints/admin";

const AdminSessionContext = React.createContext<AdminSession | null>(null);

export function AdminSessionProvider({
  session,
  children,
}: Readonly<{ session: AdminSession; children: React.ReactNode }>) {
  return <AdminSessionContext.Provider value={session}>{children}</AdminSessionContext.Provider>;
}

/** {wallet, role} of the verified admin — only available under AdminGuard. */
export function useAdminSession(): AdminSession {
  const ctx = React.useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession must be used under AdminGuard");
  return ctx;
}
