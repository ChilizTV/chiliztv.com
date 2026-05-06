"use client";

import { useState } from "react";
import { CreateMatchForm } from "./CreateMatchForm";
import { MatchAdminPanel } from "./MatchAdminPanel";
import { PoolAdminPanel } from "./PoolAdminPanel";
import { AdminPage } from "./AdminPage";

type Tab = "console" | "matches" | "pool" | "raw";

const TABS: Array<{ id: Tab; label: string }> = [
    { id: "console", label: "Console" },
    { id: "matches", label: "Matches" },
    { id: "pool", label: "Pool" },
    { id: "raw", label: "Raw ABI" },
];

/**
 * Tab wrapper for the admin area:
 *   - Console:  curated create-match + match-admin + pool-admin views,
 *               with role-gating and friendly inputs.
 *   - Matches:  match-admin only (handy when testing markets).
 *   - Pool:     pool-admin only.
 *   - Raw ABI:  the existing generic ABI explorer (`<AdminPage />`) for
 *               anything the curated views don't surface.
 */
export function AdminTabs() {
    const [tab, setTab] = useState<Tab>("console");

    return (
        <div className="px-4 py-6 max-w-5xl mx-auto space-y-4">
            <h1 className="text-[20px] font-bold uppercase tracking-[0.08em]" style={{ color: "#fff" }}>
                Admin
            </h1>

            <nav className="flex gap-2 border-b" style={{ borderColor: "#1E1E1E" }}>
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className="px-4 py-2 text-[12px] font-bold uppercase tracking-[0.08em]"
                        style={{
                            color: tab === t.id ? "#E8001D" : "#888",
                            borderBottom: `2px solid ${tab === t.id ? "#E8001D" : "transparent"}`,
                            marginBottom: -1,
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            {tab === "console" && (
                <div className="space-y-4">
                    <CreateMatchForm />
                    <MatchAdminPanel />
                    <PoolAdminPanel />
                </div>
            )}
            {tab === "matches" && <MatchAdminPanel />}
            {tab === "pool" && <PoolAdminPanel />}
            {tab === "raw" && <AdminPage />}
        </div>
    );
}
