"use client";

import { Send, Gift, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  onOpenDonation?: () => void;
  onOpenSubscription?: () => void;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Send a message...",
  onOpenDonation,
  onOpenSubscription,
}: ChatComposerProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && value.trim()) {
      onSend();
    }
  };

  return (
    <div className="flex-none bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 min-h-[40px] max-h-[120px] resize-none",
            "bg-gray-800 border-gray-700 text-white",
            "placeholder:text-gray-500",
            "focus:border-blue-500 focus:ring-blue-500/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Donation Button */}
        {onOpenDonation && (
          <Button
            type="button"
            onClick={onOpenDonation}
            size="icon"
            className="h-10 w-10 shrink-0 bg-yellow-600 hover:bg-yellow-700 transition-all"
            aria-label="Send donation"
          >
            <Gift className="w-4 h-4" />
          </Button>
        )}

        {/* Subscription Button */}
        {onOpenSubscription && (
          <Button
            type="button"
            onClick={onOpenSubscription}
            size="icon"
            className="h-10 w-10 shrink-0 bg-purple-600 hover:bg-purple-700 transition-all"
            aria-label="Manage subscription"
          >
            <Star className="w-4 h-4" />
          </Button>
        )}

        {/* Send Button */}
        <Button
          type="submit"
          disabled={disabled || !value.trim()}
          size="icon"
          className={cn(
            "h-10 w-10 shrink-0 transition-all",
            disabled || !value.trim()
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 active:scale-95"
          )}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
