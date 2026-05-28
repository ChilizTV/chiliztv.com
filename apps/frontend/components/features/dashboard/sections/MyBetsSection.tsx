'use client';

import { useMemo, useState } from 'react';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { SectionHeadDash } from '../components/SectionHeadDash';
import { ClaimAllBanner } from '../components/ClaimAllBanner';
import { TabPill } from '../components/TabPill';
import { BetRow } from '../components/BetRow';
import { EmptyCard } from '../components/EmptyState';
import { EMPTY_ICONS } from '../components/EmptyIcons';
import { Pagination } from '../components/Pagination';
import { useLocallyClaimed } from '../hooks/useLocallyClaimed';
import { useClaimAll } from '../hooks/useClaimAll';
import { useMyBets } from '../hooks/useMyBets';
import { usePagination } from '../hooks/usePagination';
import {
    isBetOnHiddenMarket,
    sumClaimablePayouts,
    type BetFilter,
} from '../domain/bets';

interface MyBetsSectionProps {
    readonly wallet: `0x${string}` | undefined;
    readonly onPlaceFirstBet?: () => void;
    readonly onWatchLive?: () => void;
}

const FILTERS: ReadonlyArray<{ key: BetFilter; label: string }> = [
    { key: 'all',         label: 'All' },
    { key: 'pending',     label: 'Pending' },
    { key: 'won',         label: 'Won' },
    { key: 'lost',        label: 'Lost' },
    { key: 'claimable',   label: 'Claimable' },
    { key: 'refundable',  label: 'Refundable' },
];

export function MyBetsSection({ wallet, onPlaceFirstBet, onWatchLive }: MyBetsSectionProps) {
    const { assetDecimals } = usePoolDecimals();
    const [filter, setFilter] = useState<BetFilter>('all');
    const pagination = usePagination({ resetKey: filter });
    const { map: claimedOverlay } = useLocallyClaimed();

    const query = useMyBets({
        user: wallet,
        filter,
        limit: pagination.pageSize,
        offset: pagination.offset,
    });

    // Hide bets on the CORRECT_SCORE market — UX policy (D1, runbook).
    // The backend's `total`/`statusCounts` still include them; rare in practice
    // since placement is blocked in the UI.
    const visibleBets = useMemo(
        () => (query.data?.bets ?? []).filter((b) => !isBetOnHiddenMarket(b)),
        [query.data?.bets],
    );

    const statusCounts = query.data?.statusCounts;
    const total = query.data?.total ?? 0;

    const claimableTotal = useMemo(
        () => sumClaimablePayouts(visibleBets, assetDecimals, claimedOverlay),
        [visibleBets, assetDecimals, claimedOverlay],
    );

    // Claim-all batch — wires the banner to the multi-market sequential tx.
    // Scoped to the current page; users with > pageSize claimables should
    // bump the size or paginate.
    const { run: runClaimAll, busy: claimAllBusy, progress: claimAllProgress } = useClaimAll(visibleBets);

    const showEmptyState = (statusCounts?.all ?? 0) === 0 && !query.isLoading;

    if (showEmptyState) {
        return (
            <section id="bets" className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-4 pt-20 sm:px-14">
                <SectionHeadDash
                    eyebrow="Predictions · Markets"
                    title={
                        <>
                            Your <span className="text-[#E8001D]">positions.</span>
                        </>
                    }
                    lead="Stakes settle on-chain via the prediction contracts. Claim your wins anytime — funds sit in the contract until you do."
                />
                <EmptyCard
                    icon={EMPTY_ICONS.ticket}
                    title="No predictions yet"
                    lead="Pick a live or upcoming match and make your first prediction. Stake USDC or any fan token — the smart contract holds the funds until settlement."
                    cta="Discover matches →"
                    onCta={onPlaceFirstBet}
                    secondary="Watch live now"
                    onSecondary={onWatchLive}
                    tip="Tip: stake with a fan token to multiply your team support"
                />
            </section>
        );
    }

    return (
        <section id="bets" className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-4 pt-20 sm:px-14">
            <SectionHeadDash
                eyebrow="Predictions · Markets"
                title={
                    <>
                        Your <span className="text-[#E8001D]">positions.</span>
                    </>
                }
                lead="Stakes settle on-chain via the prediction contracts. Claim your wins anytime — funds sit in the contract until you do."
            />

            {(statusCounts?.claimable ?? 0) > 0 && (
                <div className="mb-6">
                    <ClaimAllBanner
                        count={statusCounts!.claimable}
                        totalUSDC={claimableTotal}
                        onClaim={runClaimAll}
                        busy={claimAllBusy}
                        progress={claimAllProgress}
                    />
                </div>
            )}

            <div className="mb-5 flex flex-wrap items-center gap-2">
                {FILTERS.map((f) => (
                    <TabPill
                        key={f.key}
                        active={filter === f.key}
                        onClick={() => setFilter(f.key)}
                        badge={statusCounts?.[f.key]}
                    >
                        {f.label}
                    </TabPill>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111]">
                <div
                    className="font-mono-ctv hidden items-center gap-4 border-b border-[#1E1E1E] bg-[#0d0d0d] px-6 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 sm:grid"
                    style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) auto' }}
                >
                    <div>Match</div>
                    <div>Stake</div>
                    <div>Odds</div>
                    <div>Payout</div>
                    <div className="text-right">Status</div>
                </div>

                {visibleBets.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <div className="font-display text-[20px] font-extrabold uppercase tracking-[-0.01em] text-white">
                            Nothing here yet
                        </div>
                        <div className="font-mono-ctv mt-2 text-[11px] uppercase tracking-[0.16em] text-white/45">
                            No predictions match this filter
                        </div>
                    </div>
                ) : (
                    visibleBets.map((b) => <BetRow key={`${b.txHash}:${b.logIndex}`} bet={b} />)
                )}

                <Pagination
                    page={pagination.page}
                    pageSize={pagination.pageSize}
                    total={total}
                    onPrev={pagination.prevPage}
                    onNext={pagination.nextPage}
                    onPageSizeChange={pagination.setPageSize}
                />
            </div>
        </section>
    );
}
