"use client";

import { useState } from "react";
import StreamManager from "../StreamManager";
import type { LiveStream } from "@/models/stream.model";
import { MountableSheet } from "./MountableSheet";

interface StartStreamSheetProps {
  open: boolean;
  onClose: () => void;
  matchId: number;
  onStreamCreated: (stream: LiveStream) => void;
  onStreamEnded: () => void;
  /** Optional preview portal target for the streamer's preview surface. */
  portalTarget?: HTMLDivElement | null;
  endStreamRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

/**
 * Modal — creator console. Hosts the existing `StreamManager` so all of
 * its WebRTC / OBS / preview wiring is preserved verbatim; we only swap
 * the surrounding chrome to match the live-page sheet style.
 *
 * `StreamManager` stays mounted while the user is streaming even if the
 * sheet is closed — the sheet keeps DOM presence (`mounted`) decoupled
 * from visibility so the WebRTC pipeline doesn't tear down when the user
 * dismisses the modal to watch the match.
 */
export function StartStreamSheet({
  open,
  onClose,
  matchId,
  onStreamCreated,
  onStreamEnded,
  portalTarget,
  endStreamRef,
}: StartStreamSheetProps) {
  const [isStreaming, setIsStreaming] = useState(false);

  const mounted = open || isStreaming;

  return (
    <MountableSheet
      mounted={mounted}
      visible={open}
      onClose={onClose}
      width={900}
      eyebrow="Streamer console · OBS-first"
      title={
        <>
          Go <span className="text-[#E8001D]">live</span> with OBS.
        </>
      }
      footer={
        <div className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
          Start OBS now and click Begin Streaming. The page will switch when we detect your feed. · By going live you confirm you have the right to broadcast this content.
        </div>
      }
    >
      <div className="px-6 py-6">
        <StreamManager
          matchId={matchId}
          portalTarget={portalTarget}
          endStreamRef={endStreamRef}
          onStreamCreated={(stream) => {
            setIsStreaming(true);
            onStreamCreated(stream);
            // Close the sheet — StreamManager stays mounted because
            // `mounted = open || isStreaming` is still true.
            onClose();
          }}
          onStreamEnded={() => {
            setIsStreaming(false);
            onStreamEnded();
          }}
        />
      </div>
    </MountableSheet>
  );
}
