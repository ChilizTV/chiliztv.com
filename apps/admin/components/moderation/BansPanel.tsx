'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useBans, useCreateBan, useLiftBan } from '@/hooks/api/useBans';
import { Card } from '@/components/common/Card';
import { THead } from '@/components/common/THead';
import { TRow } from '@/components/common/TRow';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { StatusBadge } from './StatusBadge';
import { WalletLabel } from './WalletLabel';

const COLS = 'minmax(0,1.2fr) 130px 150px 150px 70px 110px';

export function BansPanel() {
  const [cursor, setCursor] = useState<string | null>(null);
  const { data, isLoading } = useBans({ cursor });
  const createBan = useCreateBan();
  const liftBan = useLiftBan();

  const [wallet, setWallet] = useState('');
  const [reason, setReason] = useState('');
  // 'auto' = escalation policy, 'permanent', or a number of hours as string.
  const [duration, setDuration] = useState('auto');
  const [liftingId, setLiftingId] = useState<string | null>(null);
  const [liftNote, setLiftNote] = useState('');

  const submitBan = (e: React.FormEvent) => {
    e.preventDefault();
    const durationHours = duration === 'auto' ? undefined : duration === 'permanent' ? null : Number(duration);
    createBan.mutate(
      { walletAddress: wallet.trim(), reason: reason.trim(), durationHours },
      {
        onSuccess: () => {
          toast.success('Ban issued');
          setWallet('');
          setReason('');
          setDuration('auto');
        },
        onError: () => toast.error('Ban failed — invalid wallet or already banned'),
      },
    );
  };

  const submitLift = (banId: string) => {
    liftBan.mutate(
      { banId, note: liftNote.trim() },
      {
        onSuccess: () => {
          toast.success('Ban lifted');
          setLiftingId(null);
          setLiftNote('');
        },
        onError: () => toast.error('Lift failed — ban no longer active'),
      },
    );
  };

  return (
    <div className="mt-5">
      {/* Manual ban — danger zone styling per the visual language. */}
      <form onSubmit={submitBan} className="rounded-xl border border-[#E8001D]/30 bg-[#E8001D]/5 p-4">
        <div className="flex items-center justify-between">
          <div className="font-mono-ctv flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF1737]">
            <Icon n="alertTriangle" s={12} />
            <span>Manual ban</span>
          </div>
          <span className="font-mono-ctv text-[9px] uppercase tracking-[0.12em] text-white/35">
            Audited · realtime notify · stream stopped
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x…"
            aria-label="Wallet to ban"
            className="font-mono-ctv w-75 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[12px] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (min 10 chars, audited)"
            aria-label="Ban reason"
            className="font-mono-ctv min-w-60 flex-1 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[12px] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
          />
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            aria-label="Ban duration"
            className="font-mono-ctv rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
          >
            <option value="auto">Auto (escalation)</option>
            <option value="24">24h</option>
            <option value="72">72h</option>
            <option value="168">7 days</option>
            <option value="720">30 days</option>
            <option value="permanent">Permanent</option>
          </select>
          <button
            type="submit"
            disabled={createBan.isPending || !/^0x[0-9a-fA-F]{40}$/.test(wallet.trim()) || reason.trim().length < 10}
            className="font-mono-ctv rounded-md bg-[#E8001D] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#FF1737] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ban wallet
          </button>
        </div>
        <p className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.12em] text-white/35">
          Auto follows escalation (24h → 168h → permanent)
        </p>
      </form>

      <Card className="mt-4 overflow-hidden">
        <THead cols={COLS}>
          <span>Wallet</span>
          <span>Status</span>
          <span>Starts</span>
          <span>Expires</span>
          <span className="text-right">Strike</span>
          <span></span>
        </THead>

        {isLoading && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>
        )}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <EmptyState icon="ban" title="No bans recorded" hint="Quorum auto-bans and manual bans appear here, with their escalation strike." />
        )}
        {data?.items.map((ban) => (
          <div key={ban.id} className="border-b border-[#1A1A1A] last:border-b-0">
            <TRow cols={COLS} accent={ban.status === 'active' ? '#E8001D' : undefined} className="!border-b-0">
              <WalletLabel wallet={ban.walletAddress} />
              <StatusBadge status={ban.status} />
              <span className="font-mono-ctv text-[11px] tabular-nums text-white/50">
                {new Date(ban.startsAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <span className="font-mono-ctv text-[11px] tabular-nums text-white/50">
                {ban.expiresAt
                  ? new Date(ban.expiresAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                  : ban.status === 'active'
                    ? 'Permanent'
                    : '—'}
              </span>
              <span className="font-mono-ctv text-right text-[11px] tabular-nums text-white/50">#{ban.escalationIndex}</span>
              {ban.status === 'active' ? (
                <span className="text-right">
                  <button
                    type="button"
                    onClick={() => setLiftingId(liftingId === ban.id ? null : ban.id)}
                    className={`font-mono-ctv rounded-md border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] transition-colors ${
                      liftingId === ban.id
                        ? 'border-[#3A3A3A] bg-white/5 text-white'
                        : 'border-[#2A2A2A] text-white/65 hover:border-[#3A3A3A] hover:text-white'
                    }`}
                  >
                    Lift…
                  </button>
                </span>
              ) : (
                <span />
              )}
            </TRow>
            {liftingId === ban.id && (
              <div className="flex gap-2 border-t border-[#1A1A1A] bg-[#0d0d0d] px-4 py-3">
                <input
                  value={liftNote}
                  onChange={(e) => setLiftNote(e.target.value)}
                  placeholder="Lift note (required, audited)"
                  autoFocus
                  className="font-mono-ctv flex-1 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-[12px] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                />
                <button
                  type="button"
                  disabled={liftBan.isPending || liftNote.trim().length === 0}
                  onClick={() => submitLift(ban.id)}
                  className="font-mono-ctv rounded-md bg-[#2dd4a4] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Confirm lift
                </button>
              </div>
            )}
          </div>
        ))}
      </Card>

      {data?.nextCursor && (
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono-ctv text-[10px] uppercase tracking-[0.12em] text-white/35">Keyset · 25 per page</span>
          <button
            type="button"
            onClick={() => setCursor(data.nextCursor)}
            className="font-mono-ctv rounded-md border border-[#2A2A2A] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/65 transition-colors hover:text-white"
          >
            Next page →
          </button>
        </div>
      )}
    </div>
  );
}
