import type { FlatMatch } from "../domain";
import { MatchCard } from "./MatchCard";

/**
 * Section header (eyebrow + league name + count) plus a 3-col grid of
 * MatchCards for that league. Used when the user picks a `league_*` sort
 * mode in the FilterBar.
 *
 * Pure presentational: navigation goes through the `onPredict` / `onWatch`
 * callbacks wired by the parent.
 */
export function LeagueSection({
  league,
  logo,
  matches,
  now,
  onPredict,
  onWatch,
}: {
  league: string;
  logo: string | null;
  matches: FlatMatch[];
  now: Date | null;
  onPredict: (m: FlatMatch) => void;
  onWatch: (m: FlatMatch) => void;
}) {
  return (
    <section className="mb-10">
      <header className="mb-4 flex items-center gap-3">
        <span aria-hidden className="block h-0.5 w-4 flex-shrink-0 bg-[#E8001D]" />
        {logo ? (
          // Remote league crests — see TeamLogo for the same rationale.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            className="h-5 w-5 flex-shrink-0 object-contain"
            style={{ filter: "grayscale(100%) brightness(1.4)" }}
          />
        ) : null}
        <h3 className="font-display text-[18px] font-bold uppercase tracking-[-0.005em] text-white">
          {league}
        </h3>
        <div className="h-px flex-1 bg-[#1E1E1E]" />
        <span className="font-mono-ctv flex-shrink-0 rounded-md border border-[#1E1E1E] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
          {matches.length} match{matches.length > 1 ? "es" : ""}
        </span>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            now={now}
            onPredict={onPredict}
            onWatch={onWatch}
          />
        ))}
      </div>
    </section>
  );
}
