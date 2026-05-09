"use client";

import { AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/models/chat.model";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Eyebrow } from "../primitives";
import { NewMessagesPill } from "./NewMessagesPill";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  userId: string;
  username: string;
  children: React.ReactNode;
}

export function ChatMessageList({ messages, isLoading, messagesEndRef, children }: ChatMessageListProps) {
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  const handleScroll = useCallback(() => {
    const container = listContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = distanceFromBottom < 100;
    setIsUserScrolledUp(!isAtBottom);
    if (isAtBottom) setNewMessagesCount(0);
  }, []);

  const scrollToBottom = useCallback(() => {
    const container = listContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
    setNewMessagesCount(0);
    setIsUserScrolledUp(false);
  }, []);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      if (!isUserScrolledUp) {
        const container = listContainerRef.current;
        if (container) {
          container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        }
      } else {
        setNewMessagesCount((prev) => prev + 1);
      }
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length, isUserScrolledUp]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div
            className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-b-2"
            style={{ borderColor: "#E8001D" }}
          />
          <p className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/45">
            Loading chat…
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Eyebrow>Quiet so far</Eyebrow>
          <div className="font-display text-[18px] font-extrabold uppercase tracking-tight text-white">
            No messages yet
          </div>
          <p className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/45">
            Be the first to chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listContainerRef}
      onScroll={handleScroll}
      className="scrollbar-thin relative flex-1 overflow-y-auto px-3 py-3"
    >
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>{children}</AnimatePresence>
      </div>
      <div ref={messagesEndRef} />

      <NewMessagesPill
        count={newMessagesCount}
        visible={isUserScrolledUp && newMessagesCount > 0}
        onClick={scrollToBottom}
      />
    </div>
  );
}
