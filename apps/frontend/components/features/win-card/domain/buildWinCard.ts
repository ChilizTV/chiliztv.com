import { formatUnits } from 'viem';

import { FINISHED_MATCH_STATUSES, type MyBet } from '@/components/features/dashboard/domain/bets';
import { MARKET_TYPE_HASHES, fmtSelectionWithMarket } from '@/lib/contracts/markets';

import type { WinCardBet, WinCardData } from './types';
import { teamCode, winCrowd } from './logic';

const USDC_DECIMALS = 6;

function usdc(raw: string | null): number {
  if (!raw) return 0;
  return Number(formatUnits(BigInt(raw), USDC_DECIMALS));
}

function marketHash(marketType: string | null): string | undefined {
  if (!marketType) return undefined;
  return MARKET_TYPE_HASHES[marketType as keyof typeof MARKET_TYPE_HASHES] ?? undefined;
}

/**
 * A bet earns a win card only when it genuinely won a *played, settled* match
 * with a positive net: WON status + a payout strictly above the stake + the
 * match finished on the pitch. The match-finished guard is what stops a card
 * from ever showing for a fixture that hasn't happened yet.
 */
export function isWinCardEligible(bet: MyBet): boolean {
  if (bet.status !== 'WON' || bet.payoutAmount == null || bet.match == null) return false;
  if (!FINISHED_MATCH_STATUSES.has(bet.match.status ?? '')) return false;
  try {
    return BigInt(bet.payoutAmount) > BigInt(bet.stakeAmount);
  } catch {
    return false;
  }
}

/**
 * Builds the win-card view model for every match the user won on, from their
 * full bet list. Bets are grouped by match contract; stakes and payouts are
 * cumulated, and each winning bet is listed. Ordered by most recent kickoff.
 */
export function buildWinCards(
  bets: ReadonlyArray<MyBet>,
  player: { pseudo: string; rank: string | null },
): WinCardData[] {
  const byContract = new Map<string, MyBet[]>();
  for (const bet of bets) {
    if (!isWinCardEligible(bet)) continue;
    const key = bet.contractAddress.toLowerCase();
    (byContract.get(key) ?? byContract.set(key, []).get(key)!).push(bet);
  }

  const cards: WinCardData[] = [];
  for (const [, group] of byContract) {
    const card = buildOne(group, player);
    if (card) cards.push(card);
  }
  return cards.sort((a, b) => b.matchId - a.matchId);
}

/** Single-match card from its winning bets. Exported for the live page (one match). */
export function buildWinCard(
  bets: ReadonlyArray<MyBet>,
  player: { pseudo: string; rank: string | null },
): WinCardData | null {
  return buildOne(bets.filter(isWinCardEligible), player);
}

function buildOne(
  group: ReadonlyArray<MyBet>,
  player: { pseudo: string; rank: string | null },
): WinCardData | null {
  if (group.length === 0) return null;
  const first = group[0];
  const match = first.match!;

  const items: WinCardBet[] = group.map((bet) => {
    const stake = usdc(bet.stakeAmount);
    const payout = usdc(bet.payoutAmount);
    return {
      id: `${bet.contractAddress}:${bet.marketId}:${bet.outcome}`,
      label: fmtSelectionWithMarket(
        Number(bet.outcome),
        marketHash(bet.marketType),
        bet.line ?? 0,
        match.homeTeamName,
        match.awayTeamName,
      ),
      stake,
      payout,
      mult: stake > 0 ? payout / stake : 0,
    };
  });

  const stake = items.reduce((s, b) => s + b.stake, 0);
  const payout = items.reduce((s, b) => s + b.payout, 0);
  const mult = stake > 0 ? payout / stake : 0;

  const score =
    match.homeScore != null && match.awayScore != null ? `${match.homeScore}–${match.awayScore}` : null;
  const round = match.status === 'FT' || match.status === 'AET' || match.status === 'PEN' ? 'Settled' : 'Live';

  return {
    matchId: match.apiFootballId,
    contractAddress: first.contractAddress,
    stake,
    payout,
    mult,
    eyebrow: 'PredCast',
    stage: [match.leagueName, round].filter(Boolean).join(' · '),
    home: { code: teamCode(match.homeTeamName), name: match.homeTeamName, logo: match.homeTeamLogo ?? null },
    away: { code: teamCode(match.awayTeamName), name: match.awayTeamName, logo: match.awayTeamLogo ?? null },
    score,
    bets: items,
    crowd: winCrowd(mult),
    pseudo: player.pseudo,
    rank: player.rank,
  };
}
