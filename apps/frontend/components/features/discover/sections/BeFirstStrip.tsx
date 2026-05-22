"use client";

import { BeFirstCard, Eyebrow } from "../components";
import type { FlatMatch } from "../domain";

interface BeFirstStripProps {
    readonly matches: FlatMatch[];
    readonly now: Date | null;
    readonly onPredict?: (match: FlatMatch) => void;
}

/**
 * "Empty pools · seed the market" strip — renders below the league sections
 * on the discover page. Surfaces upcoming matches whose WINNER pool is
 * still at zero so users can nudge the first stake. Pure presentation;
 * empty-pool filtering happens upstream in {@link useMatchesByPoolStatus}.
 */
export function BeFirstStrip({ matches, now, onPredict }: BeFirstStripProps) {
    if (matches.length === 0) return null;
    return (
        <section className="relative z-[3]">
            <div className="mx-auto max-w-[1400px] px-8 pb-12 sm:px-14">
                <div className="mb-5 flex items-end justify-between gap-4">
                    <div className="flex flex-col gap-3">
                        <Eyebrow color="#2dd4a4">Be the first to stake</Eyebrow>
                        <h3
                            className="font-display m-0 uppercase leading-[0.92] tracking-[-0.01em] text-white"
                            style={{ fontSize: "clamp(22px, 2.6vw, 32px)", fontWeight: 800 }}
                        >
                            Empty pools · seed the market
                        </h3>
                    </div>
                    <span className="font-mono-ctv hidden max-w-[300px] text-right text-[10px] uppercase leading-[1.5] tracking-[0.14em] text-white/45 sm:inline">
                        No one staked yet. Reference odds shown for context — your stake sets the first implied probability.
                    </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {matches.map((m) => (
                        <BeFirstCard key={m.id} match={m} now={now} onPredict={onPredict} />
                    ))}
                </div>
            </div>
        </section>
    );
}
