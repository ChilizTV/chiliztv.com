'use client';

import { useMemo, useState } from 'react';
import { useFollowedStreamers, useSubscriberHistory, useUserProfilesBatch } from '@/hooks/api';
import { SectionHeadDash } from '../components/SectionHeadDash';
import { TabPill } from '../components/TabPill';
import { TokenCardDash, type TokenCardData } from '../components/TokenCardDash';
import { ActivityRow } from '../components/ActivityRow';
import { FollowedStreamerRow } from '../components/FollowedStreamerRow';
import { SubscribedRow } from '../components/SubscribedRow';
import { Pagination } from '../components/Pagination';
import { DashEyebrow } from '../components/DashEyebrow';
import { EmptyCard, InlineEmpty } from '../components/EmptyState';
import { EMPTY_ICONS } from '../components/EmptyIcons';
import { usePagination } from '../hooks/usePagination';
import { applyActivityFilter, ACTIVITY_FILTERS, type ActivityRow as ActivityRowType, type ActivityFilterKey } from '../domain/activity';
import type { FollowedStreamer, SubscribedStreamer } from '../domain/streamers';

type TabKey = 'tokens' | 'activity' | 'streamers';

interface MainTabsProps {
    readonly tokens: ReadonlyArray<TokenCardData>;
    readonly activity: ReadonlyArray<ActivityRowType>;
    readonly userId: string | undefined;
    readonly wallet: `0x${string}` | undefined;
    readonly onSwap?: () => void;
    readonly onPlaceFirstBet?: () => void;
    readonly onBrowseStreamers?: () => void;
}

