"use client";

import { Icon } from "@/components/common/Icon";
import { GuardFrame } from "./GuardFrame";
import { GuardCard } from "./GuardCard";

/** Auth failure — the wallet has been disconnected; offers a way back to connect. */
export function AuthErrorScreen({ message, onBack }: Readonly<{ message: string; onBack: () => void }>) {
  return (
    <GuardFrame>
      <GuardCard className="border-[#E8001D]/30 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#E8001D]/40 bg-[#E8001D]/10">
          <Icon n="alertTriangle" s={20} className="text-[#FF1737]" />
        </div>
        <h1 className="font-display mt-5 text-[28px] font-extrabold uppercase leading-none text-[#FF1737]">
          Authentication failed
        </h1>
        <p className="font-mono-ctv mt-3 text-[10px] uppercase tracking-[0.12em] leading-relaxed text-white/45">{message}</p>
        <p className="mx-auto mt-2 max-w-[290px] text-[12px] font-light leading-relaxed text-white/55">
          The wallet has been disconnected. Nothing was signed.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="font-mono-ctv mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#E8001D] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#FF1737]"
        >
          <Icon n="arrowLeft" s={13} />
          <span>Back to wallet connect</span>
        </button>
      </GuardCard>
    </GuardFrame>
  );
}
