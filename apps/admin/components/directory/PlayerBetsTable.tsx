import type { AdminPlayerBetDto } from '@/lib/api/endpoints/directory';
import { fmtUsdcRaw } from '@/lib/format/amounts';
import { BetStatusBadge } from './BetStatusBadge';

const COLS = 'minmax(0,1.6fr) minmax(0,1fr) 110px 110px 100px 130px';

function fmtMarket(bet: AdminPlayerBetDto): string {
  if (!bet.marketContext) return `Market #${bet.marketId}`;
  const { marketType, line } = bet.marketContext;
  return line !== null ? `${marketType} ${line / 10}` : marketType;
}

export function PlayerBetsTable({ bets }: Readonly<{ bets: AdminPlayerBetDto[] }>) {
  return (
    <div className="mt-6">
      <h2 className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
        Recent bets
      </h2>
      <div className="mt-3 rounded-lg border border-[#1E1E1E] bg-[#111]">
        <div
          className="font-mono-ctv grid gap-3 border-b border-[#1E1E1E] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45"
          style={{ gridTemplateColumns: COLS }}
        >
          <span>Match</span>
          <span>Market</span>
          <span className="text-right">Stake</span>
          <span className="text-right">Payout</span>
          <span>Status</span>
          <span className="text-right">Placed</span>
        </div>

        {bets.length === 0 && (
          <p className="font-mono-ctv px-4 py-6 text-[11px] uppercase tracking-[0.14em] text-white/35">
            No bets recorded.
          </p>
        )}
        {bets.map((bet) => (
          <div
            key={`${bet.contractAddress}-${bet.marketId}-${bet.placedAt}-${bet.outcome}`}
            className="grid items-center gap-3 border-b border-[#1A1A1A] px-4 py-3 text-[13px] last:border-b-0"
            style={{ gridTemplateColumns: COLS }}
          >
            <span className="min-w-0 truncate text-white/85">
              {bet.match ? `${bet.match.homeTeamName} vs ${bet.match.awayTeamName}` : bet.contractAddress}
            </span>
            <span className="font-mono-ctv min-w-0 truncate text-[11px] uppercase tracking-[0.08em] text-white/55">
              {fmtMarket(bet)}
            </span>
            <span className="text-right tabular-nums text-white/85">{fmtUsdcRaw(bet.stakeAmount)}</span>
            <span className="text-right tabular-nums text-[#2dd4a4]">
              {bet.payoutAmount ? fmtUsdcRaw(bet.payoutAmount) : '—'}
            </span>
            <BetStatusBadge status={bet.status} />
            <span className="font-mono-ctv text-right text-[11px] tabular-nums text-white/55">
              {new Date(bet.placedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
