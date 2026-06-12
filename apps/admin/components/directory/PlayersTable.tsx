'use client';

import { useState } from 'react';
import Link from 'next/link';

import { usePlayers } from '@/hooks/api/usePlayers';
import { fmtUsdcRaw } from '@/lib/format/amounts';
import { WalletLabel } from '@/components/moderation/WalletLabel';
import { OffsetPager } from './OffsetPager';

const PAGE_SIZE = 25;
const COLS = 'minmax(0,1.4fr) 80px 130px 130px 90px 90px 90px 130px';

export function PlayersTable() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = usePlayers({ limit: PAGE_SIZE, offset });

  return (
    <div className="mt-5">
      <div className="rounded-lg border border-[#1E1E1E] bg-[#111]">
        <div
          className="font-mono-ctv grid gap-3 border-b border-[#1E1E1E] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45"
          style={{ gridTemplateColumns: COLS }}
        >
          <span>Wallet</span>
          <span className="text-right">Bets</span>
          <span className="text-right">Staked</span>
          <span className="text-right">Payouts</span>
          <span className="text-right">Won</span>
          <span className="text-right">Lost</span>
          <span className="text-right">Pending</span>
          <span className="text-right">Last bet</span>
        </div>

        {isLoading && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>
        )}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">
            No players yet.
          </p>
        )}
        {data?.items.map((player) => (
          <Link
            key={player.wallet}
            href={`/players/${player.wallet}`}
            className="grid items-center gap-3 border-b border-[#1A1A1A] px-4 py-3 text-[13px] transition-colors last:border-b-0 hover:bg-white/[0.02]"
            style={{ gridTemplateColumns: COLS }}
          >
            <WalletLabel wallet={player.wallet} />
            <span className="text-right tabular-nums text-white/85">{player.betCount}</span>
            <span className="text-right tabular-nums text-white/85">{fmtUsdcRaw(player.totalStaked)}</span>
            <span className="text-right tabular-nums text-[#2dd4a4]">{fmtUsdcRaw(player.totalPayout)}</span>
            <span className="text-right tabular-nums text-[#2dd4a4]">{player.wonCount}</span>
            <span className="text-right tabular-nums text-white/55">{player.lostCount}</span>
            <span className="text-right tabular-nums text-[#F5C518]">{player.pendingCount}</span>
            <span className="font-mono-ctv text-right text-[11px] tabular-nums text-white/55">
              {player.lastBetAt
                ? new Date(player.lastBetAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                : '—'}
            </span>
          </Link>
        ))}
      </div>

      <OffsetPager offset={offset} limit={PAGE_SIZE} total={data?.total ?? 0} onOffsetChange={setOffset} />
    </div>
  );
}
