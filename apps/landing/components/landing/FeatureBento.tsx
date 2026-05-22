import type { ReactNode } from "react";
import { SectionHead } from "./SectionHead";

function Card({
  children,
  className = "",
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary";
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111] transition-colors hover:border-[#2A2A2A] ${className}`}
      style={
        variant === "primary"
          ? {
              padding: 36,
              background: "linear-gradient(135deg, #111, #0A0A0A)",
            }
          : { padding: 28 }
      }
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono-ctv mb-4 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
      <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
      {children}
    </div>
  );
}

function Title({
  children,
  large = false,
}: {
  children: ReactNode;
  large?: boolean;
}) {
  return (
    <h3
      className="font-display m-0 mb-3 font-bold uppercase tracking-[-0.005em]"
      style={{
        fontSize: large ? 56 : 36,
        lineHeight: 0.95,
        maxWidth: large ? 420 : undefined,
      }}
    >
      {children}
    </h3>
  );
}

function Body({
  children,
  large = false,
}: {
  children: ReactNode;
  large?: boolean;
}) {
  return (
    <p
      className="m-0 font-light leading-[1.55] text-white/65"
      style={{
        fontSize: large ? 16 : 14,
        maxWidth: large ? 460 : 380,
      }}
    >
      {children}
    </p>
  );
}

const POOL_STATS = [
  { l: "Winning pool", v: "$1.24M", red: true },
  { l: "Protocol fee", v: "5%" },
  { l: "→ Leaderboard", v: "1%" },
];

const LB_ROWS = [
  { rk: "01", ad: "0xa4f…91d2", pl: "+$48,210", top: true },
  { rk: "02", ad: "degenfan.eth", pl: "+$31,840", top: true },
  { rk: "03", ad: "0xc01…7e0a", pl: "+$22,506" },
  { rk: "04", ad: "psgmaxi.eth", pl: "+$18,294" },
];

export function FeatureBento() {
  return (
    <section className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-20 sm:px-14 sm:pb-28">
      <SectionHead
        title={
          <>
            Built on three
            <br />
            <span className="text-[#E8001D]">primitives.</span>
          </>
        }
        lead="A protocol, not a product. Every match drops a FootballPariMatch contract with six on-chain markets. The Factory deploys, the crowd sets the odds, the chain settles."
      />

      <div
        className="grid auto-rows-[220px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6"
      >
        {/* B1 — Liquidity pools (4×2) */}
        <Card
          variant="primary"
          className="lg:col-span-4 lg:row-span-2 sm:col-span-2"
        >
          <Label>Pari-mutuel markets</Label>
          <Title large>The crowd is the bookmaker.</Title>
          <Body large>
            No fixed odds, no house. Pick an outcome, stake USDC into its pool.
            When the match settles, winners share the total pool pro-rata —
            minus a 5% protocol fee that funds the leaderboard and treasury.
          </Body>
          <div className="mt-9 flex flex-wrap gap-4">
            {POOL_STATS.map(({ l, v, red }) => (
              <div
                key={l}
                className="flex-1 rounded-lg border border-[#1E1E1E] p-4"
                style={{ background: "rgba(255,255,255,0.025)", minWidth: 120 }}
              >
                <div className="font-mono-ctv mb-1.5 text-[9px] uppercase tracking-[0.14em] text-white/45">
                  {l}
                </div>
                <div
                  className="font-display text-[28px] font-bold leading-none"
                  style={{ color: red ? "#E8001D" : "#fff" }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* B2 — Markets (2×1) */}
        <Card className="lg:col-span-2 lg:row-span-1 sm:col-span-1">
          <Label>On-chain markets</Label>
          <Title>1X2 · O/U · BTTS</Title>
          <Body>Six markets per match. Smart-contract settled. Void-protected if a winning outcome has no takers.</Body>
        </Card>

        {/* B3 — Streamer wallets (2×1) */}
        <Card className="lg:col-span-2 lg:row-span-1 sm:col-span-1">
          <Label>Streamer wallets</Label>
          <Title>
            Tips in CHZ.
            <br />
            0% cut.
          </Title>
          <Body>
            Donations and subs land directly in streamers&apos; on-chain wallets.
          </Body>
        </Card>

        {/* B4 — Leaderboard (3×1) */}
        <Card className="lg:col-span-3 lg:row-span-1 sm:col-span-2">
          <Label>Live leaderboard</Label>
          <Title>
            Real PnL.
            <br />
            Real prizes.
          </Title>
          <div className="mt-3.5 flex flex-col gap-1.5">
            {LB_ROWS.map(({ rk, ad, pl, top }) => (
              <div
                key={rk}
                className="font-mono-ctv grid items-center gap-2.5 border-b border-dashed border-[#1E1E1E] py-1.5 text-[11px] last:border-b-0"
                style={{ gridTemplateColumns: "24px 1fr auto" }}
              >
                <span
                  className="font-bold"
                  style={{ color: top ? "#E8001D" : "rgba(255,255,255,0.45)" }}
                >
                  {rk}
                </span>
                <span className="text-white">{ad}</span>
                <span className="font-bold text-[#2dd4a4]">{pl}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* B5 — Non-custodial (3×1) */}
        <Card className="lg:col-span-3 lg:row-span-1 sm:col-span-2">
          <Label>Non-custodial</Label>
          <Title>
            Your keys.
            <br />
            Your predictions.
          </Title>
          <Body>
            Funds never leave your wallet until you sign. The platform holds
            nothing — audited, open contracts on Chiliz Chain.
          </Body>
        </Card>
      </div>
    </section>
  );
}
