'use client';

import Link from 'next/link';

import { usePlayerDetail } from '@/hooks/api/usePlayers';
import { Eyebrow } from '@/components/common/Eyebrow';
import { Icon } from '@/components/common/Icon';
import { CopyButton } from '@/components/common/CopyButton';
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

  const { player } = data;

  return (
    <div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <Eyebrow>Player</Eyebrow>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="font-display text-[32px] font-extrabold uppercase leading-none tracking-[-0.01em] text-white">
              {player.username ?? `${player.wallet.slice(0, 6)}…${player.wallet.slice(-4)}`}
            </h1>
            <span className="font-mono-ctv text-[11px] tracking-[0.04em] text-white/45">{player.wallet}</span>
            <CopyButton value={player.wallet} label="Copy wallet address" />
          </div>
        </div>
        <Link
          href="/moderation/bans"
          className="font-mono-ctv inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#E8001D]/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#FF1737] transition-colors hover:border-[#E8001D] hover:bg-[#E8001D]/10"
        >
          <Icon n="ban" s={11} />
          <span>Ban wallet</span>
        </Link>
      </div>
      <PlayerSummaryCards player={player} />
      <PlayerBetsTable bets={data.recentBets} />
    </div>
  );
}
