const STYLES: Record<string, string> = {
  WON: 'border-[#2dd4a4]/40 text-[#2dd4a4]',
  LOST: 'border-[#2A2A2A] text-white/45',
  PENDING: 'border-[#F5C518]/40 text-[#F5C518]',
  REFUNDED: 'border-[#2A2A2A] text-white/65',
};

export function BetStatusBadge({ status }: Readonly<{ status: string }>) {
  return (
    <span
      className={`font-mono-ctv inline-flex w-fit rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${STYLES[status] ?? STYLES.LOST}`}
    >
      {status}
    </span>
  );
}
