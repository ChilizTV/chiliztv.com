"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { streamViewerService } from "@/services";
import { useVisibilityAwareInterval } from "@/hooks/useVisibilityAwareInterval";
import type { LiveStream } from "@/models/stream.model";
import { PulseDot, fmtViewersLive } from "../primitives";
import { SheetShell } from "./SheetShell";

interface StreamSwitcherSheetProps {
  open: boolean;
  onClose: () => void;
  matchId: number;
  selectedStreamId?: string;
  currentUserId?: string;
  initialStreamId?: string;
  onStreamSelect: (stream: LiveStream) => void;
  onOwnStreamDetected?: (stream: LiveStream | null) => void;
}

/**
 * Modal — pick a streamer broadcasting this match.
 *
 * Owns the same fetch loop as the previous `StreamSelector` (5s polling) so
 * auto-selection of a preferred stream still happens on first mount and the
 * parent's `onOwnStreamDetected` callback is fired the moment the user's
 * own stream goes live.
 */
export function StreamSwitcherSheet({
  open,
  onClose,
  matchId,
  selectedStreamId,
  currentUserId,
  initialStreamId,
  onStreamSelect,
  onOwnStreamDetected,
}: StreamSwitcherSheetProps) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isInitialMount = useRef(true);
  const onStreamSelectRef = useRef(onStreamSelect);
  const onOwnStreamDetectedRef = useRef(onOwnStreamDetected);
  const selectedStreamIdRef = useRef(selectedStreamId);
  const matchIdRef = useRef(matchId);
  const currentUserIdRef = useRef(currentUserId);
  const initialStreamIdRef = useRef(initialStreamId);

  useEffect(() => {
    onStreamSelectRef.current = onStreamSelect;
    onOwnStreamDetectedRef.current = onOwnStreamDetected;
    selectedStreamIdRef.current = selectedStreamId;
    matchIdRef.current = matchId;
    currentUserIdRef.current = currentUserId;
    initialStreamIdRef.current = initialStreamId;
  }, [onStreamSelect, onOwnStreamDetected, selectedStreamId, matchId, currentUserId, initialStreamId]);

  const fetchStreams = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setIsRefreshing(true);
      setError(null);

      const result = await streamViewerService.getActiveStreams(matchIdRef.current);
      if (!result.success) {
        setError(result.error || "Failed to fetch streams");
        return;
      }

      setStreams(result.streams);
      if (currentUserIdRef.current) {
        const ownStream =
          result.streams.find((s) => s.streamerId === currentUserIdRef.current) ?? null;
        onOwnStreamDetectedRef.current?.(ownStream);
      }

      if (isInitial && !selectedStreamIdRef.current) {
        if (initialStreamIdRef.current && result.streams.length > 0) {
          const selectable = currentUserIdRef.current
            ? result.streams.filter((s) => s.streamerId !== currentUserIdRef.current)
            : result.streams;
          const target = selectable.find((s) => s.id === initialStreamIdRef.current);
          if (target) onStreamSelectRef.current(target);
        } else {
          const preferred = await streamViewerService.getPreferredStream(
            matchIdRef.current,
            currentUserIdRef.current,
          );
          if (preferred.stream) onStreamSelectRef.current(preferred.stream);
        }
      }
    } catch (err) {
      console.error("Error fetching streams:", err);
      setError("Failed to fetch streams");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch on mount / matchId change. The visibility hook's own
  // immediate-fire only runs once `document.visibilityState === 'visible'`.
  useEffect(() => {
    isInitialMount.current = true;
    const isInitial = isInitialMount.current;
    if (isInitialMount.current) isInitialMount.current = false;
    fetchStreams(isInitial);
  }, [matchId, fetchStreams]);

  // 5s refresh whenever the tab is visible. Polls continue even when the
  // sheet is closed because the parent relies on `onOwnStreamDetected` to
  // react to the user's own stream coming online from another tab.
  useVisibilityAwareInterval(() => fetchStreams(false), 5000);

  const ownStream = streams.find((s) => s.streamerId === currentUserId) ?? null;
  const otherStreams = streams.filter(
    (s) => s.status === "live" && s.streamerId !== currentUserId,
  );
  const displayStreams = ownStream ? [ownStream, ...otherStreams] : otherStreams;

  const handleSelect = (stream: LiveStream) => {
    onStreamSelect(stream);
    onClose();
  };

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      width={760}
      eyebrow="Switch streams · Same match"
      title={
        <>
          {displayStreams.length} {displayStreams.length === 1 ? "creator" : "creators"}{" "}
          <span className="text-[#E8001D]">live now.</span>
        </>
      }
      footer={
        <div className="font-mono-ctv flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.16em] text-white/45">
          <span>
            Tips & subs settle directly to each creator&apos;s StreamWallet.
          </span>
          {isRefreshing && (
            <span className="inline-flex items-center gap-1.5">
              <PulseDot color="#2dd4a4" size={4} /> Refreshing
            </span>
          )}
        </div>
      }
    >
      {loading && streams.length === 0 ? (
        <SkeletonList />
      ) : error && streams.length === 0 ? (
        <EmptyMessage tone="error" message={error} />
      ) : displayStreams.length === 0 ? (
        <EmptyMessage tone="muted" message="No one is streaming this match yet." />
      ) : (
        <div className="flex flex-col">
          {displayStreams.map((stream) => {
            const isActive = selectedStreamId === stream.id;
            const isOwn = stream.streamerId === currentUserId;
            return (
              <StreamRow
                key={stream.id}
                stream={stream}
                isActive={isActive}
                isOwn={isOwn}
                onSelect={() => handleSelect(stream)}
              />
            );
          })}
        </div>
      )}
    </SheetShell>
  );
}

