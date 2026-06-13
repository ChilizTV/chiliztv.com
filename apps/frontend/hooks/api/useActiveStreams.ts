"use client";

import { useQuery } from "@tanstack/react-query";

import { streamsApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/keys";
import type { LiveStream } from "@/models/stream.model";

/**
 * Active (live) streams for a match. Powers the no-stream reveal badge's
 * "{n} stream(s) live" count without touching the player path. Polls on the
 * same 5s cadence the switcher sheet uses so the count stays fresh.
 */
export function useActiveStreams(matchId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.streams.active(matchId ?? -1),
    queryFn: () => streamsApi.getActive(matchId as number),
    enabled: typeof matchId === "number" && Number.isFinite(matchId),
    staleTime: 5_000,
    refetchInterval: 5_000,
    select: (data) => {
      const streams: LiveStream[] = data.success ? data.streams : [];
      const live = streams.filter((s) => s.status === "live");
      return { streams: live, count: live.length };
    },
  });
}
