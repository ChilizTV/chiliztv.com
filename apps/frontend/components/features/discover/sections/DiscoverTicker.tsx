import { useMemo } from "react";
import { getMinute, isLive, type FlatMatch } from "../domain";
import { fmtMatchScore } from "@chiliztv/domain/matches/format/matchScore";

const abbr = (name: string) =>
  name.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase();

const fmtKickoff = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

export function DiscoverTicker({
  matches,
  now,
}: {
  matches: FlatMatch[];
  /** `null` until the client clock has been initialised post-hydration. */
  now: Date | null;
}) {
  // Show every match the API returned, regardless of status. Live first,
  // then upcoming sorted by kickoff, then anything else (finished, etc.)
  // so the most relevant items are at the front of the marquee loop.
  const items = useMemo(() => {
    const live = matches.filter((m) => isLive(m.status));
    const upcoming = matches
      .filter((m) => m.status === "NS")
      .sort(
        (a, b) =>
          new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
      );
    const liveIds = new Set(live.map((m) => m.id));
    const upcomingIds = new Set(upcoming.map((m) => m.id));
    const rest = matches.filter(
      (m) => !liveIds.has(m.id) && !upcomingIds.has(m.id),
    );
    return [...live, ...upcoming, ...rest];
  }, [matches]);

  // Duplicate so the keyframe seamlessly translates by -50%.
  const loop = [...items, ...items];

  return (
    <div
      // Sticks just under the global Header (sticky top-0 / ~72px tall) so
      // the live action stays visible while the user scrolls the page.
      className="sticky top-[72px] z-40 overflow-hidden border-y border-[#1E1E1E] bg-[#111]/95 py-[14px] backdrop-blur-sm"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
      }}
      aria-label="Live matches ticker"
    >
      <div
        className="ctv-marquee font-mono-ctv flex gap-12 whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.06em] text-white/65"
        role="marquee"
      >
        {loop.map((m, i) => {
          const live = isLive(m.status);
          const minuteValue = live ? getMinute(m.status, m.kickoffAt, now, m.elapsed) : null;
          const minuteLabel =
            minuteValue !== null ? `${minuteValue}'` : "LIVE";
          // Ticker = compact context. We display "1-0" (no em-dash spacing)
          // and append "AET" / "PEN" as a tiny suffix when the match went to
          // extra time. The fmtMatchScore helper provides the variant; we
          // keep the ticker's existing hyphen separator to save horizontal
          // space (em-dash + spaces would push the ticker wider).
          const scoreText = m.score ? `${m.score.home}-${m.score.away}` : "vs";
          const fmt = fmtMatchScore({
            status: m.status,
            score: m.score,
            scoreBreakdown: m.scoreBreakdown,
          });
          const aetPen = fmt.variant === 'aet' ? 'AET' : fmt.variant === 'pen' ? 'PEN' : null;
          return (
            <span key={`${m.id}-${i}`} className="inline-flex items-center gap-3">
              {live ? (
                <span className="inline-flex items-center gap-1.5 font-bold text-[#E8001D]">
                  <span className="ctv-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#E8001D]" />
                  {minuteLabel}
                </span>
              ) : (
                <span className="text-white/45">
                  {fmtKickoff(m.kickoffAt)}
                </span>
              )}
              <span className="font-bold text-white">
                {abbr(m.homeTeam.name)}{" "}
                <span className="font-bold text-[#E8001D]">{scoreText}</span>
                {aetPen && (
                  <span className="ml-1 font-bold text-white/50">{aetPen}</span>
                )}{" "}
                {abbr(m.awayTeam.name)}
              </span>
              <span className="text-[#2A2A2A]">·</span>
              <span className="text-white/45">{m.leagueName}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
