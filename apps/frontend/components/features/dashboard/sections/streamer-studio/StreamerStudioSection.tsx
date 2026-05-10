'use client';

import { useStreamWallet } from '@/hooks/useStreamWallet';
import { SectionHeadDash } from '../../components/SectionHeadDash';
import { StreamerStudioOnboardingCard } from './StreamerStudioOnboardingCard';
import { StreamerStudioRevenuePanel } from './StreamerStudioRevenuePanel';

interface StreamerStudioSectionProps {
    /** Connected user's wallet, or `undefined` when no wallet is connected. */
    readonly wallet: `0x${string}` | undefined;
}

/**
 * "Your studio" — the always-visible streamer surface on the dashboard.
 *
 * Branches at runtime:
 *  - No wallet connected → onboarding card with disabled CTA.
 *  - Wallet connected, no `StreamWallet` proxy yet → onboarding card with
 *    a working "Deploy my studio · free" CTA (admin-signed deployment).
 *  - Wallet connected, proxy deployed → revenue grid + recent donations.
 *
 * The deployment hook (`useDeployStreamerWallet`) invalidates the
 * stream-wallet queries on success, so once the tx confirms the
 * `useStreamWallet` re-fetch flips `hasWallet` to `true` and this section
 * automatically swaps to the revenue panel.
 */
export function StreamerStudioSection({ wallet }: StreamerStudioSectionProps) {
    const { hasWallet, refetchAll } = useStreamWallet({ streamerAddress: wallet });

    return (
        <section className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-4 pt-20 sm:px-14">
            <SectionHeadDash
                eyebrow="Streamer · Revenue"
                title={
                    <>
                        Your <span className="text-[#E8001D]">studio.</span>
                    </>
                }
            />

            {hasWallet ? (
                <StreamerStudioRevenuePanel wallet={wallet} />
            ) : (
                <StreamerStudioOnboardingCard
                    wallet={wallet}
                    onDeployed={() => {
                        // Force a fresh read of `hasWallet` so the section
                        // flips to the revenue panel without waiting for the
                        // next polling tick of the underlying queries.
                        refetchAll();
                    }}
                />
            )}
        </section>
    );
}
