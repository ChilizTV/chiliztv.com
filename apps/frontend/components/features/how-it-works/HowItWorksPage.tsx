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
              Bet on live football, stream matches yourself, and earn from the on-chain liquidity pool. The full picture — in under five minutes.
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
    { n: "// 01", title: "Bet", body: "On-chain prediction markets. Settled in USDC. Zero placement fees." },
    { n: "// 02", title: "Stream", body: "Broadcast with OBS. Earn USDC tips paid straight to your wallet." },
    { n: "// 03", title: "LP", body: "Deposit USDC. Earn 60% of every losing bet, auto-compounded." },
  ];
  return (
    <ChapterShell num="01" metaTop="The product" metaBottom="What it is">
      <ChapterHeading>
        Sports meet <span className="text-[#E8001D]">on-chain economics.</span>
      </ChapterHeading>
      <ChapterLead>
        ChilizTV is a fan-first SocialFi platform on Chiliz Chain. Three primitives any user can pick up in minutes.
      </ChapterLead>
      <div className="grid grid-cols-1 border-t border-l border-[#1E1E1E] sm:grid-cols-2 lg:grid-cols-3">
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

function ChapterBetting() {
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
          Pick an outcome. Stake in USDC, or any supported token — the router converts automatically via Kayen DEX. Dialog shows live odds, payout, net winnings, slippage tolerance.
        </p>
      ),
    },
    {
      n: "03 →",
      title: "Confirm on-chain",
      body: (
        <p className="m-0">
          One signature. Position locks at the odds the moment your transaction mines — not when you opened the dialog. Immutable until settlement.
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
    <ChapterShell num="02" metaTop="Prediction markets" metaBottom="How betting works">
      <ChapterHeading>
        Bet on what <span className="text-[#E8001D]">you know.</span>
      </ChapterHeading>
      <ChapterLead>
        On-chain markets per match. Odds blended from five sharp bookmakers via oracle. Bettors pay zero fees — the edge is in the pool, not the spread.
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

function PoolFlowSvg() {
  return (
    <div
      role="img"
      aria-label="Pool flow: losing bets split 40% treasury / 60% LP NAV; winning bets paid 100% by the pool with no treasury share."
      className="my-12 border-y border-[#1E1E1E] py-9"
    >
      <div className="font-mono-ctv mb-7 flex items-center gap-3.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#E8001D]">
        <span aria-hidden className="block h-px w-6 bg-[#E8001D]" />
        // The flow — losing bets / winning bets
      </div>
      <svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" className="block h-auto w-full max-w-190">
        <defs>
          <marker id="v3-arr-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#E8001D" />
          </marker>
          <marker id="v3-arr-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#2dd4a4" />
          </marker>
          <marker id="v3-arr-mute" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="rgba(255,255,255,0.4)" />
          </marker>
        </defs>
        <g style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
          <rect x="20" y="40" width="140" height="56" fill="#0A0A0A" stroke="#1E1E1E" />
          <text x="90" y="66" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" letterSpacing="0.14em">Bettors</text>
          <text x="90" y="84" textAnchor="middle" fill="#E8001D" fontSize="11" fontWeight="700" letterSpacing="0.14em">lose</text>

          <rect x="250" y="32" width="140" height="72" fill="#0A0A0A" stroke="#E8001D" strokeWidth="1.5" />
          <text x="320" y="62" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" letterSpacing="0.14em">Pool</text>
          <text x="320" y="82" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10" fontWeight="500" letterSpacing="0.16em">USDC vault</text>

          <rect x="480" y="10" width="140" height="56" fill="#0A0A0A" stroke="#1E1E1E" />
          <text x="550" y="36" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" letterSpacing="0.14em">Treasury</text>
          <text x="550" y="54" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10" fontWeight="500" letterSpacing="0.16em">protocol reserve</text>

          <rect x="480" y="80" width="140" height="56" fill="#0A0A0A" stroke="#1E1E1E" />
          <text x="550" y="106" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" letterSpacing="0.14em">LP NAV</text>
          <text x="550" y="124" textAnchor="middle" fill="#2dd4a4" fontSize="11" fontWeight="700" letterSpacing="0.14em">↑ compounds</text>

          <line x1="160" y1="68" x2="246" y2="68" stroke="#E8001D" strokeWidth="2" markerEnd="url(#v3-arr-red)" />
          <path d="M390 56 C 430 48, 450 40, 476 38" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" markerEnd="url(#v3-arr-mute)" />
          <text x="432" y="32" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10" fontWeight="500" letterSpacing="0.16em">40%</text>
          <path d="M390 80 C 430 90, 450 100, 476 108" fill="none" stroke="#2dd4a4" strokeWidth="2" markerEnd="url(#v3-arr-green)" />
          <text x="432" y="108" textAnchor="middle" fill="#2dd4a4" fontSize="11" fontWeight="700" letterSpacing="0.14em">60%</text>

          <line x1="20" y1="180" x2="620" y2="180" stroke="#1E1E1E" strokeDasharray="3 4" />

          <rect x="20" y="220" width="140" height="56" fill="#0A0A0A" stroke="#1E1E1E" />
          <text x="90" y="246" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" letterSpacing="0.14em">Bettors</text>
          <text x="90" y="264" textAnchor="middle" fill="#2dd4a4" fontSize="11" fontWeight="700" letterSpacing="0.14em">win</text>

          <rect x="250" y="220" width="140" height="56" fill="#0A0A0A" stroke="#E8001D" strokeWidth="1.5" />
          <text x="320" y="246" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" letterSpacing="0.14em">Pool</text>
          <text x="320" y="264" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10" fontWeight="500" letterSpacing="0.16em">full payout</text>

          <line x1="246" y1="248" x2="164" y2="248" stroke="#2dd4a4" strokeWidth="2" markerEnd="url(#v3-arr-green)" />
          <text x="205" y="240" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10" fontWeight="500" letterSpacing="0.16em">100%</text>

          <text x="420" y="244" textAnchor="start" fill="rgba(255,255,255,0.45)" fontSize="10" fontWeight="500" letterSpacing="0.16em">No treasury share</text>
          <text x="420" y="264" textAnchor="start" fill="rgba(255,255,255,0.45)" fontSize="10" fontWeight="500" letterSpacing="0.16em">LP carries the loss</text>
        </g>
      </svg>
    </div>
  );
}

function ChapterLiquidity() {
  const stats = [
    { v: "60", label: "Your share", b: "Of every losing bet" },
    { v: "40", label: "Treasury share", b: "Protocol reserve" },
    { v: "05", label: "Performance fee", b: "On gain only" },
  ];
  const steps: Step[] = [
    {
      n: "01 →",
      title: "Open the pool tab",
      body: (
        <p className="m-0">
          Head to <strong className="font-medium text-white">Discover → Pool</strong>. The pool is global — it backs every match. Live: TVL, liabilities, utilization, free balance, APY.
        </p>
      ),
    },
    {
      n: "02 →",
      title: "Deposit USDC",
      body: (
        <p className="m-0">
          You receive <strong className="font-medium text-white">ctvLP</strong> shares — an ERC-4626 vault token. No lock-up. Brief cooldown after deposit prevents flash-NAV manipulation.
        </p>
      ),
    },
    {
      n: "03 →",
      title: "Compound automatically",
      body: (
        <p className="m-0">
          Every losing bet flows back into the pool. 40% to treasury, 60% into your share NAV. Share price rises silently — no claim needed.
        </p>
      ),
    },
    {
      n: "04 →",
      title: "Withdraw on your schedule",
      body: (
        <p className="m-0">
          Redeem anytime after the cooldown. 5% performance fee applies only to the gain above your cost basis. Loss-only exits are fee-free.
        </p>
      ),
    },
  ];
  return (
    <ChapterShell num="03" metaTop="The other side" metaBottom="Provide liquidity">
      <ChapterHeading>
        Be the house. <span className="text-[#E8001D]">Earn the edge.</span>
      </ChapterHeading>
      <ChapterLead>
        Don&apos;t pick a winner — take the other side of every bet on the platform. Deposit USDC, receive ctvLP, earn from losing bets. No active management.
      </ChapterLead>

      <div className="grid grid-cols-1 border-t border-l border-[#1E1E1E] lg:grid-cols-3">
        {stats.map(({ v, label, b }) => (
          <div key={label} className="border-r border-b border-[#1E1E1E] px-8 pt-10 pb-12">
            <div
              className="font-display font-black text-[#E8001D]"
              style={{
                fontSize: "clamp(80px, 9vw, 140px)",
                lineHeight: 0.9,
                letterSpacing: "-0.035em",
                marginBottom: "14px",
              }}
            >
              {v}
              <span style={{ fontSize: "0.5em", color: "#fff" }}>%</span>
            </div>
            <div className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
              {label}
              <b className="mt-1 block font-bold text-white">{b}</b>
            </div>
          </div>
        ))}
      </div>

      <PoolFlowSvg />

      <StepsList items={steps} />
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
      <ChapterBetting />
      <Aside label="// Aside — Where the odds come from">
        Five sharp books — <span className="text-[#E8001D]">Pinnacle, Betfair, Bet365, 1xBet, Marathonbet</span> — blended on-chain via an API. ~4% house margin. The pool quotes; <span className="text-[#E8001D]">bettors take it or leave it.</span>
      </Aside>
      <ChapterLiquidity />
      <Aside label="// Critical — LP is not risk-free" tinted>
        When bettors win, the pool pays in full. <span className="text-[#E8001D]">Your ctvLP shares can be worth less</span> than what you deposited. The treasury shares the upside, <span className="text-[#E8001D]">not the downside.</span> Size your position accordingly.
      </Aside>
      <EndCTA />
    </section>
  );
}
