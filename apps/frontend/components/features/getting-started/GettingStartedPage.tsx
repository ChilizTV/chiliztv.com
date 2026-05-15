"use client";

import {
  Sparkles,
  Wallet,
  TrendingUp,
  Droplets,
  Radio,
  ShieldCheck,
  Trophy,
  HelpCircle,
  Copy,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SECTIONS = [
  { title: "Welcome", anchor: "welcome", icon: Sparkles },
  { title: "Get Started", anchor: "get-started", icon: Wallet },
  { title: "How Betting Works", anchor: "betting", icon: TrendingUp },
  { title: "Liquidity Pools", anchor: "liquidity", icon: Droplets },
  { title: "Stream a Match", anchor: "streaming", icon: Radio },
  { title: "Rules & Content", anchor: "rules", icon: ShieldCheck },
  { title: "Earn & Rank Up", anchor: "earn", icon: Trophy },
  { title: "Need Help?", anchor: "help", icon: HelpCircle },
];

export function GettingStartedPage() {
  const router = useRouter();
  const rtmpServer = process.env.NEXT_PUBLIC_RTMP_URL ?? "rtmp://stream.chiliztv.com/live";

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0A0A0A", fontFamily: "'Lexend', sans-serif" }}
    >
      {/* Hero band */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0A0A0A 0%, #1a0005 50%, #0A0A0A 100%)",
          borderBottom: "1px solid #1E1E1E",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{
                background: "rgba(232,0,29,0.15)",
                border: "1px solid rgba(232,0,29,0.3)",
              }}
            >
              <Sparkles size={20} style={{ color: "#E8001D" }} />
            </div>
            <span
              className="text-[11px] font-bold tracking-[0.16em] uppercase"
              style={{ color: "#E8001D" }}
            >
              Newcomer&apos;s Guide
            </span>
          </div>

          <h1
            className="text-[48px] sm:text-[64px] font-black leading-[0.95] text-white mb-6"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            New to ChilizTV?
            <br />
            <span style={{ color: "#E8001D" }}>Start Here.</span>
          </h1>

          <p className="text-[17px] text-white/60 max-w-xl leading-relaxed">
            Bet on live sports, stream matches yourself, and earn from the
            liquidity pool — all in one place. Here&apos;s how it works in
            under five minutes.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => router.push("/browse")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#FF1737]"
              style={{ background: "#E8001D" }}
            >
              Discover Matches
              <ArrowRight size={14} />
            </button>
            <a
              href="#get-started"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-[12px] font-bold uppercase tracking-[0.14em] text-white/80 transition-colors hover:text-white"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid #2A2A2A",
              }}
            >
              Read the Guide
            </a>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-16 flex flex-col lg:flex-row gap-12">
        {/* Sidebar TOC */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <p
              className="text-[10px] font-bold tracking-[0.14em] uppercase mb-4"
              style={{ color: "#555" }}
            >
              On this page
            </p>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.anchor}
                    href={`#${s.anchor}`}
                    className="flex items-center gap-2 text-[13px] py-1.5 px-3 rounded transition-colors duration-150"
                    style={{ color: "#666" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                      (e.currentTarget as HTMLAnchorElement).style.background = "#1A1A1A";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#666";
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    }}
                  >
                    <Icon size={13} />
                    {s.title}
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Welcome */}
          <Section id="welcome" title="Welcome" icon={Sparkles}>
            <p className="text-[15px] leading-relaxed text-white/70 mb-4">
              ChilizTV is a fan-first SocialFi platform where sports meet
              on-chain economics. Anyone can:
            </p>
            <ul className="space-y-2 text-[14px] text-white/65">
              <li className="flex gap-2">
                <span className="text-[#E8001D] font-bold">·</span>
                <span>
                  <span className="text-white font-medium">Watch</span> live
                  matches streamed by the community.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#E8001D] font-bold">·</span>
                <span>
                  <span className="text-white font-medium">Bet</span> on outcomes
                  through on-chain prediction markets.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#E8001D] font-bold">·</span>
                <span>
                  <span className="text-white font-medium">Stream</span> your own
                  feed and earn from viewers and bets.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#E8001D] font-bold">·</span>
                <span>
                  <span className="text-white font-medium">Provide liquidity</span>{" "}
                  to markets and collect a share of the fees.
                </span>
              </li>
            </ul>
          </Section>

          {/* Get Started */}
          <Section id="get-started" title="Get Started in 3 Steps" icon={Wallet}>
            <Steps
              steps={[
                {
                  title: "Connect a wallet",
                  body: (
                    <>
                      Click <span className="text-white font-medium">Connect Wallet</span>{" "}
                      in the top-right. We support most major wallets via Dynamic — MetaMask,
                      Rabby, WalletConnect, and embedded socials.
                    </>
                  ),
                },
                {
                  title: "Fund with CHZ",
                  body: (
                    <>
                      ChilizTV runs on the <span className="text-white font-medium">Chiliz Chain</span>.
                      Bridge or buy CHZ, the native gas + collateral token, then
                      deposit it into your wallet.
                    </>
                  ),
                },
                {
                  title: "Pick a match",
                  body: (
                    <>
                      Head to <span className="text-white font-medium">Discover</span> and open
                      any live or upcoming match. From there you can watch, bet,
                      stream, or supply liquidity.
                    </>
                  ),
                },
              ]}
            />
          </Section>

          {/* Betting */}
          <Section id="betting" title="How Betting Works" icon={TrendingUp}>
            <p className="text-[15px] leading-relaxed text-white/70 mb-5">
              Every match has an on-chain prediction market — usually{" "}
              <span className="text-white">Home win / Draw / Away win</span>. Odds
              are derived from the pool itself: the more CHZ is staked on one
              side, the lower its payout multiplier.
            </p>

            <Steps
              steps={[
                {
                  title: "Choose your side",
                  body: "Open a match page and select the outcome you want to back.",
                },
                {
                  title: "Enter your stake",
                  body: (
                    <>
                      Type the amount of CHZ you want to wager. The interface
                      shows your <span className="text-white">potential payout</span> and the
                      current odds in real time.
                    </>
                  ),
                },
                {
                  title: "Confirm on-chain",
                  body: "Sign the transaction in your wallet. Your position is now locked in until the match settles.",
                },
                {
                  title: "Settlement",
                  body: (
                    <>
                      Once the match ends, the result is posted on-chain.
                      Winners can claim their payout directly from the match page
                      — no middleman, no manual approval.
                    </>
                  ),
                },
              ]}
            />

            <InfoCallout tone="info">
              Odds shift live as more bets come in. If you like a side at a good
              price, locking it in early usually pays better.
            </InfoCallout>
          </Section>

          {/* Liquidity */}
          <Section id="liquidity" title="Provide Liquidity, Earn from Losing Bets" icon={Droplets}>
            <p className="text-[15px] leading-relaxed text-white/70 mb-3">
              Don&apos;t want to pick a winner? You can deposit CHZ into a match
              pool as a <span className="text-white">liquidity provider (LP)</span>.
              The pool takes the other side of every bet: when bettors lose, the
              pool keeps their stake; when bettors win, the pool pays them out.
            </p>
            <p className="text-[15px] leading-relaxed text-white/70 mb-5">
              Bettors{" "}
              <span className="text-white">don&apos;t pay a trading fee</span>{" "}
              — the LP edge comes from being the counterparty, not from a cut on
              each bet.
            </p>

            <Steps
              steps={[
                {
                  title: "Open a match → Liquidity tab",
                  body: "Each market has a dedicated LP section showing pool size and current exposure.",
                },
                {
                  title: "Deposit CHZ",
                  body: "Pick an amount and confirm. You receive LP shares that represent your slice of the pool.",
                },
                {
                  title: "Earn from losing bets",
                  body: "Every stake that ends up on the losing side flows into the pool, pro-rata to LP shares.",
                },
                {
                  title: "Withdraw after settlement",
                  body: (
                    <>
                      Once the match settles you can redeem your LP shares for
                      CHZ + your share of the pool&apos;s net P&amp;L.
                    </>
                  ),
                },
              ]}
            />

            {/* Loss split */}
            <div className="mt-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45 mb-3">
                If the pool loses on a match
              </div>
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: "#111", border: "1px solid #1E1E1E" }}
              >
                <div className="grid grid-cols-2 divide-x divide-[#1E1E1E]">
                  <div className="p-4">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1">
                      Liquidity Providers
                    </div>
                    <div
                      className="text-[28px] font-black leading-none"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#E8001D" }}
                    >
                      60%
                    </div>
                    <div className="text-[11px] text-white/45 mt-1">of losses</div>
                  </div>
                  <div className="p-4">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1">
                      House (Protocol Reserve)
                    </div>
                    <div
                      className="text-[28px] font-black leading-none"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#F5C518" }}
                    >
                      40%
                    </div>
                    <div className="text-[11px] text-white/45 mt-1">of losses</div>
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-white/55 mt-3 leading-relaxed">
                LPs only carry <span className="text-white">60%</span> of the
                downside while keeping the upside of being the counterparty.
              </p>
            </div>

            <InfoCallout tone="warn">
              Providing liquidity is not risk-free — your LP shares can be worth
              less than you deposited if too many bets land correctly.
              Diversify across matches.
            </InfoCallout>
          </Section>

          {/* Streaming */}
          <Section id="streaming" title="Stream a Match with OBS" icon={Radio}>
            <p className="text-[15px] leading-relaxed text-white/70 mb-5">
              Anyone can broadcast. Open a match page, hit{" "}
              <span className="text-white">&quot;Go Live&quot;</span>, and ChilizTV will
              generate a private <span className="text-white">stream key</span>{" "}
              just for you. Then point OBS at our ingest server.
            </p>

            <Steps
              steps={[
                {
                  title: "Install OBS Studio",
                  body: (
                    <>
                      Free and open-source — grab it from{" "}
                      <a
                        href="https://obsproject.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: "#E8001D" }}
                      >
                        obsproject.com
                      </a>{" "}
                      (Windows, macOS, Linux).
                    </>
                  ),
                },
                {
                  title: "Open Settings → Stream",
                  body: (
                    <>
                      In OBS, click <span className="text-white">Settings</span>,
                      then the <span className="text-white">Stream</span> tab in the sidebar.
                    </>
                  ),
                },
                {
                  title: "Service: Custom…",
                  body: "From the Service dropdown, choose Custom… so you can paste your own URL and key.",
                },
                {
                  title: "Paste the Server URL",
                  body: (
                    <>
                      <div className="mb-2">Use the RTMP ingest URL shown on your stream page:</div>
                      <CodeRow value={rtmpServer} />
                    </>
                  ),
                },
                {
                  title: "Paste your Stream Key",
                  body: (
                    <>
                      Copy the unique <span className="text-white">Stream Key</span>{" "}
                      from your match&apos;s streaming panel into OBS&apos;s
                      Stream Key field. Treat it like a password — never share
                      it.
                    </>
                  ),
                },
                {
                  title: "Apply → Start Streaming",
                  body: (
                    <>
                      Click <span className="text-white">Apply</span>, close
                      Settings, then press{" "}
                      <span className="text-white">Start Streaming</span> in the
                      main OBS window. Within ~4 seconds the match page should
                      flip to <span style={{ color: "#E8001D" }} className="font-bold">LIVE</span>.
                    </>
                  ),
                },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <RecoCard label="Recommended encoder" value="x264 / NVENC" />
              <RecoCard label="Output resolution" value="1280×720 or 1920×1080" />
              <RecoCard label="Frame rate" value="30 or 60 fps" />
              <RecoCard label="Video bitrate" value="3500–6000 kbps" />
            </div>

            <InfoCallout tone="info">
              If the LIVE badge doesn&apos;t light up, double-check the Server
              URL and Stream Key, and make sure your firewall allows outbound
              port 1935 (RTMP).
            </InfoCallout>
          </Section>

          {/* Rules */}
          <Section id="rules" title="Content Rules — Read This" icon={ShieldCheck}>
            <p className="text-[15px] leading-relaxed text-white/70 mb-5">
              ChilizTV is a community streaming platform. To keep the protocol
              and our streamers safe, there are a few hard rules:
            </p>

            <div className="space-y-3">
              <RuleCard
                allowed={false}
                title="No re-broadcasting licensed feeds"
                body="Do not rebroadcast official TV channels, paid streaming services, or any feed you don't own the rights to. Licensed matches (Premier League, Champions League, etc.) cannot be retransmitted here."
              />
              <RuleCard
                allowed={true}
                title="Your own football content is welcome"
                body="Amateur matches, local league games, training sessions, watch-along commentary, analysis, fan reactions, futsal, street football — if you own or have permission for the footage, you can stream it."
              />
              <RuleCard
                allowed={true}
                title="More sports coming soon"
                body="Football is live first. Basketball, MMA, tennis, motorsport and esports markets are on the roadmap — same rules will apply."
              />
              <RuleCard
                allowed={false}
                title="No illegal, hateful or NSFW content"
                body="Standard stuff: nothing illegal, no harassment, no hate speech, no sexual content. Violations get the stream cut and the streamer slashed."
              />
            </div>

            <InfoCallout tone="warn">
              Streams may be reviewed at any time. Repeated or serious
              violations can result in a permanent ban and loss of staked
              rewards.
            </InfoCallout>
          </Section>

          {/* Earn */}
          <Section id="earn" title="Earn & Rank Up" icon={Trophy}>
            <p className="text-[15px] leading-relaxed text-white/70 mb-4">
              Activity is rewarded. Betting, streaming and providing liquidity
              all contribute to your on-chain reputation and your position on
              the <span className="text-white">Leaderboard</span>.
            </p>
            <ul className="space-y-2 text-[14px] text-white/65">
              <li className="flex gap-2">
                <span className="text-[#F5C518] font-bold">★</span>
                <span>
                  <span className="text-white">Winning bets</span> grow your
                  P&amp;L and visible track record.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#F5C518] font-bold">★</span>
                <span>
                  <span className="text-white">Streamers</span> earn from
                  viewers, tips, and a share of pool fees for hosted matches.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#F5C518] font-bold">★</span>
                <span>
                  <span className="text-white">LPs</span> stack fees every time
                  a bet is placed in their pool.
                </span>
              </li>
            </ul>
            <button
              onClick={() => router.push("/leaderboard")}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors"
              style={{
                background: "rgba(245,197,24,0.08)",
                border: "1px solid rgba(245,197,24,0.25)",
                color: "#F5C518",
              }}
            >
              View Leaderboard
              <ArrowRight size={12} />
            </button>
          </Section>

          {/* Help */}
          <Section id="help" title="Need Help?" icon={HelpCircle}>
            <p className="text-[15px] leading-relaxed text-white/70 mb-4">
              Still stuck? Two good next steps:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/whitepaper")}
                className="rounded-lg p-5 text-left transition-colors hover:bg-[#161616]"
                style={{ background: "#111", border: "1px solid #1E1E1E" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45 mb-2">
                  Deep dive
                </div>
                <div className="text-[15px] font-medium text-white mb-1">
                  Read the Whitepaper
                </div>
                <div className="text-[12px] text-white/50">
                  Protocol mechanics, tokenomics, governance.
                </div>
              </button>
              <button
                onClick={() => router.push("/browse")}
                className="rounded-lg p-5 text-left transition-colors hover:bg-[#161616]"
                style={{ background: "#111", border: "1px solid #1E1E1E" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45 mb-2">
                  Jump in
                </div>
                <div className="text-[15px] font-medium text-white mb-1">
                  Browse Live Matches
                </div>
                <div className="text-[12px] text-white/50">
                  The fastest way to learn is to try one.
                </div>
              </button>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: "#E8001D" }} />
        <Icon size={18} style={{ color: "#E8001D" }} />
        <h2
          className="text-[22px] font-bold uppercase tracking-[0.05em] leading-none text-white"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Steps({
  steps,
}: {
  steps: { title: string; body: React.ReactNode }[];
}) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li
          key={i}
          className="flex gap-4 rounded-lg p-4"
          style={{ background: "#111", border: "1px solid #1E1E1E" }}
        >
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold"
            style={{
              background: "rgba(232,0,29,0.12)",
              border: "1px solid rgba(232,0,29,0.3)",
              color: "#E8001D",
            }}
          >
            {i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold text-white mb-1">{s.title}</div>
            <div className="text-[13px] leading-relaxed text-white/60">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CodeRow({ value }: { value: string }) {
  const copy = () => navigator.clipboard.writeText(value);
  return (
    <div className="flex gap-2 mt-1">
      <div className="flex-1 truncate rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[11px] text-white/80 select-all font-mono">
        {value}
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65 transition-colors hover:border-[#3A3A3A] hover:text-white"
      >
        <Copy size={11} />
        Copy
      </button>
    </div>
  );
}

function RecoCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-md px-4 py-3"
      style={{ background: "#111", border: "1px solid #1E1E1E" }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 mb-1">
        {label}
      </div>
      <div className="text-[13px] text-white/85">{value}</div>
    </div>
  );
}

function InfoCallout({
  tone,
  children,
}: {
  tone: "info" | "warn";
  children: React.ReactNode;
}) {
  const palette =
    tone === "warn"
      ? { border: "rgba(245,197,24,0.3)", bg: "rgba(245,197,24,0.06)", fg: "#F5C518" }
      : { border: "rgba(232,0,29,0.3)", bg: "rgba(232,0,29,0.06)", fg: "#E8001D" };
  return (
    <div
      className="mt-5 rounded-md px-4 py-3 text-[12px] leading-relaxed"
      style={{ border: `1px solid ${palette.border}`, background: palette.bg, color: "rgba(255,255,255,0.75)" }}
    >
      <span className="font-bold mr-2 uppercase tracking-[0.14em] text-[10px]" style={{ color: palette.fg }}>
        {tone === "warn" ? "Heads up" : "Tip"}
      </span>
      {children}
    </div>
  );
}

function RuleCard({
  allowed,
  title,
  body,
}: {
  allowed: boolean;
  title: string;
  body: string;
}) {
  const Icon = allowed ? CheckCircle2 : XCircle;
  const color = allowed ? "#2dd4a4" : "#E8001D";
  return (
    <div
      className="rounded-lg p-4 flex gap-3"
      style={{ background: "#111", border: "1px solid #1E1E1E" }}
    >
      <Icon size={18} className="flex-shrink-0 mt-0.5" style={{ color }} />
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-white mb-1">{title}</div>
        <div className="text-[13px] leading-relaxed text-white/60">{body}</div>
      </div>
    </div>
  );
}
