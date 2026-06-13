"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { StreamerStrip } from "./StreamerStrip";
import { StreamRevealBadge } from "./StreamRevealBadge";
import { NoStreamPlayer } from "./NoStreamPlayer";
import { SecondScreenHook } from "./SecondScreenHook";

interface NoStreamPanelProps {
  /** Live stream count for the badge label. */
  streamCount: number;
  onGoLive: () => void;
  onSwitchStreams: () => void;
}

/**
 * Main-column layout when nothing is streaming. Collapses the would-be player
 * into a reveal badge; expanding swaps in the empty player + streamer
 * placeholder. Esc collapses, and focus moves between the two controls for
 * keyboard users. The markets card renders below this, outside the panel.
 */
export function NoStreamPanel({ streamCount, onGoLive, onSwitchStreams }: NoStreamPanelProps) {
  const [revealed, setRevealed] = useState(false);
  const badgeRef = useRef<HTMLButtonElement>(null);
  const revealId = useId();

  const collapse = useCallback(() => {
    setRevealed(false);
    badgeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") collapse();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [revealed, collapse]);

  return (
    <div className="flex flex-col gap-3 lg:gap-5">
      {revealed ? (
        <div id={revealId} className="flex flex-col gap-3 lg:gap-4">
          <NoStreamPlayer
            onGoLive={onGoLive}
            onSwitchStreams={onSwitchStreams}
            onHide={collapse}
          />
          <StreamerStrip stream={null} isOwnStream={false} />
        </div>
      ) : (
        <StreamRevealBadge
          ref={badgeRef}
          streamCount={streamCount}
          controlsId={revealId}
          onOpen={() => setRevealed(true)}
        />
      )}

      <SecondScreenHook />
    </div>
  );
}
