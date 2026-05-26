import { useEffect, useRef } from "react";

/**
 * `setInterval` that pauses when the document is hidden and resumes with an
 * immediate fire when it becomes visible again. The `callback` ref is updated
 * on every render so the running closure always sees fresh state.
 *
 * Pass `delayMs = null` (or `enabled = false`) to fully suspend — useful when
 * the caller has not yet resolved its dependencies (e.g. waiting for a
 * `streamerId`).
 */
export function useVisibilityAwareInterval(
  callback: () => void,
  delayMs: number | null,
  enabled = true,
): void {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || delayMs === null) return;
    if (typeof document === "undefined") return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      cbRef.current();
      interval = setInterval(() => cbRef.current(), delayMs);
    };

    const stop = () => {
      if (!interval) return;
      clearInterval(interval);
      interval = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [delayMs, enabled]);
}
