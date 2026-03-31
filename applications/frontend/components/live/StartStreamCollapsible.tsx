"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Square, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import StreamManager from "./StreamManager";
import { motion, AnimatePresence } from "framer-motion";
import { LiveStream } from "@/models/stream.model";

interface StartStreamCollapsibleProps {
  matchId: number;
  onStreamCreated: (stream: LiveStream) => void;
  onStreamEnded: () => void;
  portalTarget?: HTMLDivElement | null;
}

export function StartStreamCollapsible({
  matchId,
  onStreamCreated,
  onStreamEnded,
  portalTarget,
}: StartStreamCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const endStreamRef = useRef<(() => Promise<void>) | null>(null);

  // Keep StreamManager mounted while open OR streaming so the WebRTC connection persists
  const isManagerMounted = isOpen || isStreaming;

  return (
    <div className="w-full">
      {isStreaming ? (
        <Button
          onClick={() => endStreamRef.current?.()}
          variant="destructive"
          className="w-auto flex items-center gap-2 bg-red-600 hover:bg-red-700 border-red-500 text-white"
        >
          <Square className="w-4 h-4" />
          <span>End Stream</span>
        </Button>
      ) : (
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 border-blue-500 text-white"
        >
          <Video className="w-4 h-4" />
          <span>Start Your Stream</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      )}

      {/*
       * StreamManager is kept mounted while isManagerMounted is true.
       * When streaming starts, the panel animates to height 0 (hidden) without
       * unmounting, so the WebRTC connection stays alive.
       * When the user closes the collapsible without streaming, AnimatePresence
       * plays the exit animation then unmounts normally.
       */}
      <AnimatePresence>
        {isManagerMounted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isStreaming ? 0 : "auto",
              opacity: isStreaming ? 0 : 1,
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              <StreamManager
                matchId={matchId}
                portalTarget={portalTarget}
                endStreamRef={endStreamRef}
                onStreamCreated={(stream) => {
                  setIsStreaming(true);
                  setIsOpen(false);
                  onStreamCreated(stream);
                }}
                onStreamEnded={() => {
                  setIsStreaming(false);
                  onStreamEnded();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
