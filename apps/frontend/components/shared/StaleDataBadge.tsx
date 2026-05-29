/**
 * Amber pill rendered when `match.dataStale === true`. Surfaces the backend
 * degraded-mode signal (API-Football circuit open / quota exhausted) so users
 * understand the score they see might be older than the live game state.
 *
 * Visual conventions follow the Chiliz palette — amber `#F5C518` is reserved
 * for warning/pause cues throughout the app.
 */
interface StaleDataBadgeProps {
  /** When false or undefined the component renders nothing. */
  readonly stale?: boolean;
  /** Tooltip override; defaults to a generic explanation. */
  readonly title?: string;
}

export function StaleDataBadge({ stale, title }: StaleDataBadgeProps) {
  if (!stale) return null;
  return (
    <span
      className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]"
      style={{
        color: "#F5C518",
        borderColor: "rgba(245, 197, 24, 0.4)",
        background: "rgba(245, 197, 24, 0.06)",
      }}
      title={title ?? "Live scores temporarily unavailable — showing last known data."}
    >
      <span
        aria-hidden
        className="block h-1.5 w-1.5 rounded-full"
        style={{ background: "#F5C518" }}
      />
      Stale data
    </span>
  );
}
