'use client';

import { useEffect, useRef } from 'react';

import { useWinCards } from '../hooks/useWinCards';
import { isWinSeen, markWinSeen } from '../domain/seen';
import { useWinCardModal } from './WinCardModalProvider';

type Scope = { readonly kind: 'dashboard' } | { readonly kind: 'match'; readonly contractAddress: string };

/**
 * Auto-shows the win card once per (wallet, match): on the dashboard for the
 * most recent unseen win, on a live page for that match's win. Renders nothing.
 */
export function WinCardAutoTrigger({ wallet, scope }: Readonly<{ wallet: string | undefined; scope: Scope }>) {
  const { cards, byContract } = useWinCards(wallet);
  const { open } = useWinCardModal();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current || !wallet) return;
    const target =
      scope.kind === 'dashboard'
        ? cards.find((c) => !isWinSeen(wallet, c.matchId))
        : byContract.get(scope.contractAddress.toLowerCase());
    if (!target) return;
    if (scope.kind === 'match' && isWinSeen(wallet, target.matchId)) return;

    firedRef.current = true;
    markWinSeen(wallet, target.matchId);
    open(target);
  }, [wallet, scope, cards, byContract, open]);

  return null;
}