export function MainTabs({ tokens, activity, userId, wallet, onSwap, onPlaceFirstBet, onBrowseStreamers }: MainTabsProps) {
    const [tab, setTab] = useState<TabKey>('tokens');
    const [actFilter, setActFilter] = useState<ActivityFilterKey>('all');

    const followedPagination = usePagination({ resetKey: userId });
    const subscribedPagination = usePagination({ resetKey: wallet });
    const tokensPagination = usePagination({ resetKey: wallet });
    const activityPagination = usePagination({ resetKey: actFilter });

    const followedQuery = useFollowedStreamers(userId, {
        limit: followedPagination.pageSize,
        offset: followedPagination.offset,
    });
    const subscribedQuery = useSubscriberHistory(wallet ?? '', {
        limit: subscribedPagination.pageSize,
        offset: subscribedPagination.offset,
    });

    const followed = useMemo<FollowedStreamer[]>(() => {
        return (followedQuery.data?.items ?? []).map((f) => ({
            id: f.id,
            streamerId: f.streamerId,
            name: f.streamerName,
            league: null,
            live: false,
        }));
    }, [followedQuery.data?.items]);

    const subscriberWallets = useMemo(
        () => (subscribedQuery.data?.subscriptions ?? []).map((s) => s.streamerAddress),
        [subscribedQuery.data?.subscriptions],
    );
    const { data: streamerProfiles } = useUserProfilesBatch(subscriberWallets);

    const subscribed = useMemo<SubscribedStreamer[]>(() => {
        return (subscribedQuery.data?.subscriptions ?? []).map((s) => {
            const profile = streamerProfiles?.get(s.streamerAddress.toLowerCase());
            return {
                id: s.id,
                streamerId: s.streamerAddress,
                name: profile?.username ?? `${s.streamerAddress.slice(0, 6)}…${s.streamerAddress.slice(-4)}`,
                renewsAt: new Date(s.endDate).getTime(),
                monthlyUSDC: null,
                active: s.isActive,
            };
        });
    }, [subscribedQuery.data?.subscriptions, streamerProfiles]);

    const followedTotal = followedQuery.data?.total ?? 0;
    const subscribedTotal = subscribedQuery.data?.total ?? 0;
    const liveCount = followed.filter((s) => s.live).length;

    const filteredAct = useMemo(() => applyActivityFilter(activity, actFilter), [activity, actFilter]);
    const activityTotal = filteredAct.length;
    const visibleActivity = useMemo(
        () => filteredAct.slice(activityPagination.offset, activityPagination.offset + activityPagination.pageSize),
        [filteredAct, activityPagination.offset, activityPagination.pageSize],
    );
    const tokensTotal = tokens.length;
    const visibleTokens = useMemo(
        () => tokens.slice(tokensPagination.offset, tokensPagination.offset + tokensPagination.pageSize),
        [tokens, tokensPagination.offset, tokensPagination.pageSize],
    );

    return (
        <section className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-4 pt-20 sm:px-14">
            <SectionHeadDash
                eyebrow="Holdings · History · Streamers"
                title={
                    <>
                        Your <span className="text-[#E8001D]">vault.</span>
                    </>
                }
            />

            <div className="mb-6 flex flex-wrap items-center gap-2">
                <TabPill active={tab === 'tokens'} onClick={() => setTab('tokens')} badge={tokens.length}>Fan Tokens</TabPill>
                <TabPill active={tab === 'activity'} onClick={() => setTab('activity')} badge={activity.length}>Activity</TabPill>
                <TabPill active={tab === 'streamers'} onClick={() => setTab('streamers')} badge={followedTotal}>Streamers</TabPill>
            </div>

            {tab === 'tokens' && (
                tokensTotal === 0 ? (
                    <EmptyCard
                        icon={EMPTY_ICONS.coin}
                        title="No fan tokens"
                        lead="Hold any club's $TOKEN to multiply your support and stake on its matches. Pick a match and stake in CHZ, USDC or any supported fan token — the swap to USDC runs inside the prediction flow."
                        cta="Find a match →"
                        onCta={onSwap}
                        tip="Supported: $PSG · $BAR · $JUV · $ATM · $ACM · $INTER · $GAL · $POR …"
                    />
                ) : (
                    <div className="overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111]">
                        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {visibleTokens.map((t) => <TokenCardDash key={t.sym} token={t} />)}
                        </div>
                        <Pagination
                            page={tokensPagination.page}
                            pageSize={tokensPagination.pageSize}
                            total={tokensTotal}
                            onPrev={tokensPagination.prevPage}
                            onNext={tokensPagination.nextPage}
                            onPageSizeChange={tokensPagination.setPageSize}
                        />
                    </div>
                )
            )}

            {tab === 'activity' && (
                activity.length === 0 ? (
                    <EmptyCard
                        icon={EMPTY_ICONS.pulse}
                        title="No on-chain history"
                        lead="Every prediction, claim, donation, subscription and pool deposit will land here, with a link to the transaction on Chiliz Scan."
                        cta="Make your first prediction →"
                        onCta={onPlaceFirstBet}
                        tip="Tx-level transparency · nothing is hidden"
                    />
                ) : (
                    <>
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/35">Filter</span>
                            {ACTIVITY_FILTERS.map((f) => (
                                <TabPill key={f.key} active={actFilter === f.key} onClick={() => setActFilter(f.key)}>
                                    {f.label}
                                </TabPill>
                            ))}
                        </div>
                        <div className="overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111]">
                            <div
                                className="font-mono-ctv hidden items-center gap-4 border-b border-[#1E1E1E] bg-[#0d0d0d] px-6 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 sm:grid"
                                style={{ gridTemplateColumns: '100px minmax(0,1fr) 140px 140px' }}
                            >
                                <div>Type</div>
                                <div>Description</div>
                                <div className="text-right">Amount</div>
                                <div className="text-right">Tx</div>
                            </div>
                            {activityTotal === 0 ? (
                                <div className="font-mono-ctv px-6 py-12 text-center text-[11px] uppercase tracking-[0.16em] text-white/45">
                                    No activity for this filter
                                </div>
                            ) : (
                                <>
                                    {visibleActivity.map((row) => <ActivityRow key={row.id} row={row} />)}
                                    <Pagination
                                        page={activityPagination.page}
                                        pageSize={activityPagination.pageSize}
                                        total={activityTotal}
                                        onPrev={activityPagination.prevPage}
                                        onNext={activityPagination.nextPage}
                                        onPageSizeChange={activityPagination.setPageSize}
                                    />
                                </>
                            )}
                        </div>
                    </>
                )
            )}

            {tab === 'streamers' && (
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <div className="overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111]">
                        <div className="flex items-center justify-between gap-3 border-b border-[#1E1E1E] px-6 py-5">
                            <DashEyebrow dim>Following · {followedTotal}</DashEyebrow>
                            {liveCount > 0 && (
                                <span className="font-mono-ctv inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#E8001D]">
                                    <span className="ctv-pulse-dot inline-block h-[5px] w-[5px] rounded-full bg-[#E8001D]" style={{ boxShadow: '0 0 6px #E8001D' }} />
                                    {liveCount} live
                                </span>
                            )}
                        </div>
                        {followedTotal === 0 ? (
                            <div className="p-6">
                                <InlineEmpty
                                    compact
                                    icon={EMPTY_ICONS.heart}
                                    title="No streamers followed"
                                    lead="Follow streamers to get a heads-up the moment they go live, and stack their matches in your dashboard."
                                    cta="Browse streamers →"
                                    onCta={onBrowseStreamers}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-2 p-6 sm:grid-cols-2">
                                    {[...followed].sort((a, b) => Number(b.live) - Number(a.live)).map((s) => (
                                        <FollowedStreamerRow key={s.id} streamer={s} />
                                    ))}
                                </div>
                                <Pagination
                                    page={followedPagination.page}
                                    pageSize={followedPagination.pageSize}
                                    total={followedTotal}
                                    onPrev={followedPagination.prevPage}
                                    onNext={followedPagination.nextPage}
                                    onPageSizeChange={followedPagination.setPageSize}
                                />
                            </>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111]">
                        <div className="border-b border-[#1E1E1E] px-6 py-5">
                            <DashEyebrow dim>Subscribed · {subscribedTotal}</DashEyebrow>
                        </div>
                        {subscribedTotal === 0 ? (
                            <div className="p-6">
                                <InlineEmpty
                                    compact
                                    icon={EMPTY_ICONS.bell}
                                    title="No subscriptions"
                                    lead="Pay streamers monthly in USDC to unlock premium streams, member chats and tipping perks."
                                    cta="Find streamers →"
                                    onCta={onBrowseStreamers}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col px-6">
                                    {subscribed.map((s) => <SubscribedRow key={s.id} sub={s} />)}
                                </div>
                                <Pagination
                                    page={subscribedPagination.page}
                                    pageSize={subscribedPagination.pageSize}
                                    total={subscribedTotal}
                                    onPrev={subscribedPagination.prevPage}
                                    onNext={subscribedPagination.nextPage}
                                    onPageSizeChange={subscribedPagination.setPageSize}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
