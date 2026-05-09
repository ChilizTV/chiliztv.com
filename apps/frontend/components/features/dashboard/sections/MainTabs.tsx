'use client';

import { useMemo, useState } from 'react';
import { SectionHeadDash } from '../components/SectionHeadDash';
import { TabPill } from '../components/TabPill';
import { TokenCardDash, type TokenCardData } from '../components/TokenCardDash';
import { ActivityRow } from '../components/ActivityRow';
import { FollowedStreamerRow } from '../components/FollowedStreamerRow';
import { SubscribedRow } from '../components/SubscribedRow';
import { DashEyebrow } from '../components/DashEyebrow';
import { EmptyCard, InlineEmpty } from '../components/EmptyState';
import { EMPTY_ICONS } from '../components/EmptyIcons';
import { applyActivityFilter, ACTIVITY_FILTERS, type ActivityRow as ActivityRowType, type ActivityFilterKey } from '../domain/activity';
import type { FollowedStreamer, SubscribedStreamer } from '../hooks/useDashboardStreamers';

type TabKey = 'tokens' | 'activity' | 'streamers';

interface MainTabsProps {
    readonly tokens: ReadonlyArray<TokenCardData>;
    readonly activity: ReadonlyArray<ActivityRowType>;
    readonly followed: ReadonlyArray<FollowedStreamer>;
    readonly subscribed: ReadonlyArray<SubscribedStreamer>;
    readonly onSwap?: () => void;
    readonly onPlaceFirstBet?: () => void;
    readonly onBrowseStreamers?: () => void;
}

export function MainTabs({ tokens, activity, followed, subscribed, onSwap, onPlaceFirstBet, onBrowseStreamers }: MainTabsProps) {
    const [tab, setTab] = useState<TabKey>('tokens');
    const [actFilter, setActFilter] = useState<ActivityFilterKey>('all');

    const filteredAct = useMemo(() => applyActivityFilter(activity, actFilter), [activity, actFilter]);
    const liveCount = followed.filter((s) => s.live).length;

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
                <TabPill active={tab === 'streamers'} onClick={() => setTab('streamers')} badge={followed.length}>Streamers</TabPill>
            </div>

            {tab === 'tokens' && (
                tokens.length === 0 ? (
                    <EmptyCard
                        icon={EMPTY_ICONS.coin}
                        title="No fan tokens"
                        lead="Hold any club's $TOKEN to multiply your support and stake on its matches. Swap CHZ or USDC into a fan token via Kayen."
                        cta="Open the swap →"
                        onCta={onSwap}
                        tip="Supported: $PSG · $BAR · $JUV · $ATM · $ACM · $INTER · $GAL · $POR …"
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tokens.map((t) => <TokenCardDash key={t.sym} token={t} />)}
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
                            {filteredAct.length === 0 ? (
                                <div className="font-mono-ctv px-6 py-12 text-center text-[11px] uppercase tracking-[0.16em] text-white/45">
                                    No activity for this filter
                                </div>
                            ) : (
                                filteredAct.map((row) => <ActivityRow key={row.id} row={row} />)
                            )}
                        </div>
                    </>
                )
            )}

            {tab === 'streamers' && (
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <DashEyebrow dim>Following · {followed.length}</DashEyebrow>
                            <div className="flex items-center gap-3">
                                {liveCount > 0 && (
                                    <span className="font-mono-ctv inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#E8001D]">
                                        <span className="ctv-pulse-dot inline-block h-[5px] w-[5px] rounded-full bg-[#E8001D]" style={{ boxShadow: '0 0 6px #E8001D' }} />
                                        {liveCount} live
                                    </span>
                                )}
                            </div>
                        </div>
                        {followed.length === 0 ? (
                            <InlineEmpty
                                compact
                                icon={EMPTY_ICONS.heart}
                                title="No streamers followed"
                                lead="Follow streamers to get a heads-up the moment they go live, and stack their matches in your dashboard."
                                cta="Browse streamers →"
                                onCta={onBrowseStreamers}
                            />
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                                {[...followed].sort((a, b) => Number(b.live) - Number(a.live)).map((s) => (
                                    <FollowedStreamerRow key={s.id} streamer={s} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6">
                        <div className="mb-5">
                            <DashEyebrow dim>Subscribed · {subscribed.length}</DashEyebrow>
                        </div>
                        {subscribed.length === 0 ? (
                            <InlineEmpty
                                compact
                                icon={EMPTY_ICONS.bell}
                                title="No subscriptions"
                                lead="Pay streamers monthly in USDC to unlock premium streams, member chats and tipping perks."
                                cta="Find streamers →"
                                onCta={onBrowseStreamers}
                            />
                        ) : (
                            <div className="flex flex-col">
                                {subscribed.map((s) => <SubscribedRow key={s.id} sub={s} />)}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

