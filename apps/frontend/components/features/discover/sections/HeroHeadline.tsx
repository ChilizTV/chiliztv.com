import { Eyebrow, LeaderboardFeeChip, VoidProtectionChip } from "../components";

const ACCENT = "#E8001D";

/**
 * Left column of the `/browse` hero. Static pitch copy explaining the
 * pari-mutuel mechanics + two reassurance chips (void-protection, 1%
 * leaderboard slice). No data dependency — safe to render at first paint.
 */
export function HeroHeadline() {
    return (
        <div className="flex flex-col gap-7">
            <Eyebrow>Discover · pari-mutuel pools</Eyebrow>
            <h1
                className="font-display m-0 uppercase leading-[0.88] tracking-[-0.025em] text-white"
                style={{ fontSize: "clamp(56px, 7.6vw, 112px)", fontWeight: 800 }}
            >
                Crowd-set odds.
                <br />
                <span style={{ color: ACCENT }}>Winners share the pool.</span>
            </h1>
            <p className="max-w-[540px] text-[17px] font-light leading-[1.55] text-white/65">
                Every match is a pari-mutuel pool. Stake USDC on an outcome, the implied probability moves with the crowd.
                When the match settles, <span className="text-white">winners share 95% of the pool</span> pro-rata to their stake.
                No bookmaker, no fixed odds, no liquidity provider on the other side.
            </p>
            <div className="flex flex-wrap items-center gap-3">
                <VoidProtectionChip />
                <LeaderboardFeeChip />
            </div>
        </div>
    );
}
