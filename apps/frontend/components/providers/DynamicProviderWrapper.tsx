"use client";

import {
    DynamicContextProvider,
    SortWallets,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import * as React from "react";
import { useRouter } from "next/navigation";
import { WagmiProviderWrapper } from "./WagmiProviderWrapper";
import { UserProfileAutoSync } from "./UserProfileAutoSync";


export default function DynamicSolanaWalletProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const router = useRouter();

    // Configuration conditionnelle pour le développement
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_STAGING === "true";
    const disableOnramps = process.env.NEXT_PUBLIC_DISABLE_ONRAMPS === "true" || isDevelopment;
    
    // Récupérer l'environment ID avec une valeur par défaut pour éviter undefined
    const environmentId = process.env.NEXT_PUBLIC_STAGING === "true"
        ? (process.env.NEXT_PUBLIC_STAGING_DYNAMIC_ENVIRONMENT_ID || process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "00000000-0000-0000-0000-000000000000")
        : (process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "00000000-0000-0000-0000-000000000000");
    
    const dynamicSettings = {
        environmentId: environmentId,
        walletConnectors: [EthereumWalletConnectors],
        walletsFilter: SortWallets(['socios', 'metamask', 'coinbase', 'walletconnect', 'phantom']),
        appName: 'Betcast',
        appLogoUrl: '/betcast-mark.svg',

        initialAuthenticationMode: 'connect-and-sign' as const,
        overrides: {
            evmNetworks: [
                {
                    chainId: 88882,
                    networkId: 88882,
                    chainName: 'Chiliz Spicy Testnet',
                    name: 'Chiliz Spicy Testnet',
                    rpcUrls: ['https://spicy-rpc.chiliz.com'],
                    blockExplorerUrls: ['https://testnet.chiliscan.com'],
                    nativeCurrency: {
                        name: 'CHZ',
                        symbol: 'CHZ',
                        decimals: 18,
                    },
                    iconUrls: ['/betcast-mark.svg'],
                    isTestnet: true,
                },
                {
                    chainId: 88888,
                    networkId: 88888,
                    chainName: 'Chiliz Chain',
                    name: 'Chiliz Chain',
                    rpcUrls: ['https://rpc.ankr.com/chiliz'],
                    blockExplorerUrls: ['https://chiliscan.com'],
                    nativeCurrency: {
                        name: 'CHZ',
                        symbol: 'CHZ',
                        decimals: 18,
                    },
                    iconUrls: ['/betcast-mark.svg'],
                    isTestnet: false,
                }
            ],
        },
        settings: {
            appEnvironment: 'production' as const,
        },
        // Désactiver les fonctionnalités problématiques en développement
        ...(disableOnramps && {
            disableOnramps: true,
        }),
        ...(isDevelopment && {
            disableAnalytics: true,
            debugMode: true,
        }),
        events: {
            onLogout: () => {
                router.push("/");
            },
            onAuthSuccess: () => {
                router.push("/browse");
            }
        }
    };

    return (
        <WagmiProviderWrapper>
            <DynamicContextProvider
            settings={dynamicSettings}
            >
                <DynamicWagmiConnector>
                    {/* Side-effect hook: push the connected user's name +
                        avatar into the backend `users` cache on every
                        auth state change so server-side renderers and
                        list views resolve real names instead of truncated
                        addresses. */}
                    <UserProfileAutoSync />
                    {children}
                </DynamicWagmiConnector>
            </DynamicContextProvider>
        </WagmiProviderWrapper>
    );
} 