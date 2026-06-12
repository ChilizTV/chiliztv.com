'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useBans, useCreateBan, useLiftBan } from '@/hooks/api/useBans';
import { StatusBadge } from './StatusBadge';
import { WalletLabel } from './WalletLabel';

const COLS = 'minmax(0,1.2fr) 110px 150px 150px 90px 140px';

export function BansPanel() {
  const [cursor, setCursor] = useState<string | null>(null);
  const { data, isLoading } = useBans({ cursor });
  const createBan = useCreateBan();
  const liftBan = useLiftBan();

  const [wallet, setWallet] = useState('');
  const [reason, setReason] = useState('');
  const [liftingId, setLiftingId] = useState<string | null>(null);
  const [liftNote, setLiftNote] = useState('');

  const submitBan = (e: React.FormEvent) => {
    e.preventDefault();
    createBan.mutate(
      { walletAddress: wallet.trim(), reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success('Ban issued');
          setWallet('');
          setReason('');
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
      <form
        onSubmit={submitBan}
        className="rounded-lg border border-[#E8001D]/30 bg-[#E8001D]/5 p-4"
      >
        <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF1737]">
          Manual ban
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x…"
            className="font-mono-ctv w-90 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[12px] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (min 10 chars, audited)"
            className="font-mono-ctv min-w-60 flex-1 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[12px] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
          />
          <button
            type="submit"
            disabled={createBan.isPending || !/^0x[0-9a-fA-F]{40}$/.test(wallet.trim()) || reason.trim().length < 10}
            className="font-mono-ctv rounded-md bg-[#E8001D] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[#FF1737] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ban wallet
          </button>
        </div>
        <p className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.12em] text-white/35">
          Escalation applies from prior history · active stream is stopped · realtime notify
        </p>
      </form>

      <div className="mt-4 rounded-lg border border-[#1E1E1E] bg-[#111]">
        <div
          className="font-mono-ctv grid gap-3 border-b border-[#1E1E1E] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45"
          style={{ gridTemplateColumns: COLS }}
        >
          <span>Wallet</span>
          <span>Status</span>
          <span>Starts</span>
          <span>Expires</span>
          <span>Strike</span>
          <span></span>
        </div>

        {isLoading && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">Loading…</p>
        )}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">
            No bans recorded.
          </p>
        )}
        {data?.items.map((ban) => (
          <div key={ban.id} className="border-b border-[#1A1A1A] last:border-b-0">
            <div
              className="grid items-center gap-3 px-4 py-3 text-[13px]"
              style={{ gridTemplateColumns: COLS }}
            >
              <WalletLabel wallet={ban.walletAddress} />
              <StatusBadge status={ban.status} />
              <span className="font-mono-ctv text-[11px] tabular-nums text-white/55">
                {new Date(ban.startsAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <span className="font-mono-ctv text-[11px] tabular-nums text-white/55">
                {ban.expiresAt
                  ? new Date(ban.expiresAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                  : 'Permanent'}
              </span>
              <span className="font-mono-ctv text-[11px] tabular-nums text-white/55">#{ban.escalationIndex}</span>
              {ban.status === 'active' ? (
                <button
                  type="button"
                  onClick={() => setLiftingId(liftingId === ban.id ? null : ban.id)}
                  className="font-mono-ctv rounded-md border border-[#2A2A2A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65 hover:text-white"
                >
                  Lift…
                </button>
              ) : (
                <span />
              )}
            </div>
            {liftingId === ban.id && (
              <div className="flex gap-2 border-t border-[#1A1A1A] bg-[#0d0d0d] px-4 py-3">
                <input
                  value={liftNote}
                  onChange={(e) => setLiftNote(e.target.value)}
                  placeholder="Lift note (required, audited)"
                  autoFocus
                  className="font-mono-ctv flex-1 rounded-md border border-[#2A2A2A] bg-[#111] px-3 py-2 text-[12px] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                />
                <button
                  type="button"
                  disabled={liftBan.isPending || liftNote.trim().length === 0}
                  onClick={() => submitLift(ban.id)}
                  className="font-mono-ctv rounded-md bg-[#2dd4a4] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black hover:opacity-90 disabled:opacity-50"
                >
                  Confirm lift
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {data?.nextCursor && (
        <button
          type="button"
          onClick={() => setCursor(data.nextCursor)}
          className="font-mono-ctv mt-3 rounded-md border border-[#2A2A2A] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/65 hover:text-white"
        >
          Next page →
        </button>
      )}
    </div>
  );
}
