"use client";

import { ChatMessage, SystemMessageType } from "@/models/chat.model";
import { cn } from "@/lib/utils";

interface ChatMessageItemProps {
  message: ChatMessage;
  userId: string;
  username: string;
}

// Format timestamp to HH:MM
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function ChatMessageItem({ message, userId, username }: ChatMessageItemProps) {
  const isSystemMessage =
    message.systemEventType === SystemMessageType.DONATION ||
    message.systemEventType === SystemMessageType.SUBSCRIPTION ||
    message.systemEventType === SystemMessageType.BET_PLACED;

  const isOwnMessage =
    !isSystemMessage && (message.userId === userId || message.username === username);

  // System messages (donations, subscriptions, bets) — prominent inline notice
  if (isSystemMessage) {
    const isDonation = message.systemEventType === SystemMessageType.DONATION;
    const isSubscription = message.systemEventType === SystemMessageType.SUBSCRIPTION;

    return (
      <div className={cn(
        "flex items-center justify-between gap-2 w-full rounded-md px-3 py-2 border",
        isDonation
          ? "bg-yellow-500/15 border-yellow-400/40 text-yellow-100"
          : isSubscription
            ? "bg-purple-500/15 border-purple-400/40 text-purple-100"
            : "bg-blue-500/15 border-blue-400/40 text-blue-100"
      )}>
        <span className="text-xs font-semibold leading-snug">{message.message}</span>
        <span className="text-[10px] opacity-40 shrink-0 ml-2">
          {formatTime(message.createdAt.getTime())}
        </span>
      </div>
    );
  }

  // Regular chat messages - Compact format: timestamp username: message
  return (
    <div className="flex items-baseline gap-1.5 text-sm py-0.5">
      <span className="text-xs text-gray-500 shrink-0">
        {formatTime(message.createdAt.getTime())}
      </span>
      <span className={cn(
        "font-medium shrink-0",
        message.isFeatured
          ? "text-yellow-500"
          : isOwnMessage
            ? "text-blue-400"
            : "text-gray-400"
      )}>
        {message.username}:
      </span>
      <span className="text-white break-words">
        {message.message}
      </span>
    </div>
  );
}
