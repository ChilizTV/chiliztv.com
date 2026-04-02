"use client";

import { StreamPreview } from "@/types/browse.types";
import { StreamPreviewCard } from "./StreamPreviewCard";

interface StreamPreviewRowProps {
  streams: StreamPreview[];
  matchId: number;
}

export function StreamPreviewRow({ streams, matchId }: StreamPreviewRowProps) {
  if (streams.length === 0) return null;

  return (
    <div
      className="flex gap-2 pt-3 overflow-x-auto scrollbar-none"
      onClick={(e) => e.stopPropagation()}
    >
      {streams.slice(0, 4).map((stream) => (
        <StreamPreviewCard key={stream.streamId} stream={stream} matchId={matchId} />
      ))}
    </div>
  );
}
