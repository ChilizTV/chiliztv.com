"use client";

import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";

/** Step 1 — wallet connection, only reachable after the gate. */
export function ConnectWalletScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-[#1E1E1E] bg-[#111] p-8 text-center">
        <h1 className="font-display text-[28px] font-extrabold uppercase leading-none text-white">
          Connect wallet
        </h1>
        <p className="mt-2 text-[12px] font-light text-white/55">
          Sign-in requires a granted admin wallet. You will be asked to sign a
          one-time message to prove ownership.
        </p>
        <DynamicConnectButton>
          <span className="font-mono-ctv mt-6 inline-block w-full cursor-pointer rounded-md bg-[#E8001D] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-all hover:bg-[#FF1737]">
            Connect wallet
          </span>
        </DynamicConnectButton>
      </div>
    </main>
  );
}
