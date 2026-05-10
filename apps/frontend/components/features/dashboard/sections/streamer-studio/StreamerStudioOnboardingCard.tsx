'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDeployStreamerWallet } from '@/hooks/api';
import { DashEyebrow } from '../../components/DashEyebrow';
import { EMPTY_ICONS } from '../../components/EmptyIcons';

interface StreamerStudioOnboardingCardProps {
    /** Connected wallet address — required to deploy a `StreamWallet`. */
    readonly wallet: `0x${string}` | undefined;
    /** Fired after a successful deployment so the parent re-fetches `hasWallet`. */
    readonly onDeployed?: (walletAddress: string) => void;
}

const STEPS: ReadonlyArray<{ icon: keyof typeof EMPTY_ICONS; title: string; lead: string }> = [
    {
        icon: 'satellite',
        title: 'Deploy your StreamWallet',
        lead: 'A per-streamer ERC-1967 proxy created on-chain — gas paid by the platform.',
    },
    {
        icon: 'cash',
        title: 'Receive tips & subs',
        lead: 'Donations and recurring payouts settle in USDC inside your wallet within seconds.',
    },
    {
        icon: 'coin',
        title: 'Withdraw anytime',
        lead: 'You stay in custody — no platform vault, no lock-ups, no auto-renew.',
    },
];

/**
 * "Your studio" pre-onboarding card — shown when the connected wallet
 * has no `StreamWallet` proxy yet. The CTA hits the backend admin proxy
 * (`POST /stream-wallet/deploy/:streamerAddress`) so the user pays no
 * gas. Idempotent server-side: hitting it again returns the existing
 * proxy, so a stale UI state doesn't trigger a double-deploy.
 */
export function StreamerStudioOnboardingCard({ wallet, onDeployed }: StreamerStudioOnboardingCardProps) {
    const deploy = useDeployStreamerWallet(wallet);
    const [walletConfirmed, setWalletConfirmed] = useState<string | null>(null);

    const handleDeploy = async () => {
        if (!wallet || deploy.isPending) return;
        try {
            const result = await deploy.mutateAsync();
            setWalletConfirmed(result.wallet);
            toast.success(result.created ? 'Your studio is live' : 'Studio already deployed', {
                description: `${result.wallet.slice(0, 10)}…${result.wallet.slice(-6)}`,
            });
            onDeployed?.(result.wallet);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Deployment failed';
            toast.error('Could not deploy your StreamWallet', { description: message });
        }
    };

    const isConnected = !!wallet;
    const ctaLabel = !isConnected
        ? 'Connect a wallet first'
        : deploy.isPending
            ? 'Deploying on Chiliz…'
            : walletConfirmed
                ? 'Studio deployed ✓'
                : 'Deploy my studio · free';

    return (
        <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                <div className="min-w-0">
                    <DashEyebrow>Streamer · Onboarding</DashEyebrow>
                    <h3
                        className="font-display mt-3 leading-[0.95] tracking-[-0.015em] text-white"
                        style={{ fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 800 }}
                    >
                        Open your studio in <span className="text-[#E8001D]">one click.</span>
                    </h3>
                    <p className="mt-3 max-w-md text-[13px] font-light leading-[1.6] text-white/65">
                        Your <span className="font-mono-ctv text-white">StreamWallet</span> is a non-custodial
                        contract owned by you. We deploy and pay gas — once it&apos;s live, every tip and subscription
                        you receive lands inside it instantly.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleDeploy}
                            disabled={!isConnected || deploy.isPending || !!walletConfirmed}
                            className="font-mono-ctv inline-flex items-center gap-2 rounded-md bg-[#E8001D] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D] disabled:cursor-not-allowed disabled:bg-[#3A3A3A] disabled:hover:translate-y-0"
                            style={{
                                boxShadow:
                                    !isConnected || deploy.isPending || !!walletConfirmed
                                        ? 'none'
                                        : '0 8px 24px rgba(232,0,29,0.25)',
                            }}
                        >
                            {deploy.isPending && <Loader2 size={12} className="animate-spin" />}
                            {ctaLabel}
                            {!walletConfirmed && !deploy.isPending && isConnected && <span aria-hidden> →</span>}
                        </button>
                        <span className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/45">
                            ERC-1967 · ChilizSpicy
                        </span>
                    </div>
                </div>

                <div className="min-w-0">
                    <ol className="flex flex-col gap-3">
                        {STEPS.map((step, i) => (
                            <li
                                key={step.title}
                                className="flex items-start gap-4 rounded-lg border border-[#1E1E1E] bg-[#0d0d0d] p-4"
                            >
                                <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-md bg-[#E8001D]/10 text-[#E8001D]">
                                    <span style={{ width: 16, height: 16 }}>{EMPTY_ICONS[step.icon]}</span>
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                                            Step {i + 1}
                                        </span>
                                    </div>
                                    <div className="font-display mt-0.5 text-[14px] font-bold uppercase tracking-tight text-white">
                                        {step.title}
                                    </div>
                                    <p className="mt-1 text-[12px] font-light leading-[1.5] text-white/55">
                                        {step.lead}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}
