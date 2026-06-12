import type { AdminPlayerDto } from '@/lib/api/endpoints/directory';
import { fmtUsdcRaw } from '@/lib/format/amounts';
import { Card } from '@/components/common/Card';

export function PlayerSummaryCards({ player }: Readonly<{ player: AdminPlayerDto }>) {
  const settled = player.wonCount + player.lostCount;
  const winRate = settled > 0 ? `${Math.round((player.wonCount / settled) * 100)}%` : '—';

  const cards = [
    { label: 'Bets', value: String(player.betCount), tone: '#fff' },
    { label: 'Staked (USDC)', value: fmtUsdcRaw(player.totalStaked), tone: '#fff' },
    { label: 'Payouts (USDC)', value: fmtUsdcRaw(player.totalPayout), tone: '#2dd4a4' },
    { label: 'Win rate', value: winRate, tone: '#fff' },
    { label: 'Pending', value: String(player.pendingCount), tone: '#F5C518' },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <p className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">{card.label}</p>
          <p className="font-display mt-2 text-[26px] font-bold leading-none tabular-nums" style={{ color: card.tone }}>
            {card.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
