import { GateInline } from "@/components/features/access/GateInline";

const SHELL = "relative mx-auto max-w-[1400px] px-6 md:px-12";

function Topbar() {
  return (
    <div className="border-b border-[#1E1E1E] py-4.5">
      <div className={`${SHELL} font-mono-ctv grid grid-cols-3 gap-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40`}>
        <span>
          Chiliz<span className="text-[#E8001D]">·</span>TV — <span className="text-white">DOC.001</span>
        </span>
        <span className="text-center">Newcomer&apos;s guide · v1.0</span>
        <span className="text-right">~5 min</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#1E1E1E]">
      <div className={SHELL}>
        <div className="relative py-25 md:py-35">
          <div
            aria-hidden
            className="font-display pointer-events-none absolute top-1/2 -right-10 z-0 -translate-y-1/2 font-black uppercase text-[#E8001D]"
            style={{
              fontSize: "clamp(280px, 42vw, 540px)",
              lineHeight: 0.85,
              letterSpacing: "-0.05em",
              opacity: 0.95,
            }}
          >
            00
          </div>

          <div className="relative z-2 max-w-180">
            <div className="font-mono-ctv mb-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8001D]">
              <span aria-hidden className="block h-0.5 w-8 bg-[#E8001D]" />
              Newcomer&apos;s guide
            </div>
            <h1
              className="font-display m-0 mb-8 font-black uppercase text-white"
              style={{
                fontSize: "clamp(72px, 11vw, 160px)",
                lineHeight: 0.84,
                letterSpacing: "-0.025em",
              }}
            >
              New to
              <br />
              ChilizTV?
              <br />
              <span className="text-[#E8001D]">Start</span>{" "}
              <span
                style={{
                  WebkitTextStroke: "1.5px #fff",
                  WebkitTextFillColor: "transparent",
                }}
              >
                here.
              </span>
            </h1>
            <p className="m-0 mb-10 max-w-135 text-[18px] font-light leading-[1.55] text-white/65">
              Predict live football, stream matches yourself, and earn from the on-chain liquidity pool. The full picture — in under five minutes.
            </p>
            <p className="font-mono-ctv text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              03 sections — 05 min read — no crypto experience required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ChapterShellProps {
  num: string;
  metaTop: string;
  metaBottom: string;
  children: React.ReactNode;
}

function ChapterShell({ num, metaTop, metaBottom, children }: ChapterShellProps) {
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

function ChapterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display m-0 mb-7 max-w-170 font-extrabold uppercase text-white"
      style={{
        fontSize: "clamp(40px, 5vw, 64px)",
        lineHeight: 0.95,
        letterSpacing: "-0.015em",
      }}
    >
      {children}
    </h2>
  );
}

function ChapterLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 mb-12 max-w-150 text-[18px] font-light leading-[1.55] text-white/65">
      {children}
    </p>
  );
}

interface Step {
  n: string;
  title: string;
  body: React.ReactNode;
}

