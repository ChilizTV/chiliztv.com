import type { ReactNode } from "react";

export function SectionHead({
  title,
  lead,
}: {
  title: ReactNode;
  lead: string;
}) {
  return (
    <div className="mb-14 grid items-end gap-15 sm:gap-16 lg:grid-cols-2">
      <h2
        className="font-display m-0 max-w-[600px] uppercase leading-[0.9] tracking-[-0.01em]"
        style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 800 }}
      >
        {title}
      </h2>
      <p className="max-w-[460px] text-[17px] font-light leading-[1.55] text-white/65">
        {lead}
      </p>
    </div>
  );
}
