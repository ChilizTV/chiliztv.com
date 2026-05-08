import type { ReactNode } from "react";
import { SmokeBackground } from "@/components/ui/spooky-smoke-animation";

/**
 * Page-section wrapper that lays an animated red smoke shader behind its
 * children, with a darkening gradient overlay so text stays legible. Same
 * visual idiom used by the landing hero — extracted here so any discover
 * section can opt into it.
 */
export function SmokeBackdrop({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <SmokeBackground smokeColor="#E8001D" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.65) 60%, rgba(10,10,10,0.95) 100%)",
        }}
      />
      <div className="relative z-[4]">{children}</div>
    </section>
  );
}
