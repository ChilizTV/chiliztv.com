// Shared content-width wrapper. Every chapter / aside / CTA opts in via this
// class so the inner layout shifts together on viewport changes.
export const SHELL = "relative mx-auto max-w-[1400px] px-6 md:px-12";

interface ChapterShellProps {
  num: string;
  metaTop: string;
  metaBottom: string;
  children: React.ReactNode;
}

export function ChapterShell({ num, metaTop, metaBottom, children }: ChapterShellProps) {
  return (
    <section className="border-b border-[#1E1E1E]">
      <div className={SHELL}>
        <div className="grid min-h-[80vh] grid-cols-1 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col justify-between border-b border-[#1E1E1E] py-10 lg:border-r lg:border-b-0 lg:py-15 lg:pr-8">
            <div
              className="font-display font-black text-[#E8001D]"
              style={{
                fontSize: "clamp(120px, 22vw, 280px)",
                lineHeight: 0.82,
                letterSpacing: "-0.04em",
              }}
            >
              {num}
            </div>
            <div className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
              {metaTop}
              <b className="mt-1.5 block font-bold text-white">{metaBottom}</b>
            </div>
          </div>
          <div className="py-10 lg:py-15 lg:pl-14">{children}</div>
        </div>
      </div>
    </section>
  );
}
