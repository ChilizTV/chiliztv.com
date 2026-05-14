"use client";

import {
  DynamicContextProvider,
  SortWallets,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import * as React from "react";
import { WagmiProviderWrapper } from "./WagmiProviderWrapper";

const LOGO_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/Logo_FINAL.svg`
    : "https://chiliztv.com/Logo_FINAL.svg";

export default function DynamicProviderWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isDevelopment =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_STAGING === "true";
  const disableOnramps =
    process.env.NEXT_PUBLIC_DISABLE_ONRAMPS === "true" || isDevelopment;

  const environmentId =
    process.env.NEXT_PUBLIC_STAGING === "true"
      ? process.env.NEXT_PUBLIC_STAGING_DYNAMIC_ENVIRONMENT_ID ??
        process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ??
        ""
      : process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? "";

  const dynamicSettings = {
    environmentId,
    walletConnectors: [EthereumWalletConnectors],
    walletsFilter: SortWallets([
      "socios",
      "metamask",
      "coinbase",
      "walletconnect",
      "phantom",
    ]),
    appName: "ChilizTV",
    initialAuthenticationMode: "connect-and-sign" as const,
    overrides: {
      evmNetworks: [
        {
          chainId: 88882,
          networkId: 88882,
          chainName: "Chiliz Spicy Testnet",
          name: "Chiliz Spicy Testnet",
          rpcUrls: ["https://spicy-rpc.chiliz.com"],
          blockExplorerUrls: ["https://testnet.chiliscan.com"],
          nativeCurrency: { name: "CHZ", symbol: "CHZ", decimals: 18 },
          iconUrls: [LOGO_URL],
          isTestnet: true,
        },
        {
          chainId: 88888,
          networkId: 88888,
          chainName: "Chiliz Chain",
          name: "Chiliz Chain",
          rpcUrls: ["https://rpc.ankr.com/chiliz"],
          blockExplorerUrls: ["https://chiliscan.com"],
          nativeCurrency: { name: "CHZ", symbol: "CHZ", decimals: 18 },
          iconUrls: [LOGO_URL],
          isTestnet: false,
        },
      ],
    },
    settings: { appEnvironment: "production" as const },
    ...(disableOnramps && { disableOnramps: true }),
    ...(isDevelopment && { disableAnalytics: true, debugMode: true }),
    events: {},
  };

  return (
    <WagmiProviderWrapper>
      <DynamicContextProvider settings={dynamicSettings}>
        <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
      </DynamicContextProvider>
    </WagmiProviderWrapper>
  );
}
