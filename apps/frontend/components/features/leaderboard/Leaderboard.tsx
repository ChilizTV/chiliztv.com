'use client';

import { TICKER_ITEMS } from './domain';
import {
    BackgroundFX,
    Hero,
    NotifyCTA,
    PreviewTable,
    PrizeBreakdown,
    StatsStrip,
    Ticker,
} from './sections';

/** Smooth-scroll a target ID into view (helper for the hero CTAs). */
function scrollToId(id: string): void {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Leaderboard teaser page.
 *
 * Section order:
 *  1. Ticker (top marquee)
 *  2. Hero (headline + TBA pool card)
 *  3. StatsStrip (4-cell summary)
 *  4. PreviewTable (mock ranking + watermark)
 *  5. PrizeBreakdown (4 medal cards)
 *  6. NotifyCTA (email signup)
 *
 * The page is a self-contained surface — the global `<Header />` + `<Footer />`
 * wrap it from `app/leaderboard/page.tsx`. `BackgroundFX` is fixed and
 * `pointer-events-none`, so it never interferes with header clicks.
 */
export function Leaderboard() {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#0A0A0A] text-white">
            <BackgroundFX />

            <Ticker items={TICKER_ITEMS} />

            <main className="relative z-[4]">
                <Hero
                    onNotify={() => scrollToId('lb-notify')}
                    onRules={() => scrollToId('lb-split')}
                />
                <StatsStrip />
                <PreviewTable />
                <PrizeBreakdown />
                <NotifyCTA />
            </main>
        </div>
    );
}
