"use client";

import { Icon } from "@/components/common/Icon";
import { GuardFrame } from "./GuardFrame";
import { GuardCard } from "./GuardCard";

/** Terminal state — connected wallet has no active admin grant. */
export function AccessDeniedScreen({
  wallet,
  onSwitchWallet,
}: Readonly<{ wallet: string; onSwitchWallet: () => void }>) {
  return (
    <GuardFrame>
      <GuardCard className="border-[#E8001D]/30 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#E8001D]/40 bg-[#E8001D]/10">
          <Icon n="shieldX" s={20} className="text-[#FF1737]" />
        </div>
        <h1 className="font-display mt-5 text-[28px] font-extrabold uppercase leading-none text-[#FF1737]">
          Access denied
        </h1>
        <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-1.5">
          <span className="font-mono-ctv text-[11px] tracking-[0.06em] text-white/70" title={wallet}>
            {wallet.slice(0, 6)}…{wallet.slice(-4)}
          </span>
          <span className="font-mono-ctv rounded border border-[#E8001D]/40 px-1.5 py-px text-[8px] font-bold uppercase tracking-[0.12em] text-[#FF1737]">
            No grant
          </span>
        </div>
        <p className="mx-auto mt-3 max-w-[290px] text-[12px] font-light leading-relaxed text-white/55">
          This wallet has no active admin grant. Grants are issued by a super admin.
        </p>
        <button
          type="button"
          onClick={onSwitchWallet}
          className="font-mono-ctv mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#2A2A2A] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white/75 transition-colors hover:border-[#3A3A3A] hover:text-white"
        >
          <Icon n="arrowLeft" s={13} />
          <span>Use another wallet</span>
        </button>
      </GuardCard>
    </GuardFrame>
  );
}
