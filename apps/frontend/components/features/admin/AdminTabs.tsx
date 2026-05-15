"use client";

import { PariAdminPanel } from "./pari/PariAdminPanel";

/**
 * /admin entry point. Routes to the pari-mutuel admin console, which is
 * the only admin surface after the LiquidityPool + BettingMatch retirement.
 */
export function AdminTabs() {
  return <PariAdminPanel />;
}
