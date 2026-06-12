"use client";

import { DynamicContextProvider, SortWallets } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import * as React from "react";

export default function DynamicProviderWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId:
          process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? "00000000-0000-0000-0000-000000000000",
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
