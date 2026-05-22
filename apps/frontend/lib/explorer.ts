import { networkType } from '@/config/chiliz.config';

/**
 * Block-explorer base URL for the current Chiliz network. Returns the Spicy
 * testnet explorer in `testnet` mode, ChiliScan mainnet otherwise. Mirrors
 * the URLs declared in `packages/blockchain/src/chains/index.ts`.
 */
const BASE = networkType === 'mainnet'
    ? 'https://chiliscan.com'
    : 'https://testnet.chiliscan.com';

/** Build the explorer URL for a transaction hash. */
export function txExplorerUrl(txHash: string): string {
    return `${BASE}/tx/${txHash}`;
}

/** Build the explorer URL for an address. */
export function addressExplorerUrl(address: string): string {
    return `${BASE}/address/${address}`;
}
