export function EmptyState({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#1E1E1E] bg-[#0d0d0d] py-20">
      <span aria-hidden className="block h-0.5 w-10 bg-[#E8001D]" />
      <div className="font-mono-ctv text-[12px] uppercase tracking-[0.18em] text-white/65">
        {label}
      </div>
      <div className="font-mono-ctv text-[10px] uppercase tracking-[0.14em] text-white/45">
        {hint}
      </div>
    </div>
  );
}
