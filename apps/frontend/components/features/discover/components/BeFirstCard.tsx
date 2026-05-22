"use client";

import { getCountdown, type FlatMatch } from "../domain";
import { TeamLogo } from "./TeamLogo";

const SEED_GREEN = "#2dd4a4";

/**
 * Dashed empty-pool card used by {@link BeFirstStrip}. Surfaces upcoming
 * matches whose WINNER pool is still at zero — the user's stake will set
 * the first implied probability. Reference odds (sharp-book DB hint) are
 * shown italic so they read as "context", not "live data".
 */
export function BeFirstCard({
    match,
    now,
    onPredict,
}: {
    match: FlatMatch;
    now: Date | null;
    onPredict?: (match: FlatMatch) => void;
}) {
    const odds = match.odds;
    return (
        <button
            type="button"
            onClick={() => onPredict?.(match)}
            className="group relative flex flex-col gap-4 rounded-xl border border-dashed border-[#2A2A2A] bg-[#0e0e0e] p-5 text-left transition-all hover:-translate-y-px hover:border-[#2dd4a4]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a4]"
        >
            <div className="flex items-center justify-between gap-2">
                <span className="font-mono-ctv truncate text-[9px] uppercase tracking-[0.18em] text-white/45">
                    {match.leagueName}
                </span>
                <span className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {getCountdown(match.kickoffAt, now)}
                </span>
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col items-start gap-1">
                    <TeamLogo name={match.homeTeam.name} logo={match.homeTeam.logoUrl} size={32} />
                    <span className="font-display max-w-[120px] truncate text-[14px] font-bold uppercase tracking-[-0.005em] text-white">
                        {match.homeTeam.name}
                    </span>
                </div>
                <span className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/35">
                    vs
                </span>
                <div className="flex flex-col items-end gap-1">
                    <TeamLogo name={match.awayTeam.name} logo={match.awayTeam.logoUrl} size={32} />
                    <span className="font-display max-w-[120px] truncate text-right text-[14px] font-bold uppercase tracking-[-0.005em] text-white">
                        {match.awayTeam.name}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#1A1A1A] pt-3">
                <span className="font-mono-ctv text-[9px] italic uppercase tracking-[0.16em] text-white/45">
                    Reference odds · sharp books
                </span>
                {odds && odds.home !== null && odds.draw !== null && odds.away !== null ? (
                    <div className="font-mono-ctv grid grid-cols-3 gap-2 text-[12px] italic">
                        {[
                            { code: "1", value: odds.home },
                            { code: "X", value: odds.draw },
                            { code: "2", value: odds.away },
                        ].map(({ code, value }) => (
                            <div
                                key={code}
                                className="flex items-center justify-between rounded-md border border-[#1E1E1E] px-2 py-1.5 text-white/55"
                            >
                                <span className="text-[9px] not-italic uppercase tracking-[0.16em] text-white/35">
                                    {code}
                                </span>
                                <span>×{value!.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <span className="font-mono-ctv text-[10px] uppercase tracking-[0.14em] text-white/35">
                        No reference yet — your stake sets the price
                    </span>
                )}
            </div>

            <div className="font-mono-ctv mt-1 flex items-center justify-between text-[10px] uppercase tracking-[0.14em]">
                <span style={{ color: SEED_GREEN }}>Seed the pool</span>
                <span className="text-white/85 transition-colors group-hover:text-white">Stake →</span>
            </div>
        </button>
    );
}
