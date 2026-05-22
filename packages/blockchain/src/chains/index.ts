import { defineChain } from 'viem';

// Canonical Multicall3 — deterministic CREATE2 deploy at the same address
// on every chain that has it. Verified live on Chiliz Spicy + mainnet.
// Required by `useReadContracts` (front) and `client.multicall(...)` (back);
// without it viem throws `client chain not configured. multicallAddress is required.`
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;

export const chilizSpicy = defineChain({
    id: 88882,
    name: 'Chiliz Spicy Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'CHZ',
        symbol: 'CHZ',
    },
    rpcUrls: {
        default: {
            http: ['https://spicy-rpc.chiliz.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Spicy Explorer',
            url: 'https://testnet.chiliscan.com',
        },
    },
    contracts: {
        multicall3: { address: MULTICALL3_ADDRESS },
    },
    testnet: true,
});

export const chilizMainnet = defineChain({
    id: 88888,
    name: 'Chiliz Chain',
    nativeCurrency: {
        decimals: 18,
        name: 'CHZ',
        symbol: 'CHZ',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.ankr.com/chiliz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'ChiliScan',
            url: 'https://chiliscan.com',
        },
    },
    contracts: {
        multicall3: { address: MULTICALL3_ADDRESS },
    },
    testnet: false,
});

export type ChilizNetworkType = 'testnet' | 'mainnet';

export function chainFor(networkType: ChilizNetworkType) {
    return networkType === 'mainnet' ? chilizMainnet : chilizSpicy;
}