function StepsList({ items }: { items: Step[] }) {
  return (
    <ol className="m-0 list-none border-t border-[#1E1E1E] p-0">
      {items.map(({ n, title, body }) => (
        <li
          key={n}
          className="grid grid-cols-[40px_1fr] items-baseline gap-4 border-b border-[#1E1E1E] py-7 sm:grid-cols-[60px_1fr] sm:gap-8"
        >
          <span className="font-mono-ctv text-[14px] font-bold tracking-[0.16em] text-[#E8001D]">
            {n}
          </span>
          <div>
            <h3
              className="font-display m-0 mb-2.5 text-[28px] font-extrabold uppercase leading-none text-white"
              style={{ letterSpacing: "-0.005em" }}
            >
              {title}
            </h3>
            <div className="max-w-145 text-[16px] font-light leading-[1.55] text-white/65">
              {body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ChapterProduct() {
  const tiles = [
    { n: "// 01", title: "Predict", body: "On-chain pari-mutuel markets. Stake USDC, share the winning pool." },
    { n: "// 02", title: "Stream", body: "Broadcast with OBS. Earn USDC tips paid straight to your wallet." },
  ];
  return (
    <ChapterShell num="01" metaTop="The product" metaBottom="What it is">
      <ChapterHeading>
        Sports meet <span className="text-[#E8001D]">on-chain economics.</span>
      </ChapterHeading>
      <ChapterLead>
        ChilizTV is a fan-first SocialFi platform on Chiliz Chain. Two primitives any user can pick up in minutes.
      </ChapterLead>
      <div className="grid grid-cols-1 border-t border-l border-[#1E1E1E] lg:grid-cols-2">
        {tiles.map(({ n, title, body }) => (
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

function ChapterPredict() {
  const steps: Step[] = [
    {
      n: "01 →",
      title: "Pick a market",
      body: (
        <>
          <p className="m-0">Three core markets per match:</p>
          <ul className="mt-3.5 list-disc pl-4.5 text-[15px]">
            <li className="py-1">
              <strong className="font-medium text-white">1X2 Winner</strong> — Home / Draw / Away
            </li>
            <li className="py-1">
              <strong className="font-medium text-white">Over/Under goals</strong> — e.g. over 2.5
            </li>
            <li className="py-1">
              <strong className="font-medium text-white">Both teams to score</strong> — Yes / No
            </li>
          </ul>
        </>
      ),
    },
    {
      n: "02 →",
      title: "Choose side and amount",
      body: (
        <p className="m-0">
          Pick an outcome. Stake in USDC, or any supported token — the router converts automatically via Kayen DEX. Dialog shows the live pool, your implied probability and an estimated payout.
        </p>
      ),
    },
    {
      n: "03 →",
      title: "Confirm on-chain",
      body: (
        <p className="m-0">
          One signature. Your stake joins the outcome&apos;s pool the moment the tx mines — immutable until settlement. Final payout depends on the closing pool distribution.
        </p>
      ),
    },
    {
      n: "04 →",
      title: "Settle and claim",
      body: (
        <p className="m-0">
          Result posts on-chain at full-time. Winners sign a claim transaction. USDC lands in your wallet — no middleman, no manual approval.
        </p>
      ),
    },
  ];
  return (
    <ChapterShell num="02" metaTop="Prediction markets" metaBottom="How predictions work">
      <ChapterHeading>
        Predict what <span className="text-[#E8001D]">you know.</span>
      </ChapterHeading>
      <ChapterLead>
        On-chain markets per match. No bookmaker — the crowd&apos;s positions set the implied probability. 5% fee on the winning pool — 1% funds the leaderboard.
      </ChapterLead>
      <StepsList items={steps} />
    </ChapterShell>
  );
}

function Aside({
  label,
  children,
  tinted = false,
}: {
  label: string;
  children: React.ReactNode;
  tinted?: boolean;
}) {
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

function ChapterParimutuel() {
  const steps: Step[] = [
    {
      n: "01 →",
      title: "Pick an outcome",
      body: (
        <p className="m-0">
          Each market has 2-3 outcomes (Home / Draw / Away, Over / Under, etc.). Pick one — your stake joins that outcome&apos;s pool.
        </p>
      ),
    },
    {
      n: "02 →",
      title: "Stake USDC",
      body: (
        <p className="m-0">
          Your stake is locked in the match contract until full-time. Stake in USDC directly, or any supported token — the router converts via Kayen DEX in the same tx.
        </p>
      ),
    },
    {
      n: "03 →",
      title: "Match resolves",
      body: (
        <p className="m-0">
          When the score is final, the resolver reads it on-chain and identifies the winning outcome. The contract closes the market — no manual settlement.
        </p>
      ),
    },
    {
      n: "04 →",
      title: "Claim your share",
      body: (
        <p className="m-0">
          Winners split <strong className="font-medium text-white">95%</strong> of the total pool, pro-rata to their stake on the winning outcome. <strong className="font-medium text-white">5%</strong> protocol fee — <strong className="font-medium text-white">1%</strong> funds the leaderboard rewards, <strong className="font-medium text-white">4%</strong> goes to treasury.
        </p>
      ),
    },
  ];
  return (
    <ChapterShell num="03" metaTop="The economics" metaBottom="How the pool pays out">
      <ChapterHeading>
        Winners split the pool. <span className="text-[#E8001D]">Pari-mutuel.</span>
      </ChapterHeading>
      <ChapterLead>
        No bookmaker. No odds set in advance. The crowd&apos;s positions set the implied probability — winners share what losers staked, minus a small fee.
      </ChapterLead>
      <StepsList items={steps} />
      <p className="mt-10 max-w-200 text-[14px] font-light leading-[1.65] text-white/55">
        <strong className="font-medium text-white">Void protection.</strong> If no one staked on the winning outcome, the market is auto-cancelled and every stake is refunded — no orphan winners, no lost USDC.
      </p>
    </ChapterShell>
  );
}

function EndCTA() {
  return (
    <section className="relative overflow-hidden border-t border-[#1E1E1E] py-30 md:py-35">
      <div
        aria-hidden
        className="font-display pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 font-black uppercase whitespace-nowrap text-[#E8001D]"
        style={{
          fontSize: "clamp(280px, 36vw, 520px)",
          lineHeight: 0.85,
          letterSpacing: "-0.05em",
          opacity: 0.12,
        }}
      >
        Play
      </div>
      <div className={SHELL}>
        <div className="relative z-2 max-w-190">
          <h2
            className="font-display m-0 mb-9 font-black uppercase text-white"
            style={{
              fontSize: "clamp(64px, 9vw, 140px)",
              lineHeight: 0.86,
              letterSpacing: "-0.025em",
            }}
          >
            Ready to <span className="text-[#E8001D]">play?</span>
          </h2>
          <p className="m-0 mb-10 max-w-135 text-[18px] font-light leading-[1.55] text-white/65">
            Join the waitlist or enter your access code to get in.
          </p>
          <GateInline />
        </div>
      </div>
    </section>
  );
}

export function HowItWorksPage() {
  return (
    <section id="how-it-works" className="relative z-4 bg-[#0A0A0A] text-white">
      <Topbar />
      <Hero />
      <ChapterProduct />
      <ChapterPredict />
      <Aside label="// Aside — Where the probability comes from">
        Each outcome&apos;s implied probability is the share of total USDC staked on it. <span className="text-[#E8001D]">The crowd sets the odds.</span> Sharp-book references are shown only as a hint when no positions have been taken yet.
      </Aside>
      <ChapterParimutuel />
      <EndCTA />
    </section>
  );
}
