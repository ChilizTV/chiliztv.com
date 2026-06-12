import type { AdminPlayerDto } from '@/lib/api/endpoints/directory';
import { fmtUsdcRaw } from '@/lib/format/amounts';

export function PlayerSummaryCards({ player }: Readonly<{ player: AdminPlayerDto }>) {
  const settled = player.wonCount + player.lostCount;
  const winRate = settled > 0 ? `${Math.round((player.wonCount / settled) * 100)}%` : '—';

  const cards = [
    { label: 'Bets', value: String(player.betCount), tone: 'text-white' },
    { label: 'Staked (USDC)', value: fmtUsdcRaw(player.totalStaked), tone: 'text-white' },
    { label: 'Payouts (USDC)', value: fmtUsdcRaw(player.totalPayout), tone: 'text-[#2dd4a4]' },
    { label: 'Win rate', value: winRate, tone: 'text-white' },
    { label: 'Pending', value: String(player.pendingCount), tone: 'text-[#F5C518]' },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-[#1E1E1E] bg-[#111] p-4">
          <p className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
            {card.label}
          </p>
          <p className={`font-display mt-1.5 text-2xl font-bold tabular-nums ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
