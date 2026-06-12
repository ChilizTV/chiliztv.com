const LIVE = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'SUSP', 'INT']);
const FINISHED = new Set(['FT', 'AET', 'PEN']);

function tone(status: string): string {
  if (LIVE.has(status)) return 'border-[#E8001D]/50 text-[#E8001D]';
  if (FINISHED.has(status)) return 'border-[#2dd4a4]/40 text-[#2dd4a4]';
  if (status === 'NS' || status === 'TBD') return 'border-[#2A2A2A] text-white/65';
  return 'border-[#F5C518]/40 text-[#F5C518]';
}

export function MatchStatusBadge({ status }: Readonly<{ status: string }>) {
  return (
    <span
      className={`font-mono-ctv inline-flex w-fit rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${tone(status)}`}
    >
      {status}
    </span>
  );
}
