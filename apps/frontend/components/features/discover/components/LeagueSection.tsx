import { fmtUsdcCompact, type FlatMatch } from "../domain";
import { MatchCardDonut } from "./MatchCardDonut";

interface LeagueSectionProps {
    readonly league: string;
    readonly logo: string | null;
    readonly matches: FlatMatch[];
    readonly now: Date | null;
    /** Sum of `totalPool` for every match in the league (raw USDC). */
    readonly totalPool: bigint;
    readonly onPredict: (m: FlatMatch) => void;
}

/**
 * League band on `/browse` — design header (league name + match count +
 * "Total staked $X" on the right) over a 3-col grid of stake cards. Pure
 * presentational; the parent owns filtering, grouping, and the live pool
 * snapshot that feeds `totalPool`.
 */
export function LeagueSection({
    league,
    logo,
    matches,
    now,
    totalPool,
    onPredict,
}: LeagueSectionProps) {
    return (
        <section className="mb-12">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#1A1A1A] pb-3">
                <div className="flex items-baseline gap-4">
                    {logo ? (
                        // Remote league crests — same rationale as TeamLogo.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logo}
                            alt=""
                            className="h-5 w-5 shrink-0 self-center object-contain"
                            style={{ filter: "grayscale(100%) brightness(1.4)" }}
                        />
                    ) : null}
                    <h3 className="font-display m-0 text-[22px] font-extrabold uppercase leading-none tracking-[-0.01em] text-white">
                        {league}
                    </h3>
                    <span className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/45">
                        {matches.length} {matches.length === 1 ? "match" : "matches"}
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
                        Total staked
                    </span>
                    <span className="font-display text-[14px] font-bold tracking-[-0.005em] text-white">
                        {fmtUsdcCompact(totalPool)}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((m) => (
                    <MatchCardDonut
                        key={m.id}
                        match={m}
                        now={now}
                        onPredict={onPredict}
                    />
                ))}
            </div>
        </section>
    );
}