interface StreamRowProps {
  stream: LiveStream;
  isActive: boolean;
  isOwn: boolean;
  onSelect: () => void;
}

function StreamRow({ stream, isActive, isOwn, onSelect }: StreamRowProps) {
  const initial = (stream.streamerName || "?").slice(0, 3).toUpperCase();
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex items-center gap-4 border-b border-[#1E1E1E] bg-[#0d0d0d] p-5 text-left transition-colors last:border-0 hover:bg-[#111]"
    >
      {isActive && (
        <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-[#E8001D]" />
      )}

      {/* Thumbnail tile */}
      <div className="relative h-[68px] w-[120px] shrink-0 overflow-hidden rounded-md border border-[#1E1E1E]">
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(232,0,29,0.35), #03110b 70%)",
          }}
        />
        <span
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "repeating-linear-gradient(180deg, transparent 0px, transparent 6px, rgba(255,255,255,0.04) 6px, rgba(255,255,255,0.04) 7px)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[16px] font-extrabold uppercase tracking-tight text-white/95">
            {initial}
          </span>
        </div>
        <div className="absolute inset-0 flex items-end p-1.5">
          <span className="font-mono-ctv inline-flex items-center gap-1 rounded-sm bg-black/55 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white">
            <PulseDot color="#E8001D" size={4} /> Live
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display truncate text-[16px] font-extrabold uppercase tracking-tight text-white">
            @{stream.streamerName}
          </span>
          {isOwn && (
            <span
              className="font-mono-ctv inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em]"
              style={{ borderColor: "#F5C518", color: "#F5C518" }}
            >
              You
            </span>
          )}
        </div>
        {stream.title && (
          <div className="mt-1 truncate text-[12px] font-light text-white/65">
            {stream.title}
          </div>
        )}
        <div className="font-mono-ctv mt-1.5 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-white/45">
          <span className="inline-flex items-center gap-1">
            <Eye size={11} /> {fmtViewersLive(stream.viewerCount ?? 0)}
          </span>
          <span>·</span>
          <span className="capitalize">{stream.status?.toString().toLowerCase()}</span>
        </div>
      </div>

      {/* CTA chip */}
      <span
        className="font-mono-ctv shrink-0 rounded-md border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors"
        style={{
          borderColor: isActive ? "#E8001D" : "#1E1E1E",
          background: isActive ? "rgba(232,0,29,0.08)" : "transparent",
          color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
        }}
      >
        {isActive ? "Watching" : "Watch →"}
      </span>
    </button>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-[#1E1E1E] bg-[#0d0d0d] p-5 last:border-0"
        >
          <div className="h-[68px] w-[120px] animate-pulse rounded-md bg-[#141414]" />
          <div className="flex-1">
            <div className="mb-2 h-3 w-32 animate-pulse rounded bg-[#141414]" />
            <div className="h-2.5 w-48 animate-pulse rounded bg-[#0d0d0d]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyMessage({
  message,
  tone,
}: {
  message: string;
  tone: "muted" | "error";
}) {
  const color = tone === "error" ? "#E8001D" : "rgba(255,255,255,0.45)";
  return (
    <div className="px-6 py-12 text-center">
      <span
        className="font-mono-ctv text-[11px] uppercase tracking-[0.16em]"
        style={{ color }}
      >
        {message}
      </span>
    </div>
  );
}
