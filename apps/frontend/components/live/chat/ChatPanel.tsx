"use client";

import { useEffect, useRef, useState } from "react";
import { SupabaseChatService } from "@/services";
import { useMultiChat } from "@/hooks/useMultiChat";
import { ChatHeader } from "./ChatHeader";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatTabs } from "./ChatTabs";

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

      <ChatMessageList
        messages={activeRoom.messages}
        isLoading={activeRoom.isLoading}
        messagesEndRef={messagesEndRef}
        userId={userId}
        username={username}
      >
        {activeRoom.messages.map((msg, idx) => (
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
