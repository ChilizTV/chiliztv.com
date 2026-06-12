'use client';

interface OffsetPagerProps {
  readonly offset: number;
  readonly limit: number;
  readonly total: number;
  readonly onOffsetChange: (offset: number) => void;
}

export function OffsetPager({ offset, limit, total, onOffsetChange }: Readonly<OffsetPagerProps>) {
  if (total === 0) return null;
  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  const btn =
    'font-mono-ctv rounded-md border border-[#2A2A2A] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65 transition-colors hover:text-white disabled:cursor-default disabled:opacity-35 disabled:hover:text-white/65';

  return (
    <div className="mt-3 flex items-center justify-between">
      <span className="font-mono-ctv text-[10px] uppercase tracking-[0.12em] text-white/35">
        {from}–{to} of {total}
      </span>
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={offset === 0}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          className={btn}
        >
          ← Prev
        </button>
        <button
          type="button"
          disabled={to >= total}
          onClick={() => onOffsetChange(offset + limit)}
          className={btn}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
