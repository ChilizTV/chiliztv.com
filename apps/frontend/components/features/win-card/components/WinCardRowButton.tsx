'use client';

import { useWinCards } from '../hooks/useWinCards';
import { useWinCardModal } from './WinCardModalProvider';

/**
 * "Win card" button for a won bet row. Opens the (aggregated) card for the
 * bet's match. Always available, regardless of the auto-show "seen" flag.
 */
export function WinCardRowButton({
  walletAddress,
  contractAddress,
}: Readonly<{ walletAddress: string; contractAddress: string }>) {
  const { byContract } = useWinCards(walletAddress);
  const { open } = useWinCardModal();
  const card = byContract.get(contractAddress.toLowerCase());
  if (!card) return null;

  return (
    <button
      type="button"
      onClick={() => open(card)}
      className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md border border-[#E8001D]/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FF1737] transition-colors hover:border-[#E8001D] hover:bg-[#E8001D]/10"
    >
      <span aria-hidden="true">★</span>
      Win card
    </button>
  );
}
