"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SupabaseChatService } from "@/services";
import { useMultiChat } from "@/hooks/useMultiChat";
import { MessageType, SystemMessageType, type ChatMessage } from "@/models/chat.model";
import { ChatHeader } from "./ChatHeader";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatTabs } from "./ChatTabs";
import { LatestSystemBanner } from "./LatestSystemBanner";

/** Event types we surface in the gold banner (and therefore filter out of the chat list). */
const PINNED_SYSTEM_TYPES: ReadonlySet<SystemMessageType> = new Set([
  SystemMessageType.BET_PLACED,
  SystemMessageType.DONATION,
  SystemMessageType.SUBSCRIPTION,
]);

/**
 * A message is treated as a pinned system event when it carries a known
 * `systemEventType`, OR when its underlying row is `MessageType.SYSTEM` —
 * the latter is a safety net for older inserts that landed in the DB
 * without `system_type` populated.
 */
function isPinnedSystem(m: ChatMessage): boolean {
  if (m.systemEventType && PINNED_SYSTEM_TYPES.has(m.systemEventType)) return true;
  if (m.type === MessageType.SYSTEM) return true;
  return false;
}

interface ChatPanelProps {
  matchId: string;
  streamId?: string;
  userId: string;
  username: string;
  walletAddress: string;
  onMessageSent?: () => void;
}

const chatService = new SupabaseChatService();

export default function ChatPanel({
  matchId,
  streamId,
  userId,
  username,
  walletAddress,
  onMessageSent,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const onMessageSentRef = useRef(onMessageSent);

  useEffect(() => {
    onMessageSentRef.current = onMessageSent;
  }, [onMessageSent]);

  useEffect(() => {
    const numericMatchId = parseInt(matchId);
    chatService
      .joinRoom(numericMatchId, userId, username, walletAddress)
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));

    return () => {
      chatService.leaveRoom(numericMatchId, userId).catch(() => {});
    };
  }, [matchId, userId, username, walletAddress]);

  const { activeTab, setActiveTab, matchRoom, streamRoom, activeRoom } = useMultiChat({
    matchId: parseInt(matchId),
    streamId,
    userId,
    username,
    walletAddress,
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;
    const text = newMessage.trim();
    setNewMessage("");
    await activeRoom.sendMessage(text);
    onMessageSentRef.current?.();
  };

  // System events (bet/tip/sub) are pinned to a single gold banner above
  // the message list. Older system events disappear when a newer one
  // arrives — they're filtered out of the regular feed too so each event
  // is only ever visible in one place.
  const { latestSystem, chatOnlyMessages } = useMemo(() => {
    const messages = activeRoom.messages;
    let latest: ChatMessage | null = null;
    const filtered: ChatMessage[] = [];
    for (const m of messages) {
      if (isPinnedSystem(m)) {
        if (!latest || m.createdAt.getTime() >= latest.createdAt.getTime()) {
          latest = m;
        }
      } else {
        filtered.push(m);
      }
    }
    return { latestSystem: latest, chatOnlyMessages: filtered };
  }, [activeRoom.messages]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0d0d0d]">
      <ChatHeader isConnected={isConnected} />

      {streamRoom && (
        <ChatTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          matchUnread={matchRoom.unreadCount}
          streamUnread={streamRoom.unreadCount}
        />
      )}

      <LatestSystemBanner message={latestSystem} />

      <ChatMessageList
        messages={chatOnlyMessages}
        isLoading={activeRoom.isLoading}
        messagesEndRef={messagesEndRef}
        userId={userId}
        username={username}
      >
        {chatOnlyMessages.map((msg, idx) => (
          <ChatMessageItem
            key={msg.id || idx}
            message={msg}
            userId={userId}
            username={username}
          />
        ))}
      </ChatMessageList>

      <ChatComposer
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSendMessage}
        disabled={!isConnected}
        placeholder={isConnected ? "Send a message…" : "Connecting…"}
      />
    </div>
  );
}
