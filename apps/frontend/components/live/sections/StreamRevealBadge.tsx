"use client";

import { forwardRef } from "react";
import { ChevronDown, Video } from "lucide-react";

import { PulseDot } from "../primitives";

interface StreamRevealBadgeProps {
  /** Number of live streams on this match. 0 renders the gray "no stream" state. */
  streamCount: number;
  controlsId: string;
  onOpen: () => void;
}

/**
 * Compact bar shown where the player would be when nothing is streaming —
 * a tap reveals the full live UI. Gray dot at 0 streams, red pulse when some
 * are live and waiting to be opened.
 */
export const StreamRevealBadge = forwardRef<HTMLButtonElement, StreamRevealBadgeProps>(
  function StreamRevealBadge({ streamCount, controlsId, onOpen }, ref) {
    const hasStreams = streamCount > 0;
    const title = hasStreams
      ? `${streamCount} stream${streamCount > 1 ? "s" : ""} live`
      : "No stream live";
    const sub = hasStreams
      ? `Streams (${streamCount}) · Open the player to watch`
      : "Streams (0) · Open the player to watch or go live";

    return (
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        aria-expanded={false}
        aria-controls={controlsId}
        className="group flex w-full items-center justify-between gap-4 rounded-xl border border-[#1E1E1E] bg-[#0d0d0d] px-4 py-3.5 text-left transition-colors hover:border-[#2A2A2A] hover:bg-[#101010] focus-visible:ring-2 focus-visible:ring-[#E8001D]"
      >
        <span className="flex min-w-0 items-center gap-3.5">
          <span
            aria-hidden
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px] border border-[#2A2A2A] bg-[#1A1A1A] text-white/65"
          >
            <Video size={17} />
          </span>
          <span className="min-w-0">
            <span className="font-display flex items-center gap-2.5 text-[16px] font-extrabold uppercase tracking-tight text-white">
              {hasStreams ? (
                <PulseDot color="#E8001D" size={6} />
              ) : (
                <span aria-hidden className="inline-block h-1.5 w-1.5 flex-none rounded-full bg-[#6a6a6a]" />
              )}
              {title}
            </span>
            <span className="font-mono-ctv mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {sub}
            </span>
          </span>
        </span>

        <span className="font-mono-ctv flex flex-none items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
          <span className="hidden sm:inline">Open player</span>
          <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
        </span>
      </button>
    );
  },
);
