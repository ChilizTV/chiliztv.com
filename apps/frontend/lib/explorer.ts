import { chilizConfig } from '@/config/chiliz.config';

/** Spicy testnet (88882) — Chiliscan moved off scan.chiliz.com. */
const TESTNET_EXPLORER = 'https://testnet.chiliscan.com';

/** Chiliz mainnet (88888). */
const MAINNET_EXPLORER = 'https://chiliscan.com';

/**
 * Block explorer base for the currently-configured chain. The frontend reads
 * `chilizConfig.chainId` so this picks Spicy testnet automatically when the
 * env file is pointing at testnet.
 */
export function explorerBase(): string {
  return chilizConfig.chainId === 88888 ? MAINNET_EXPLORER : TESTNET_EXPLORER;
}

export function explorerTx(txHash: string | undefined): string | undefined {
  if (!txHash) return undefined;
  return `${explorerBase()}/tx/${txHash}`;
}

export function explorerAddress(addr: string | undefined): string | undefined {
  if (!addr) return undefined;
  return `${explorerBase()}/address/${addr}`;
}
