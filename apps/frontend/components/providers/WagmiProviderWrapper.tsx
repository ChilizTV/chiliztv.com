// components/providers/WagmiProviderWrapper.tsx
"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { createConfig, http } from 'wagmi';
import { chiliz, spicy } from 'wagmi/chains';
import { baseSepolia } from '@chiliztv/blockchain/chains';

const queryClient = new QueryClient();

// Determine network from environment variable
const NETWORK = (process.env.NEXT_PUBLIC_NETWORK || process.env.NETWORK || 'testnet').toLowerCase();
const isTestnet = NETWORK !== 'mainnet';

// Use testnet (spicy) or mainnet (chiliz) based on environment
// Spécifier explicitement le RPC URL pour Spicy Testnet
const SPICY_RPC_URL = 'https://spicy-rpc.chiliz.com';
const CHILIZ_RPC_URL = 'https://rpc.ankr.com/chiliz';
const BASE_SEPOLIA_RPC_URL = 'https://sepolia.base.org';


const config = isTestnet
  ? createConfig({
      chains: [spicy, baseSepolia],
      multiInjectedProviderDiscovery: false,
      transports: {
        [spicy.id]: http(SPICY_RPC_URL),
        [baseSepolia.id]: http(BASE_SEPOLIA_RPC_URL),
      } as Record<number, ReturnType<typeof http>>,
    })
  : createConfig({
      chains: [chiliz],
      multiInjectedProviderDiscovery: false,
      transports: {
        [chiliz.id]: http(CHILIZ_RPC_URL),
      } as Record<typeof chiliz.id, ReturnType<typeof http>>,
    });

export function WagmiProviderWrapper({ children }: { readonly children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
    );
}
