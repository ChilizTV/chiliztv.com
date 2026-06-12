'use client';

export interface FilterChip<T> {
  readonly label: string;
  readonly value: T;
  readonly count?: number;
}

export function FilterChips<T>({
  items,
  active,
  onSelect,
}: Readonly<{ items: ReadonlyArray<FilterChip<T>>; active: T; onSelect: (value: T) => void }>) {
  return (
    <div className="flex gap-1.5">
      {items.map((it) => {
        const on = it.value === active;
        return (
          <button
            key={it.label}
            type="button"
            onClick={() => onSelect(it.value)}
            className={`font-mono-ctv flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
              on ? 'border-[#E8001D] bg-[#E8001D]/10 text-white' : 'border-[#2A2A2A] text-white/55 hover:text-white'
            }`}
          >
            <span>{it.label}</span>
            {it.count != null && <span className={`tabular-nums ${on ? 'text-[#FF1737]' : 'text-white/35'}`}>{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
