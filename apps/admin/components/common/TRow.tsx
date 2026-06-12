/** Dense table row — 40px, no zebra; `accent` paints a 2px left edge (S4+/live). */
export function TRow({
  cols,
  accent,
  className = '',
  children,
}: Readonly<{ cols: string; accent?: string; className?: string; children: React.ReactNode }>) {
  return (
    <div
      className={`relative grid min-h-10 items-center gap-3 border-b border-[#1A1A1A] px-4 py-1.5 text-[13px] transition-colors last:border-b-0 hover:bg-white/[0.02] ${className}`}
      style={{ gridTemplateColumns: cols }}
    >
      {accent && (
        <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-[2px]" style={{ background: accent }} />
      )}
      {children}
    </div>
  );
}
