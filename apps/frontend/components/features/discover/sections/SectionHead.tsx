import type { ReactNode } from "react";
import { Eyebrow } from "../components";

export function SectionHead({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
}) {
  return (
    <div className="mb-12">
      {eyebrow && (
        <div className="mb-7">
          <Eyebrow dim>{eyebrow}</Eyebrow>
        </div>
      )}
      <div className="grid items-end gap-12 lg:grid-cols-2 lg:gap-16">
        <h2
          className="font-display m-0 max-w-[640px] uppercase leading-[0.9] tracking-[-0.01em] text-white"
          style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 800 }}
        >
          {title}
        </h2>
        {lead && (
          <p className="max-w-[480px] text-[17px] font-light leading-[1.55] text-white/65">
            {lead}
          </p>
        )}
      </div>
    </div>
  );
}
