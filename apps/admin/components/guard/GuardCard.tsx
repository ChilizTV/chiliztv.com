export function GuardCard({
  className = '',
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div
      className={`w-[400px] max-w-[calc(100vw-3rem)] rounded-xl border border-[#1E1E1E] bg-[#111111]/95 p-8 ${className}`}
      style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.55)' }}
    >
      {children}
    </div>
  );
}
