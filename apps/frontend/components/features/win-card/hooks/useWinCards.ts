'use client';

import { useMemo } from 'react';

import { useMyBets } from '@/components/features/dashboard/hooks/useMyBets';
import { useUserProfile } from '@/hooks/api/useUserProfile';
import { useMyLeaderboardPosition } from '@/hooks/api/useMyLeaderboardPosition';

import { buildWinCards } from '../domain/buildWinCard';
import type { WinCardData } from '../domain/types';

const WON_PAGE = 100;

function shortAddr(w: string): string {
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

/**
 * All of the connected wallet's win cards (one per won match), most recent
 * first. Reuses the bets feed (filter=won) plus profile + leaderboard rank.
 */
export function useWinCards(wallet: string | undefined): {
  cards: WinCardData[];
  byContract: Map<string, WinCardData>;
  isLoading: boolean;
} {
  const { data: bets, isLoading } = useMyBets({ user: wallet, filter: 'won', limit: WON_PAGE });
  const { data: profile } = useUserProfile(wallet);
  const { data: position } = useMyLeaderboardPosition(wallet);

  return useMemo(() => {
    if (!wallet || !bets?.bets) return { cards: [], byContract: new Map(), isLoading };
    const pseudo = profile?.username ?? shortAddr(wallet);
    const rank = position?.rank != null ? `#${position.rank} this week` : null;
    const cards = buildWinCards(bets.bets, { pseudo, rank });
    const byContract = new Map(cards.map((c) => [c.contractAddress.toLowerCase(), c]));
    return { cards, byContract, isLoading };
  }, [wallet, bets, profile, position, isLoading]);
}
