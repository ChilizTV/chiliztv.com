"use client";

import { ChatMessage, SystemMessageType } from "@/models/chat.model";

interface ChatMessageItemProps {
  message: ChatMessage;
  userId: string;
  username: string;
}

interface SystemPalette {
  label: string;
  bg: string;
  border: string;
  color: string;
}

const SYSTEM_PALETTES: Partial<Record<SystemMessageType, SystemPalette>> = {
  [SystemMessageType.BET_PLACED]: {
    label: "Bet",
    bg: "rgba(232,0,29,0.07)",
    border: "rgba(232,0,29,0.4)",
    color: "#FF1737",
  },
  [SystemMessageType.DONATION]: {
    label: "Tip",
    bg: "rgba(245,197,24,0.08)",
    border: "rgba(245,197,24,0.4)",
    color: "#F5C518",
  },
  [SystemMessageType.SUBSCRIPTION]: {
    label: "Sub",
    bg: "rgba(245,197,24,0.06)",
    border: "rgba(245,197,24,0.35)",
    color: "#F5C518",
  },
};

/** Stable hue derived from the username so each chatter gets a consistent color. */
function hueForUser(name: string): string {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  const palette = [
    "#5eebbf",
    "#FF6B9D",
    "#0072CE",
    "#DC052D",
    "#F5C518",
    "#22D3EE",
    "#A855F7",
    "#FB923C",
    "#2dd4a4",
  ];
  return palette[h % palette.length];
}

export function ChatMessageItem({ message, userId, username }: ChatMessageItemProps) {
  const isSystem =
    message.systemEventType === SystemMessageType.BET_PLACED ||
    message.systemEventType === SystemMessageType.DONATION ||
    message.systemEventType === SystemMessageType.SUBSCRIPTION;

  if (isSystem && message.systemEventType && SYSTEM_PALETTES[message.systemEventType]) {
    const palette = SYSTEM_PALETTES[message.systemEventType]!;
    return (
      <div
        className="rounded-md border px-3 py-2 text-[12px]"
        style={{ background: palette.bg, borderColor: palette.border }}
      >
        <div
          className="font-mono-ctv flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{ color: palette.color }}
        >
          <span aria-hidden className="block h-0.5 w-3" style={{ background: palette.color }} />
          {palette.label}
          <span className="text-white/35">· {message.username}</span>
        </div>
        <div className="mt-1 text-white/85">{message.message}</div>
      </div>
    );
  }

  const isOwnMessage = message.userId === userId || message.username === username;
  const userColor = isOwnMessage
    ? "#E8001D"
    : message.isFeatured
      ? "#F5C518"
      : hueForUser(message.username);

  return (
    <div className="px-2 py-1.5 text-[13px] leading-snug text-white/85">
      <span
        className="font-display mr-2 font-bold uppercase tracking-tight"
        style={{ color: userColor }}
      >
        {message.username}
      </span>
      <span className="break-words">{message.message}</span>
    </div>
  );
}
