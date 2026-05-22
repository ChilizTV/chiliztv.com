'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBalance } from 'wagmi';
import { useFanTokens } from '@/hooks/useFanTokens';
import { BackgroundFX } from '@/components/features/discover/sections/BackgroundFX';
import { useDashboardUser } from './hooks/useDashboardUser';
import { useIsStreamer } from './hooks/useIsStreamer';
import { useDashboardStats } from './hooks/useDashboardStats';
import { useDashboardActivity } from './hooks/useDashboardActivity';
import { usePortfolioCalculation } from './hooks/usePortfolioCalculation';
import { DashboardHero } from './sections/DashboardHero';
import { QuickActionsStrip, type QuickActionKey } from './sections/QuickActionsStrip';
import { StatsHero } from './sections/StatsHero';
import { MyBetsSection } from './sections/MyBetsSection';
import { MainTabs } from './sections/MainTabs';
import { StreamerStudioSection } from './sections/streamer-studio';
import type { TokenCardData } from './components/TokenCardDash';

function scrollToId(id: string): void {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo({ top: y, behavior: 'smooth' });
}

/** Single profile / portfolio surface — orchestrates every dashboard section. */
export function Dashboard() {
    const router = useRouter();
    const user = useDashboardUser();
    const { isStreamer } = useIsStreamer({ wallet: user.wallet });
    const stats = useDashboardStats({ wallet: user.wallet });
    const activity = useDashboardActivity({ wallet: user.wallet });

    // Token holdings + prices for the Fan Tokens tab.
    const { tokenBalances } = useFanTokens(user.wallet, !!user.wallet);
    const { data: chzBal } = useBalance({ address: user.wallet });
    const { realFanTokens } = usePortfolioCalculation(tokenBalances, chzBal?.formatted, user.wallet);

    const tokens: ReadonlyArray<TokenCardData> = useMemo(
        () =>
            realFanTokens.map((t) => ({
                sym: t.symbol,
                name: t.team,
                logo: t.logo,
                qty: t.quantity,
                priceUSD: t.currentPrice > 0 ? t.currentPrice : null,
                change24h: typeof t.change === 'number' ? t.change : null,
                spark: null,
            })),
        [realFanTokens],
    );

    const handleQuickAction = (key: QuickActionKey) => {
        switch (key) {
            case 'discover':
                router.push('/browse');
                return;
            case 'bets':
                scrollToId('bets');
                return;
            case 'swap':
                // Swap CHZ/fan-token → USDC happens inside MarketBetDialog;
                // bounce the user to a match where they can use it.
                router.push('/browse');
                return;
            case 'withdraw':
                scrollToId('streamer-revenue');
                return;
        }
    };

    const goToDiscover = () => router.push('/browse');

    return (
        <main className="relative bg-[#0A0A0A]">
            <BackgroundFX />
            <DashboardHero user={user} />
            <QuickActionsStrip isStreamer={isStreamer} onAction={handleQuickAction} />
            <StatsHero stats={stats.data} onPlaceFirstBet={goToDiscover} />
            <MyBetsSection
                wallet={user.wallet}
                onPlaceFirstBet={goToDiscover}
                onWatchLive={goToDiscover}
            />
            <MainTabs
                tokens={tokens}
                activity={activity.rows}
                userId={user.userId}
                wallet={user.wallet}
                onPlaceFirstBet={goToDiscover}
                onBrowseStreamers={goToDiscover}
            />
            <div id="streamer-revenue">
                <StreamerStudioSection wallet={user.wallet} />
            </div>
        </main>
    );
}
