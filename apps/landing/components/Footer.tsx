import Image from "next/image";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const X_URL = "https://x.com/predcast";
const DISCORD_URL = "https://discord.gg";

const NAV_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Discover", href: `${APP_URL}/browse`, external: true },
  { label: "Leaderboard", href: `${APP_URL}/leaderboard`, external: true },
  { label: "Dashboard", href: `${APP_URL}/dashboard`, external: true },
];

const X_ICON = (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DISCORD_ICON = (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" aria-hidden>
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

function SocialIconBtn({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#2A2A2A] bg-[#111] text-white/65 transition-all hover:-translate-y-px hover:border-[#E8001D] hover:bg-[#E8001D]/10 hover:text-white"
    >
      <span className="inline-flex h-[42%] w-[42%]">{icon}</span>
    </a>
  );
}

export function Footer() {
  return (
    <div className="relative overflow-hidden bg-[#0A0A0A] text-white">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(232,0,29,0.6), transparent)",
        }}
      />

      <footer className="relative border-t border-[#1E1E1E]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-8 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-14">
          {/* Brand */}
          <Link href="/" className="flex items-center" aria-label="PredCast home">
            <Image
              src="/predcast-logo.svg"
              alt="PredCast"
              width={156}
              height={24}
              className="h-6 w-auto"
            />
          </Link>

          {/* Nav */}
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {NAV_LINKS.map(({ label, href, external }) =>
              external ? (
                <a
                  key={href}
                  href={href}
                  className="font-mono-ctv group relative text-[11px] font-bold uppercase tracking-[0.18em] text-white/75 transition-colors hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-px after:scale-x-0 after:bg-[#E8001D] after:transition-transform after:duration-200 hover:after:scale-x-100"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="font-mono-ctv group relative text-[11px] font-bold uppercase tracking-[0.18em] text-white/75 transition-colors hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-px after:scale-x-0 after:bg-[#E8001D] after:transition-transform after:duration-200 hover:after:scale-x-100"
                >
                  {label}
                </Link>
              )
            )}
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-3">
            <SocialIconBtn href={X_URL} label="PredCast on X" icon={X_ICON} />
            <SocialIconBtn
              href={DISCORD_URL}
              label="PredCast on Discord"
              icon={DISCORD_ICON}
            />
          </div>
        </div>

        {/* Fine print */}
        <div className="border-t border-[#161616]">
          <div className="mx-auto flex max-w-[1400px] px-8 py-4 sm:px-14">
            <span className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/30">
              © {new Date().getFullYear()} PredCast · all rights reserved
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
