"use client";

import { DynamicContextProvider, SortWallets } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import * as React from "react";

// `||` not `??`: Turbopack inlines an unset NEXT_PUBLIC_* as "" (not undefined),
// and an empty environmentId makes DynamicContextProvider throw during static
// prerender. The placeholder only keeps the build green — wallet connect needs
// the real id set in the Vercel project env at runtime.
const DYNAMIC_ENVIRONMENT_ID =
  process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "00000000-0000-0000-0000-000000000000";

export default function DynamicProviderWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
        walletsFilter: SortWallets(["metamask", "coinbase", "walletconnect"]),
        appName: "PredCast Admin",
        // Connect only — the admin JWT comes from our own challenge-signature
        // flow, not Dynamic's session.
        initialAuthenticationMode: "connect-only",
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
