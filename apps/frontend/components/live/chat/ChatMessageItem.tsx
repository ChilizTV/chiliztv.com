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

  // System messages (donations, subscriptions, bets) — Twitch-style inline notice
  if (isSystemMessage) {
    const isDonation = message.systemEventType === SystemMessageType.DONATION;
    const isSubscription = message.systemEventType === SystemMessageType.SUBSCRIPTION;

    return (
      <div className={cn(
        "flex items-baseline justify-between gap-2 text-sm py-1.5 px-3 rounded-sm border-l-2 w-full",
        isDonation
          ? "bg-yellow-500/10 border-yellow-400/80 text-yellow-100"
          : isSubscription
            ? "bg-purple-500/10 border-purple-400/80 text-purple-100"
            : "bg-blue-500/10 border-blue-400/80 text-blue-100"
      )}>
        <span className="leading-snug font-medium">{message.message}</span>
        <span className="text-xs opacity-40 shrink-0 ml-2">
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
