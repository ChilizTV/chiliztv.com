"use client";

import { MessageSquare } from "lucide-react";

interface Props {
  readonly onClick: () => void;
  readonly hidden?: boolean;
}

export function MobileChatFab({ onClick, hidden = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open live chat"
      className={`fixed right-4 bottom-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#E8001D] text-white shadow-[0_10px_28px_rgba(232,0,29,0.4)] transition-all hover:bg-[#FF1737] active:scale-95 lg:hidden ${
        hidden ? "pointer-events-none scale-90 opacity-0" : "opacity-100"
      }`}
      style={{
        paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <MessageSquare size={22} strokeWidth={2.2} />
    </button>
  );
}
