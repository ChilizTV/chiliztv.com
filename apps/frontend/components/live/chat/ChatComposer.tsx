"use client";

import { Send } from "lucide-react";
import { PrimaryBtn, PulseDot } from "../primitives";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Send a message…",
}: ChatComposerProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && value.trim()) onSend();
  };

  return (
    <div className="flex-none border-t border-[#1E1E1E] bg-[#111] p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="font-mono-ctv flex-1 rounded-md border border-[#1E1E1E] bg-[#0d0d0d] px-3 py-2.5 text-[12px] text-white placeholder-white/35 outline-none transition-colors focus:border-[#E8001D] disabled:cursor-not-allowed disabled:opacity-50"
        />
        <PrimaryBtn
          type="submit"
          disabled={disabled || !value.trim()}
          leading={<Send size={13} />}
          aria-label="Send message"
        >
          Send
        </PrimaryBtn>
      </form>
      <div className="font-mono-ctv mt-2 flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-white/35">
        <span>Press Enter to send</span>
        <span className="inline-flex items-center gap-1.5">
          <PulseDot color="#2dd4a4" size={4} /> On-chain identity
        </span>
      </div>
    </div>
  );
}
