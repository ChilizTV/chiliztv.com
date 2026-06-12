"use client";

import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";

import { Icon } from "@/components/common/Icon";
import { GuardFrame } from "./GuardFrame";
import { GuardCard } from "./GuardCard";

/** Step 1 — wallet connection, only reachable after the gate. */
export function ConnectWalletScreen() {
  return (
    <GuardFrame step={1}>
      <GuardCard className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#E8001D]/30 bg-[#E8001D]/10">
          <Icon n="wallet" s={20} className="text-[#FF1737]" />
        </div>
        <h1 className="font-display mt-5 text-[28px] font-extrabold uppercase leading-none text-white">
          Connect wallet
        </h1>
        <p className="mx-auto mt-3 max-w-[300px] text-[12px] font-light leading-relaxed text-white/55">
          Sign-in requires a granted admin wallet. You&apos;ll sign a one-time message to prove ownership.
        </p>
        <DynamicConnectButton>
          <span className="font-mono-ctv mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#E8001D] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#FF1737]">
            <Icon n="wallet" s={13} />
            <span>Connect wallet</span>
          </span>
        </DynamicConnectButton>
        <p className="font-mono-ctv mt-4 text-[9px] uppercase tracking-[0.14em] text-white/30">
          No transaction · no gas · just a signature
        </p>
      </GuardCard>
    </GuardFrame>
  );
}
