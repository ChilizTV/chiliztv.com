"use client";

import { MessageSquare } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/models/chat.model";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { NewMessagesPill } from "./NewMessagesPill";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  userId: string;
  username: string;
  children: React.ReactNode;
}

export function ChatMessageList({
  messages,
  isLoading,
  messagesEndRef,
  children,
}: ChatMessageListProps) {
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Scroll detection handler
  const handleScroll = useCallback(() => {
    const container = listContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = distanceFromBottom < 100; // 100px threshold

    setIsUserScrolledUp(!isAtBottom);
    if (isAtBottom) {
      setNewMessagesCount(0);
    }
  }, []);

  // Scroll to bottom handler for pill
  const scrollToBottom = useCallback(() => {
    const container = listContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
    setNewMessagesCount(0);
    setIsUserScrolledUp(false);
  }, []);

  // Auto-scroll logic: only scroll if user is at bottom
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      // New message arrived
      if (!isUserScrolledUp) {
        // User is at bottom: auto-scroll the container, not the window
        const container = listContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      } else {
        // User scrolled up: increment count
        setNewMessagesCount((prev) => prev + 1);
      }
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length, isUserScrolledUp]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium mb-1">No messages yet</p>
          <p className="text-gray-500 text-sm">Be the first to chat!</p>
        </div>
      </div>
    );
  }

  // Messages List
  return (
    <div
      ref={listContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin relative"
    >
      <AnimatePresence initial={false}>
        {children}
      </AnimatePresence>
      <div ref={messagesEndRef} />

      {/* New messages pill */}
      <NewMessagesPill
        count={newMessagesCount}
        visible={isUserScrolledUp && newMessagesCount > 0}
        onClick={scrollToBottom}
      />
    </div>
  );
}
