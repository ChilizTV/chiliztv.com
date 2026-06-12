'use client';

import { useState } from 'react';

import { useStreamers } from '@/hooks/api/useStreamers';
import { fmtChz } from '@/lib/format/amounts';
import { Card } from '@/components/common/Card';
import { THead } from '@/components/common/THead';
import { TRow } from '@/components/common/TRow';
import { EmptyState } from '@/components/common/EmptyState';
import { WalletLabel } from '@/components/moderation/WalletLabel';
import { CopyButton } from '@/components/common/CopyButton';
import { OffsetPager } from './OffsetPager';

const PAGE_SIZE = 25;
const COLS = 'minmax(0,1.3fr) 110px 150px 90px 150px 130px';

export function StreamersTable() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useStreamers({ limit: PAGE_SIZE, offset });

  return (
    <div className="mt-5">
      <Card className="overflow-hidden">
        <THead cols={COLS}>
          <span>Wallet</span>
          <span className="text-right">Donations</span>
          <span className="text-right">Donated (CHZ)</span>
          <span className="text-right">Subs</span>
          <span className="text-right">Sub rev (CHZ)</span>
          <span className="text-right">Last activity</span>
        </THead>

        {isLoading && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>
        )}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <EmptyState icon="wallet" title="No streamer revenue yet" hint="Donations and subscriptions appear here per streamer wallet." />
        )}
        {data?.items.map((streamer) => (
          <TRow key={streamer.wallet} cols={COLS}>
            <span className="flex items-center gap-1">
              <WalletLabel wallet={streamer.wallet} />
              <CopyButton value={streamer.wallet} label="Copy wallet address" />
            </span>
            <span className="text-right tabular-nums text-white/85">{streamer.donationCount}</span>
            <span className="text-right tabular-nums text-[#2dd4a4]">{fmtChz(streamer.donationTotal)}</span>
            <span className="text-right tabular-nums text-white/85">{streamer.subCount}</span>
            <span className="text-right tabular-nums text-[#2dd4a4]">{fmtChz(streamer.subRevenue)}</span>
            <span className="font-mono-ctv text-right text-[11px] tabular-nums text-white/50">
              {streamer.lastActivityAt
                ? new Date(streamer.lastActivityAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                : '—'}
            </span>
          </TRow>
        ))}
      </Card>

      <OffsetPager offset={offset} limit={PAGE_SIZE} total={data?.total ?? 0} onOffsetChange={setOffset} />
    </div>
  );
}
