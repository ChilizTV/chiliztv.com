"use client";

import type { ReactNode } from "react";
import { Eye } from "lucide-react";
import { Eyebrow, PulseDot, fmtViewersLive } from "../primitives";
import type { LiveStream } from "@/models/stream.model";

interface StreamShelfProps {
  activeStream: LiveStream | null;
  isOwnStream: boolean;
  /** Browse-streams trigger (kept as a slot so the existing collapsible drives the sheet). */
  browseSlot: ReactNode;
  /** Go-live trigger (kept as a slot so the existing manager drives streaming state). */
  startSlot: ReactNode;
}

function StreamerInitial({ name }: { name: string }) {
  const initial = (name || "?").replace("@", "").slice(0, 2).toUpperCase();
  return (
    <span
      className="font-display relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-[12px] font-extrabold uppercase tracking-tight text-white"
      style={{
        background: "linear-gradient(135deg, #E8001D 0%, #7B0010 100%)",
        boxShadow: "0 0 0 2px #0A0A0A, 0 0 0 4px #E8001D",
      }}
    >
      {initial}
    </span>
  );
}

export function StreamShelf({
  activeStream,
  isOwnStream,
  browseSlot,
  startSlot,
}: StreamShelfProps) {
  return (
    <div className="mb-3">
      <div className="rounded-lg border border-[#1E1E1E] bg-[#111]/95 backdrop-blur">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            {activeStream ? (
              <>
                <Eyebrow>{isOwnStream ? "Your stream" : "Now watching"}</Eyebrow>
                <div className="mt-2 flex items-center gap-3">
                  <StreamerInitial name={activeStream.streamerName} />
                  <span className="font-display truncate text-[16px] font-extrabold uppercase tracking-tight text-white">
                    @{activeStream.streamerName}
                  </span>
                  {typeof activeStream.viewerCount === "number" && (
                    <>
                      <span className="text-white/30">·</span>
                      <span className="font-mono-ctv inline-flex items-center gap-1 text-[11px] tabular-nums text-white/55">
                        <Eye size={11} /> {fmtViewersLive(activeStream.viewerCount)}
                      </span>
                    </>
                  )}
                  {isOwnStream && (
                    <span
                      className="font-mono-ctv inline-flex shrink-0 items-center rounded-sm border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em]"
                      style={{ borderColor: "#F5C518", color: "#F5C518" }}
                    >
                      You
                    </span>
                  )}
                  {activeStream.title && (
                    <>
                      <span className="hidden text-white/30 sm:inline">·</span>
                      <span className="font-mono-ctv hidden truncate text-[11px] text-white/55 sm:inline">
                        {activeStream.title}
                      </span>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Eyebrow color="#F5C518">No stream selected</Eyebrow>
                <div className="mt-2 max-w-md text-[13px] font-light text-white/65">
                  Pick a streamer to watch this match — or fire up your own studio.
                </div>
              </>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {browseSlot}
            {startSlot}
          </div>
        </div>

        {/* Inline live pulse strip */}
        {activeStream && (
          <div className="flex items-center gap-2 border-t border-[#1E1E1E] px-4 py-2">
            <PulseDot color="#E8001D" size={5} />
            <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
              Streaming live · self-hosted · settles to streamer&apos;s wallet
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
