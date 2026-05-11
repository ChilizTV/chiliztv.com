"use client";

import { useEffect } from "react";
import { ApiService } from "@/services";

interface UseStreamHeartbeatArgs {
  readonly streamId: string | null;
  readonly streamerId: string | null;
  readonly enabled: boolean;
}

const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Pings `POST /stream/:id/heartbeat` every 30s while `enabled` is true.
 * Browser-stream only — OBS lifecycles are driven by mediamtx webhooks
 * and never call this hook.
 */
export function useStreamHeartbeat({ streamId, streamerId, enabled }: UseStreamHeartbeatArgs) {
  useEffect(() => {
    if (!enabled || !streamId || !streamerId) return;

    const ping = () => {
      // `keepalive: true` lets the last ping complete even if the tab is closing.
      fetch(`${ApiService.baseURL}/stream/${streamId}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamerId }),
        keepalive: true,
      }).catch(() => {
        // Network failure — the stale cleanup job remains the safety net.
      });
    };

    ping();
    const interval = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, streamId, streamerId]);
}
