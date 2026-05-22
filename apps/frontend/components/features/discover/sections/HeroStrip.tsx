"use client";

import { useHeroData } from "../hooks";
import { EpochPrizePoolTile } from "./EpochPrizePoolTile";
import { HeroHeadline } from "./HeroHeadline";

/**
 * `/browse` hero — composes the static pitch headline on the left with the
 * data-driven epoch prize-pool tile on the right. Pure composition; data
 * fetching is isolated in {@link useHeroData}, presentation is split into
 * single-responsibility files (CLAUDE.md §3.2).
 */
export function HeroStrip() {
    const hero = useHeroData();
    return (
        <section className="relative z-[3]">
            <div className="mx-auto grid max-w-[1400px] gap-8 px-8 pb-8 pt-14 sm:px-14 sm:pb-12 sm:pt-20 lg:grid-cols-[1.4fr_1fr]">
                <HeroHeadline />
                <EpochPrizePoolTile hero={hero} />
            </div>
        </section>
    );
}
