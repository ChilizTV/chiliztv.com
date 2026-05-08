import { FAN_TOKEN_ASSETS } from "@/config/fanTokenAssets";
import {
  MarqueeLogoScroller,
  type MarqueeLogo,
} from "../ui/marquee-logo-scroller";

const LOGOS: MarqueeLogo[] = FAN_TOKEN_ASSETS.map((t) => ({
  src: t.logo,
  alt: `$${t.symbol} — ${t.name}`,
  gradient: t.gradient,
}));

export function FanTokenWall() {
  return (
    <div className="relative z-[4] border-y border-[#1E1E1E] bg-[#111] px-8 py-20 sm:px-14">
      <div className="mb-12 text-center">
        <div className="font-mono-ctv mb-3 text-[11px] uppercase tracking-[0.24em] text-white/45">
          — Supported fan tokens —
        </div>
        <h3 className="font-display m-0 text-[40px] font-bold uppercase leading-none tracking-[0.005em]">
          Already <span className="text-[#E8001D]">holding</span>? Already in.
        </h3>
      </div>

      <MarqueeLogoScroller
        logos={LOGOS}
        speed="slow"
        className="border-0 bg-transparent"
      />

      <div className="font-mono-ctv mt-6 flex flex-wrap justify-center gap-8 text-[11px] uppercase tracking-[0.14em] text-white/45">
        <span>
          Settled on <span className="text-[#E8001D]">Chiliz Chain</span>
        </span>
        <span>
          Tokens via <span className="text-[#E8001D]">Socios</span>
        </span>
        <span>
          Audited by <span className="text-[#E8001D]">Independent</span>
        </span>
      </div>
    </div>
  );
}
