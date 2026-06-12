export function Eyebrow({
  children,
  color = '#E8001D',
  className = '',
}: Readonly<{ children: React.ReactNode; color?: string; className?: string }>) {
  return (
    <div
      className={`font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] ${className}`}
      style={{ color }}
    >
      <span aria-hidden="true" className="block h-0.5 w-4" style={{ background: color }} />
      <span>{children}</span>
    </div>
  );
}
