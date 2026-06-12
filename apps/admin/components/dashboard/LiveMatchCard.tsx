import Link from 'next/link';

import type { AdminMatchSummaryDto } from '@/lib/api/endpoints/directory';
import { fmtUsdcCompact } from '@/lib/format/amounts';
import { Card } from '@/components/common/Card';
import { LiveDot } from '@/components/common/LiveDot';
import { Icon } from '@/components/common/Icon';
import { TeamLabel } from '@/components/directory/TeamLabel';

function minuteLabel(match: AdminMatchSummaryDto): string {
  if (match.status === 'HT') return 'HT';
  return match.elapsed != null ? `${match.elapsed}′` : match.status;
}

export function LiveMatchCard({ match, canMarkets }: Readonly<{ match: AdminMatchSummaryDto; canMarkets: boolean }>) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono-ctv flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#FF1737]">
          <LiveDot s={5} />
          <span>Live · {minuteLabel(match)}</span>
        </span>
        <span className="font-mono-ctv text-[9px] uppercase tracking-[0.12em] text-white/35">
          {fmtUsdcCompact(match.totalStaked)} USDC · {match.betCount} bets
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TeamLabel name={match.homeTeamName} logo={match.homeTeamLogo} />
        </div>
        <div className="font-display shrink-0 text-[30px] font-extrabold leading-none tabular-nums text-white">
          {match.score ? `${match.score.home}–${match.score.away}` : '—'}
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
          <TeamLabel name={match.awayTeamName} logo={match.awayTeamLogo} />
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-2 border-t border-[#1A1A1A] pt-3">
        <Link
          href="/moderation"
          className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md border border-[#2A2A2A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/65 transition-colors hover:border-[#3A3A3A] hover:text-white"
        >
          <Icon n="flag" s={11} />
          <span>Moderation</span>
        </Link>
        {canMarkets && (
          <Link
            href="/markets"
            className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md border border-[#2A2A2A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/65 transition-colors hover:border-[#3A3A3A] hover:text-white"
          >
            <Icon n="chart" s={11} />
            <span>Market</span>
          </Link>
        )}
        <span className="font-mono-ctv ml-auto truncate text-[9px] uppercase tracking-[0.12em] text-white/25">
          {match.leagueName}
        </span>
      </div>
    </Card>
  );
}
