'use client';

import { Wallet } from 'lucide-react';

/**
 * Reassurance note in the go-live console — streamers don't need any
 * on-chain setup before broadcasting, the wallet deploys lazily.
 */
export function StreamWalletNote() {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-[#1E1E1E] bg-[#0d0d0d] px-3 py-2.5">
      <Wallet aria-hidden size={13} className="mt-px shrink-0 text-white/35" />
      <p className="font-mono-ctv m-0 text-[10px] uppercase leading-[1.6] tracking-[0.12em] text-white/45">
        Your stream wallet will be deployed once you&apos;ll receive your first
        donation, or you can deploy it yourself on your dashboard.
      </p>
    </div>
  );
}
