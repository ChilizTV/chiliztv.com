import { SHELL } from "./ChapterShell";

interface AsideProps {
  label: string;
  children: React.ReactNode;
  tinted?: boolean;
}

export function Aside({ label, children, tinted = false }: AsideProps) {
  return (
    <section
      className="border-y border-[#E8001D] py-15"
      style={tinted ? { background: "rgba(232,0,29,0.04)" } : undefined}
    >
      <div className={SHELL}>
        <div className="max-w-225">
          <div className="font-mono-ctv mb-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[#E8001D]">
            {label}
          </div>
          <p
            className="font-display m-0 font-bold uppercase text-white"
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: 1.05,
              letterSpacing: "-0.005em",
            }}
          >
            {children}
          </p>
        </div>
      </div>
    </section>
  );
}
