'use client';

import { usePlayerDetail } from '@/hooks/api/usePlayers';
import { PlayerSummaryCards } from './PlayerSummaryCards';
import { PlayerBetsTable } from './PlayerBetsTable';

export function PlayerDetailView({ wallet }: Readonly<{ wallet: string }>) {
  const { data, isLoading, isError } = usePlayerDetail(wallet);

  if (isLoading) {
    return <p className="font-mono-ctv mt-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>;
  }
  if (isError || !data) {
    return (
      <p className="font-mono-ctv mt-6 text-[11px] uppercase tracking-[0.14em] text-[#E8001D]">
        Player not found — no bets indexed for this wallet.
      </p>
    );
  }

  return (
    <div>
      <PlayerSummaryCards player={data.player} />
      <PlayerBetsTable bets={data.recentBets} />
    </div>
  );
}
