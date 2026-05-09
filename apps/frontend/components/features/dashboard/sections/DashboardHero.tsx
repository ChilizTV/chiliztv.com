'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { useUserUpdateRequest } from '@dynamic-labs/sdk-react-core';
import { apiClient } from '@/lib/api/client';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { DashEyebrow } from '../components/DashEyebrow';
import { truncAddr } from '../domain/formatters';
import type { DashboardUser } from '../hooks/useDashboardUser';
import { useKycVerified } from '../hooks/useKycVerified';

// SelfProtocol QR uses libs that drag wallet/QR deps; lazy-load it client-side only when the user clicks "Verify identity".
const SelfProtocolQRCode = dynamic(() => import('@/components/selfProtcol/SelfProtocolQRCode'), { ssr: false });

interface DashboardHeroProps {
    readonly user: DashboardUser;
}

interface AvatarUploadResponse {
    readonly success: boolean;
    readonly url: string;
    readonly version: number;
}

export function DashboardHero({ user }: DashboardHeroProps) {
    const [, setKycVerified] = useKycVerified(user.wallet);
    const [kycOpen, setKycOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    // Cache-buster local to this session — Dynamic stores the clean URL (its
    // metadata validator rejects `?` / `=`), so we append `?v=…` only at render
    // time to force the browser to refetch right after a re-upload.
    const [avatarBust, setAvatarBust] = useState<number | null>(null);
    const { updateUserWithModal, updateUser } = useUserUpdateRequest();

    const photoUrl = user.profilePicture
        ? avatarBust != null
            ? `${user.profilePicture}?v=${avatarBust}`
            : user.profilePicture
        : null;

    const handleEditUsername = () => updateUserWithModal(['username']);

    const handleCopyWallet = async () => {
        if (!user.wallet) return;
        try {
            await navigator.clipboard.writeText(user.wallet);
            toast.success('Wallet copied');
        } catch {
            toast.error('Could not copy wallet');
        }
    };

    const handleUploadAvatar = async (file: File) => {
        if (!user.wallet) return;
        setUploading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            // Axios infers multipart/form-data from FormData (with the boundary).
            const res = await apiClient.post<AvatarUploadResponse>('/users/avatar', form);
            // Persist the bare URL on Dynamic (no query string — their validator
            // rejects URLs containing `?` / `=`). Bust the local img cache via
            // a render-time suffix so the new bytes appear instantly.
            await updateUser({ metadata: { profilePicture: res.url } } as never);
            setAvatarBust(res.version);
            toast.success('Profile photo updated');
        } catch (err) {
            toast.error('Photo upload failed', {
                description: err instanceof Error ? err.message.slice(0, 200) : undefined,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            await apiClient.delete('/users/avatar');
            // Dynamic's metadata API throws on `null` ("Cannot convert undefined
            // or null to object"). Empty string clears it for our purposes —
            // the read-side treats falsy as "no photo".
            await updateUser({ metadata: { profilePicture: '' } } as never);
            setAvatarBust(null);
            toast.success('Profile photo removed');
        } catch (err) {
            toast.error('Could not remove photo', {
                description: err instanceof Error ? err.message.slice(0, 200) : undefined,
            });
        }
    };

    return (
        <section className="relative z-[4] mx-auto max-w-[1400px] px-8 pt-14 pb-10 sm:px-14 sm:pt-20">
            <DashEyebrow>Account · On-chain</DashEyebrow>

            <div className="mt-7 grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
                <div className="flex items-start gap-6">
                    <ProfileAvatar
                        seed={user.wallet ?? user.username}
                        label={user.username}
                        size={120}
                        photoUrl={photoUrl}
                        uploading={uploading}
                        onUpload={handleUploadAvatar}
                        onRemove={handleRemoveAvatar}
                    />
                    <div className="min-w-0 flex-1">
                        <h1
                            className="font-display m-0 uppercase leading-[0.88] tracking-[-0.015em] text-white"
                            style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800 }}
                        >
                            Hello, <span className="text-[#E8001D]">{user.username}</span>
                        </h1>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <div className="font-mono-ctv flex items-center gap-2 rounded-md border border-[#1E1E1E] bg-[#111] px-3 py-2 text-[12px] font-semibold tabular-nums text-white">
                                <span className="text-white/35">Wallet</span>
                                <span className="text-white">{truncAddr(user.wallet)}</span>
                                <button
                                    type="button"
                                    aria-label="Copy wallet"
                                    onClick={handleCopyWallet}
                                    className="ml-1 text-white/35 transition-colors hover:text-[#E8001D]"
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" />
                                        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                                    </svg>
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={handleEditUsername}
                                className="font-mono-ctv inline-flex items-center gap-2 rounded-md border border-[#1E1E1E] bg-transparent px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55 transition-colors hover:border-[#E8001D] hover:text-white"
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                </svg>
                                Edit username
                            </button>
                            {!user.kycVerified ? (
                                <button
                                    type="button"
                                    onClick={() => setKycOpen(true)}
                                    className="font-mono-ctv inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors"
                                    style={{ borderColor: '#F5C518', color: '#F5C518', background: 'rgba(245,197,24,0.06)' }}
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    Verify identity (KYC)
                                </button>
                            ) : (
                                <span
                                    className="font-mono-ctv inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                                    style={{ borderColor: 'rgba(45,212,164,0.4)', color: '#2dd4a4', background: 'rgba(45,212,164,0.06)' }}
                                >
                                    ✓ Identity verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <p className="max-w-md text-[15px] font-light leading-[1.6] text-white/65 lg:justify-self-end">
                    Your <span className="text-white">wallet, predictions, pool position, fan tokens</span> and on-chain history — all settled on Chiliz, no admin in the middle.
                </p>
            </div>

            {kycOpen && (
                <SelfProtocolQRCode
                    onClose={() => setKycOpen(false)}
                    onSuccess={() => {
                        setKycVerified(true);
                        toast.success('Identity verified');
                    }}
                />
            )}
        </section>
    );
}
