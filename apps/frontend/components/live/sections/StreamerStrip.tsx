"use client";

import { Eye, Heart, Gift, Star } from "lucide-react";
import { Eyebrow, GhostBtn, GoldBtn, fmtViewersLive } from "../primitives";
import type { LiveStream } from "@/models/stream.model";

interface StreamerStripProps {
  stream: LiveStream | null;
  isOwnStream: boolean;
  isFollowing?: boolean;
  followDisabled?: boolean;
  followBusy?: boolean;
  onFollow?: () => void;
  onTip?: () => void;
  onSubscribe?: () => void;
}

function StreamerInitial({ name }: { name: string }) {
  const initial = (name || "?").replace("@", "").slice(0, 2).toUpperCase();
  return (
    <span
      className="font-display relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-[16px] font-extrabold uppercase tracking-tight text-white"
      style={{
        background: "linear-gradient(135deg, #E8001D 0%, #7B0010 100%)",
        boxShadow: "0 0 0 2px #0A0A0A, 0 0 0 4px #E8001D",
      }}
    >
      {initial}
    </span>
  );
}

export function StreamerStrip({
  stream,
  isOwnStream,
  isFollowing,
  followDisabled,
  followBusy,
  onFollow,
  onTip,
  onSubscribe,
}: StreamerStripProps) {
  if (!stream) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-xl border border-[#1E1E1E] bg-[#111] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Eyebrow>No stream selected</Eyebrow>
          <div className="mt-1 text-[13px] font-light text-white/55">
            Pick a streamer to follow, tip, or subscribe.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <StreamerInitial name={stream.streamerName} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display truncate text-[20px] font-extrabold uppercase tracking-tight text-white">
                @{stream.streamerName}
              </span>
              {isOwnStream && (
                <span
                  className="font-mono-ctv inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em]"
                  style={{ borderColor: "#F5C518", color: "#F5C518" }}
                >
                  You
                </span>
              )}
            </div>
            {stream.title && (
              <div className="mt-0.5 truncate text-[13px] font-light text-white/65">
                {stream.title}
              </div>
            )}
            <div className="font-mono-ctv mt-2 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-white/45">
              {typeof stream.viewerCount === "number" && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <Eye size={11} /> {fmtViewersLive(stream.viewerCount)} viewers
                  </span>
                  <span>·</span>
                </>
              )}
              <span className="capitalize">{stream.status?.toString().toLowerCase()}</span>
            </div>
          </div>
        </div>

        {!isOwnStream ? (
          <div className="flex flex-wrap items-center gap-2">
            {onFollow && (
              <GhostBtn
                onClick={onFollow}
                active={!!isFollowing}
                disabled={followDisabled || followBusy}
                leading={<Heart size={13} fill={isFollowing ? "currentColor" : "none"} />}
              >
                {isFollowing ? "Following" : "Follow"}
              </GhostBtn>
            )}
            {onTip && (
              <GhostBtn onClick={onTip} leading={<Gift size={13} />}>
                Tip in CHZ
              </GhostBtn>
            )}
            {onSubscribe && (
              <GoldBtn onClick={onSubscribe} leading={<Star size={13} />}>
                Subscribe
              </GoldBtn>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <GhostBtn active leading={<span className="font-mono-ctv">●</span>} color="#E8001D">
              Live · self-hosted
            </GhostBtn>
          </div>
        )}
      </div>
    </div>
  );
}
