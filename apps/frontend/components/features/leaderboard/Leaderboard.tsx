'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { TICKER_ITEMS } from './domain';
import {
    BackgroundFX,
    ClaimBanner,
    Hero,
    MyPosition,
    NotifyCTA,
    PreviewTable,
    PrizeBreakdown,
    StatsStrip,
    Ticker,
} from './sections';

function scrollToId(id: string): void {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Live leaderboard page — pulls top-N from the backend, the connected
 * wallet's rank from `/leaderboard/me/:wallet`, and any claimable epochs
 * from `/leaderboard/me/:wallet/claimable`. The `<ClaimBanner />` only
 * renders when there's at least one open epoch.
 */
export function Leaderboard() {
    const { primaryWallet } = useDynamicContext();
    const wallet = primaryWallet?.address;

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#0A0A0A] text-white">
            <BackgroundFX />

            <Ticker items={TICKER_ITEMS} />

            <main className="relative z-2">
                <Hero
                    onNotify={() => scrollToId('lb-notify')}
                    onRules={() => scrollToId('lb-split')}
                />
                <ClaimBanner wallet={wallet} />
                <StatsStrip />
                <MyPosition wallet={wallet} />
                <PreviewTable />
                <PrizeBreakdown />
                <NotifyCTA />
            </main>
        </div>
    );
}
