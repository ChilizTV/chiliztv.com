import { ChapterShell } from "../components/ChapterShell";
import { ChapterHeading } from "../components/ChapterHeading";
import { ChapterLead } from "../components/ChapterLead";

const TILES = [
  { n: "// 01", title: "Predict", body: "On-chain pari-mutuel markets. Stake USDC, share the winning pool." },
  { n: "// 02", title: "Stream", body: "Broadcast with OBS. Earn USDC tips paid straight to your wallet." },
];

export function ChapterProduct() {
  return (
    <ChapterShell num="01" metaTop="The product" metaBottom="What it is">
      <ChapterHeading>
        Sports meet <span className="text-[#E8001D]">on-chain economics.</span>
      </ChapterHeading>
      <ChapterLead>
        Betcast is a fan-first SocialFi platform on Chiliz Chain. Two primitives any user can pick up in minutes.
      </ChapterLead>
      <div className="grid grid-cols-1 border-t border-l border-[#1E1E1E] lg:grid-cols-2">
        {TILES.map(({ n, title, body }) => (
          <div
            key={n}
            className="min-h-55 border-r border-b border-[#1E1E1E] px-7 pt-8 pb-9"
          >
            <span className="font-mono-ctv mb-8 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8001D]">
              {n}
            </span>
            <h4
              className="font-display m-0 mb-3 text-[32px] font-extrabold uppercase leading-[0.95] text-white"
              style={{ letterSpacing: "-0.005em" }}
            >
              {title}
            </h4>
            <p className="m-0 text-[13px] font-light leading-[1.55] text-white/65">
              {body}
            </p>
          </div>
        ))}
      </div>
    </ChapterShell>
  );
}
