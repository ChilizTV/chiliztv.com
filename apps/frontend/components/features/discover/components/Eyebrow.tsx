import type { ReactNode } from "react";

export function Eyebrow({
  children,
  dim = false,
}: {
  children: ReactNode;
  dim?: boolean;
}) {
  return (
    <div
      className={`font-mono-ctv inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] ${
        dim ? "text-white/45" : "text-white/65"
      }`}
    >
      <span aria-hidden className="block h-[2px] w-7 bg-[#E8001D]" />
      <span>{children}</span>
    </div>
  );
}
