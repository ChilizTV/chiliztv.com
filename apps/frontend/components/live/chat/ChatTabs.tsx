"use client";

import { ChatTab } from "@/hooks/useMultiChat";

interface ChatTabsProps {
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
  matchUnread: number;
  streamUnread: number;
}

const TABS: { key: ChatTab; label: string }[] = [
  { key: "stream", label: "Stream" },
  { key: "match", label: "General" },
];

export function ChatTabs({ activeTab, onTabChange, matchUnread, streamUnread }: ChatTabsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-[#1E1E1E] bg-[#0d0d0d] p-3">
      {TABS.map((t) => {
        const isActive = activeTab === t.key;
        const unread = t.key === "stream" ? streamUnread : matchUnread;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onTabChange(t.key)}
            className="font-mono-ctv inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors"
            style={{
              borderColor: isActive ? "#E8001D" : "#1E1E1E",
              background: isActive ? "rgba(232,0,29,0.08)" : "transparent",
              color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
            }}
          >
            {t.label}
            {unread > 0 && !isActive && (
              <span className="ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E8001D] px-1 text-[9px] font-bold tabular-nums text-white">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
