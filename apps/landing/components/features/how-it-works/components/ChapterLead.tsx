export function ChapterLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 mb-12 max-w-150 text-[18px] font-light leading-[1.55] text-white/65">
      {children}
    </p>
  );
}
