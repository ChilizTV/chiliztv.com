'use client';

import { useState } from 'react';
import Link from 'next/link';

import { usePlayers } from '@/hooks/api/usePlayers';
import { fmtUsdcRaw } from '@/lib/format/amounts';
import { Card } from '@/components/common/Card';
import { THead } from '@/components/common/THead';
import { TRow } from '@/components/common/TRow';
import { EmptyState } from '@/components/common/EmptyState';
import { WalletLabel } from '@/components/moderation/WalletLabel';
import { CopyButton } from '@/components/common/CopyButton';
import { OffsetPager } from './OffsetPager';

const PAGE_SIZE = 25;
const COLS = 'minmax(0,1.1fr) 160px 60px 110px 110px 110px 120px';

export function PlayersTable() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = usePlayers({ limit: PAGE_SIZE, offset });

  return (
    <div className="mt-5">
      <Card className="overflow-hidden">
        <THead cols={COLS}>
          <span>Player</span>
          <span>Wallet</span>
          <span className="text-right">Bets</span>
          <span className="text-right">Staked</span>
          <span className="text-right">Payouts</span>
          <span className="text-right">W · L · P</span>
          <span className="text-right">Last bet</span>
        </THead>

        {isLoading && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>
        )}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <EmptyState icon="users" title="No players yet" hint="Wallets appear here after their first indexed bet." />
        )}
        {data?.items.map((player) => (
          <Link key={player.wallet} href={`/players/${player.wallet}`} className="block">
            <TRow cols={COLS} className="cursor-pointer">
              <span className="min-w-0 truncate text-white/85">
                {player.username ?? <span className="text-white/30">—</span>}
              </span>
              <span className="flex items-center gap-1">
                <WalletLabel wallet={player.wallet} />
                <CopyButton value={player.wallet} label="Copy wallet address" />
              </span>
              <span className="text-right tabular-nums text-white/85">{player.betCount}</span>
              <span className="text-right tabular-nums text-white/85">{fmtUsdcRaw(player.totalStaked)}</span>
              <span className="text-right tabular-nums text-[#2dd4a4]">{fmtUsdcRaw(player.totalPayout)}</span>
              <span className="text-right tabular-nums">
                <span className="text-[#2dd4a4]">{player.wonCount}</span>
                <span className="text-white/30"> · </span>
                <span className="text-white/55">{player.lostCount}</span>
                <span className="text-white/30"> · </span>
                <span className="text-[#F5C518]">{player.pendingCount}</span>
              </span>
              <span className="font-mono-ctv text-right text-[11px] tabular-nums text-white/50">
                {player.lastBetAt
                  ? new Date(player.lastBetAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                  : '—'}
              </span>
            </TRow>
          </Link>
        ))}
      </Card>

      <OffsetPager offset={offset} limit={PAGE_SIZE} total={data?.total ?? 0} onOffsetChange={setOffset} />
    </div>
  );
}
