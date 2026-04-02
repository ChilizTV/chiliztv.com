"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import StreamSelector from "./StreamSelector";
import type { LiveStream } from "@/models/stream.model";

interface BrowseLivesCollapsibleProps {
  matchId: number;
  selectedStreamId?: string;
  onStreamSelect: (stream: LiveStream) => void;
  onOwnStreamDetected?: (stream: LiveStream | null) => void;
  currentUserId?: string;
  initialStreamId?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BrowseLivesCollapsible({
  matchId,
  selectedStreamId,
  onStreamSelect,
  onOwnStreamDetected,
  currentUserId,
  initialStreamId,
  isOpen: controlledIsOpen,
  onOpenChange,
}: BrowseLivesCollapsibleProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (v: boolean) => {
    setInternalIsOpen(v);
    onOpenChange?.(v);
  };

  return (
    <div className="w-full">
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-auto flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border-gray-700"
      >
        <span>Browse Lives</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {/*
        StreamSelector is always mounted so auto-selection runs on page load.
        Its visual output is hidden until the user opens the collapsible.
      */}
      <div className={isOpen ? "mt-4" : "hidden"}>
        <StreamSelector
          matchId={matchId}
          selectedStreamId={selectedStreamId}
          currentUserId={currentUserId}
          initialStreamId={initialStreamId}
          onOwnStreamDetected={onOwnStreamDetected}
          onStreamSelect={(stream) => {
            onStreamSelect(stream);
            setIsOpen(false); // Auto-close on selection
          }}
        />
      </div>
    </div>
  );
}
