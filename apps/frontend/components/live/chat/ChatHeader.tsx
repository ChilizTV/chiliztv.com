"use client";

import { Eyebrow, PulseDot } from "../primitives";

interface ChatHeaderProps {
  isConnected: boolean;
}

/**
 * Chat panel header — red accent ribbon, eyebrow + display title,
 * connection pulse on the right. Matches the live-page design tokens.
 */
export function ChatHeader({ isConnected }: ChatHeaderProps) {
  return (
    <div
      className="relative border-b border-[#1E1E1E] px-5 py-4"
      style={{
        background: "linear-gradient(90deg, rgba(232,0,29,0.18) 0%, transparent 60%)",
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 h-1 w-full"
        style={{ background: "linear-gradient(90deg, #E8001D 0%, transparent 60%)" }}
      />
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: "linear-gradient(180deg, #E8001D 0%, transparent 60%)" }}
      />

      <Eyebrow>Live chat</Eyebrow>
      <div className="mt-1 flex items-center gap-2">
        <span className="font-display text-[18px] font-extrabold uppercase tracking-tight text-white">
          In-stream chat
        </span>
        <span className="font-mono-ctv ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/55">
          <PulseDot color={isConnected ? "#2dd4a4" : "#E8001D"} size={5} />
          {isConnected ? "Connected" : "Offline"}
        </span>
      </div>
    </div>
  );
}
