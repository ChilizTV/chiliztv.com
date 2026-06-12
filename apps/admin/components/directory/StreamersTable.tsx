'use client';

import { useState } from 'react';

import { useStreamers } from '@/hooks/api/useStreamers';
import { fmtChz } from '@/lib/format/amounts';
import { WalletLabel } from '@/components/moderation/WalletLabel';
import { OffsetPager } from './OffsetPager';

const PAGE_SIZE = 25;
const COLS = 'minmax(0,1.4fr) 110px 150px 110px 150px 130px';

export function StreamersTable() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useStreamers({ limit: PAGE_SIZE, offset });

  return (
    <div className="mt-5">
      <div className="rounded-lg border border-[#1E1E1E] bg-[#111]">
        <div
          className="font-mono-ctv grid gap-3 border-b border-[#1E1E1E] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45"
          style={{ gridTemplateColumns: COLS }}
        >
          <span>Wallet</span>
          <span className="text-right">Donations</span>
          <span className="text-right">Donated (CHZ)</span>
          <span className="text-right">Subs</span>
          <span className="text-right">Sub rev (CHZ)</span>
          <span className="text-right">Last activity</span>
        </div>

        {isLoading && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>
        )}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">
            No streamer revenue yet.
          </p>
        )}
        {data?.items.map((streamer) => (
          <div
            key={streamer.wallet}
            className="grid items-center gap-3 border-b border-[#1A1A1A] px-4 py-3 text-[13px] last:border-b-0"
            style={{ gridTemplateColumns: COLS }}
          >
            <WalletLabel wallet={streamer.wallet} />
            <span className="text-right tabular-nums text-white/85">{streamer.donationCount}</span>
            <span className="text-right tabular-nums text-[#2dd4a4]">{fmtChz(streamer.donationTotal)}</span>
            <span className="text-right tabular-nums text-white/85">{streamer.subCount}</span>
            <span className="text-right tabular-nums text-[#2dd4a4]">{fmtChz(streamer.subRevenue)}</span>
            <span className="font-mono-ctv text-right text-[11px] tabular-nums text-white/55">
              {streamer.lastActivityAt
                ? new Date(streamer.lastActivityAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                : '—'}
            </span>
          </div>
        ))}
      </div>

      <OffsetPager offset={offset} limit={PAGE_SIZE} total={data?.total ?? 0} onOffsetChange={setOffset} />
    </div>
  );
}
