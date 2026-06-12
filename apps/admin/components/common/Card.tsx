export function Card({
  className = '',
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return <div className={`rounded-xl border border-[#1E1E1E] bg-[#111111] ${className}`}>{children}</div>;
}
