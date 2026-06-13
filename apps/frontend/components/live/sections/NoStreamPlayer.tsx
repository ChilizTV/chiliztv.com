"use client";

import { ChevronUp, Eye, Video } from "lucide-react";

import { GhostBtn, PrimaryBtn } from "../primitives";

interface NoStreamPlayerProps {
  onGoLive: () => void;
  onSwitchStreams: () => void;
  onHide: () => void;
}

/**
 * Empty-state player shown when the no-stream panel is expanded: a 16/9 stage
 * with a scanline texture, an idle headline, and the two ways out (broadcast
 * yourself or pick an available stream). Purely presentational.
 */
export function NoStreamPlayer({ onGoLive, onSwitchStreams, onHide }: NoStreamPlayerProps) {
  return (
    <div
      className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-[#1E1E1E]"
      style={{
        background:
          "radial-gradient(120% 120% at 50% 30%, #16171c 0%, #0c0d11 52%, #070708 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-45 mix-blend-screen"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 3px)",
        }}
      />

      <button
        type="button"
        onClick={onHide}
        className="font-mono-ctv absolute right-3.5 top-3.5 z-10 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur transition-colors hover:border-white/25 hover:text-white focus-visible:ring-2 focus-visible:ring-[#E8001D]"
      >
        <ChevronUp size={12} /> Hide player
      </button>

      <div className="relative z-[1] px-6 text-center">
        <div className="relative mx-auto mb-4 h-[60px] w-[60px] rounded-full border-[1.5px] border-white/[0.12]">
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 ml-0.5 -translate-x-1/2 -translate-y-1/2"
            style={{
              borderLeft: "13px solid rgba(255,255,255,0.18)",
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
            }}
          />
        </div>
        <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.28em] text-white/[0.28]">
          Player ready · No feed
        </div>
        <div className="font-display mt-2 text-[24px] font-extrabold uppercase tracking-tight text-white">
          No one is streaming yet
        </div>
        <div className="mt-1.5 text-[13px] font-light text-white/65">
          Be the first to broadcast this match, or switch to an available stream.
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          <PrimaryBtn onClick={onGoLive} leading={<Video size={13} />}>
            Go live
          </PrimaryBtn>
          <GhostBtn onClick={onSwitchStreams} leading={<Eye size={13} />}>
            Switch streams
          </GhostBtn>
        </div>
      </div>
    </div>
  );
}
