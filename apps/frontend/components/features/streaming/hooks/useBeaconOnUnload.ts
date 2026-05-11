"use client";

import { useEffect } from "react";
import { ApiService } from "@/services";

interface UseBeaconOnUnloadArgs {
  readonly streamId: string | null;
  readonly streamerId: string | null;
  readonly enabled: boolean;
}

/**
 * Fires `navigator.sendBeacon` to `/stream/beacon` on `pagehide` so a tab
 * close lands the row in ENDED within ~1s. Best-effort — the cleanup job
 * stays the safety net when sendBeacon is dropped (mobile, bfcache).
 * Browser-stream only.
 */
export function useBeaconOnUnload({ streamId, streamerId, enabled }: UseBeaconOnUnloadArgs) {
  useEffect(() => {
    if (!enabled || !streamId || !streamerId) return;
    if (typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function") return;

    const handler = () => {
      const blob = new Blob(
        [JSON.stringify({ streamId, streamerId })],
        { type: "application/json" },
      );
      navigator.sendBeacon(`${ApiService.baseURL}/stream/beacon`, blob);
    };

    window.addEventListener("pagehide", handler);
    return () => window.removeEventListener("pagehide", handler);
  }, [enabled, streamId, streamerId]);
}
