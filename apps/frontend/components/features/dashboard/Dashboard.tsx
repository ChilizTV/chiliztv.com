'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBalance } from 'wagmi';
import { useFanTokens } from '@/hooks/useFanTokens';
import { useLpPosition } from '@/hooks/useLpPosition';
import { PoolDepositDialog } from '@/components/features/discover/components/PoolDepositDialog';
import { BackgroundFX } from '@/components/features/discover/sections/BackgroundFX';
import { useDashboardUser } from './hooks/useDashboardUser';
import { useIsStreamer } from './hooks/useIsStreamer';
import { useMyBets } from './hooks/useMyBets';
import { useDashboardStats } from './hooks/useDashboardStats';
import { useDashboardActivity } from './hooks/useDashboardActivity';
import { useDashboardStreamers } from './hooks/useDashboardStreamers';
import { usePortfolioCalculation } from './hooks/usePortfolioCalculation';
import { DashboardHero } from './sections/DashboardHero';
import { QuickActionsStrip, type QuickActionKey } from './sections/QuickActionsStrip';
import { StatsHero } from './sections/StatsHero';
import { LpPositionPanel } from './sections/LpPositionPanel';
import { MyBetsSection } from './sections/MyBetsSection';
import { MainTabs } from './sections/MainTabs';
import { StreamerRevenuePanel } from './sections/StreamerRevenuePanel';
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
    const lp = useLpPosition(user.wallet);
    const stats = useDashboardStats({ wallet: user.wallet });
    const myBets = useMyBets({ user: user.wallet, filter: 'all', limit: 200 });
    const activity = useDashboardActivity({ wallet: user.wallet });
    const streamers = useDashboardStreamers({ userId: user.userId, wallet: user.wallet });

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

    const [poolDialogOpen, setPoolDialogOpen] = useState(false);

    const handleQuickAction = (key: QuickActionKey) => {
        switch (key) {
            case 'discover':
                router.push('/browse');
                return;
            case 'pool':
            case 'swap':
                scrollToId('pool');
                return;
            case 'bets':
                scrollToId('bets');
                return;
            case 'withdraw':
                scrollToId('streamer-revenue');
                return;
        }
    };

    const goToDiscover = () => router.push('/browse');
    const openPool = () => setPoolDialogOpen(true);

    return (
        <main className="relative bg-[#0A0A0A]">
            <BackgroundFX />
            <DashboardHero user={user} />
            <QuickActionsStrip isStreamer={isStreamer} onAction={handleQuickAction} />
            <StatsHero stats={stats.data} onPlaceFirstBet={goToDiscover} onJoinPool={openPool} />
            <LpPositionPanel lp={lp} onDeposit={openPool} onWithdraw={openPool} />
            <MyBetsSection
                bets={myBets.data?.bets ?? []}
                onPlaceFirstBet={goToDiscover}
                onWatchLive={goToDiscover}
            />
            <MainTabs
                tokens={tokens}
                activity={activity.rows}
                followed={streamers.followed}
                subscribed={streamers.subscribed}
                onSwap={openPool}
                onPlaceFirstBet={goToDiscover}
                onBrowseStreamers={goToDiscover}
            />
            {isStreamer && (
                <div id="streamer-revenue">
                    <StreamerRevenuePanel wallet={user.wallet} />
                </div>
            )}

            <PoolDepositDialog open={poolDialogOpen} onClose={() => setPoolDialogOpen(false)} />
        </main>
    );
}
