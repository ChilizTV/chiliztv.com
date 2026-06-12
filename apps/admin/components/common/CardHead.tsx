export function CardHead({
  title,
  count,
  right,
}: Readonly<{ title: string; count?: number | string; right?: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-between border-b border-[#1E1E1E] px-4 py-2.5">
      <div className="font-mono-ctv flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
        <span>{title}</span>
        {count != null && (
          <span className="font-mono-ctv rounded border border-[#2A2A2A] px-1.5 py-px text-[9px] tabular-nums text-white/45">
            {count}
          </span>
        )}
      </div>
      {right}
    </div>
  );
}
