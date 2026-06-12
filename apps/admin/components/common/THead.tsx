export function THead({
  cols,
  children,
}: Readonly<{ cols: string; children: React.ReactNode }>) {
  return (
    <div
      className="font-mono-ctv grid items-center gap-3 border-b border-[#1E1E1E] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40"
      style={{ gridTemplateColumns: cols }}
    >
      {children}
    </div>
  );
}
