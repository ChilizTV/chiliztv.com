'use client';

import { useState, type FormEvent } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useAuth } from '@/providers/auth-provider';
import { useUserProfile, useUpsertUserProfile } from '@/hooks/api';

// Backend mirror — see UpsertUserProfileUseCase. Surfaced here to give the
// user a precise error before hitting the network.
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{1,30}$/;

/**
 * Blocking modal that pops the first time a connected wallet has no resolved
 * username, so donations / chat / dashboards never render the truncated
 * address fallback when the user has never set a handle.
 */
export function UsernameSetupGuard(): React.JSX.Element | null {
    const { primaryWallet } = useDynamicContext();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const wallet = primaryWallet?.address;
    const { data: profile, isLoading: profileLoading } = useUserProfile(wallet);
    const upsert = useUpsertUserProfile();

    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    // Local latch — once the upsert returns 200 we hide the modal
    // immediately even if the cached profile hasn't refreshed yet.
    // Prevents the "modal stays open after submit" race when the
    // background refetch is slow or silently fails.
    const [dismissed, setDismissed] = useState(false);

    const needsSetup =
        isAuthenticated &&
        !authLoading &&
        !profileLoading &&
        !!wallet &&
        !profile?.username;

    if (!needsSetup || dismissed) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!USERNAME_PATTERN.test(trimmed)) {
            setError('1-30 chars · letters, digits, . _ -');
            return;
        }
        setError(null);
        upsert.mutate(
            { username: trimmed, avatarUrl: null },
            {
                onSuccess: () => setDismissed(true),
                onError: () => setError('Failed to save — please try again'),
            },
        );
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="username-setup-title"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm"
        >
            <div className="w-full max-w-md rounded-xl border border-[#1E1E1E] bg-[#111] p-7">
                <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
                    <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
                    Pick your name
                </div>
                <h2
                    id="username-setup-title"
                    className="font-display mt-5 text-[28px] font-extrabold uppercase leading-none tracking-[-0.01em] text-white"
                >
                    One last step.
                </h2>
                <p className="mt-3 text-[14px] font-light leading-relaxed text-white/65">
                    Pick a username — donations, predictions and chat show this instead of your wallet address.
                </p>
                <form onSubmit={handleSubmit} className="mt-6">
                    <input
                        type="text"
                        autoFocus
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        maxLength={30}
                        placeholder="your-name"
                        className="font-mono-ctv w-full rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-3 text-[13px] text-white outline-none focus:border-[#E8001D]"
                    />
                    {error && (
                        <p className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.14em] text-[#FF1737]">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={upsert.isPending || value.trim().length < 1}
                        className="font-mono-ctv mt-4 w-full rounded-md bg-[#E8001D] py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737] disabled:cursor-not-allowed disabled:bg-[#3A3A3A] disabled:hover:translate-y-0"
                        style={{ boxShadow: upsert.isPending ? 'none' : '0 8px 24px rgba(232,0,29,0.25)' }}
                    >
                        {upsert.isPending ? 'Saving…' : 'Save and continue →'}
                    </button>
                </form>
            </div>
        </div>
    );
}
