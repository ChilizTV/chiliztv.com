import Link from "next/link";
import { Eyebrow } from "../components";
import { fmtNbsp } from "../domain";
import type { HeroData } from "../hooks";

const ACCENT = "#E8001D";

interface EpochPrizePoolTileProps {
    readonly hero: HeroData;
}

/**
 * Right column of the `/browse` hero — the current epoch's prize-pool
 * snapshot. Pure presentation: data is pre-shaped by `useHeroData` and
 * passed in by `HeroStrip`. The bottom 2-cell grid surfaces real protocol
 * state (volume staked this epoch + connected wallet's rank).
 */
export function EpochPrizePoolTile({ hero }: EpochPrizePoolTileProps) {
    const {
        wallet,
        epochId,
        prizePoolUsdc,
        currentEpochVolumeUsdc,
        topCount,
        myRank,
        myScoreUsdc,
    } = hero;

    return (
        <div
            className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-[#1E1E1E] bg-[#111] p-7"
            style={{
                background:
                    "radial-gradient(ellipse at top right, rgba(232,0,29,0.10), transparent 60%), #111",
            }}
        >
            <span
                aria-hidden
                className="font-mono-ctv absolute right-5 top-5 text-[10px] uppercase tracking-[0.22em] text-white/35"
            >
                Epoch · {epochId !== null ? String(epochId).padStart(2, "0") : "—"}
            </span>

            <div className="flex flex-col gap-2">
                <Eyebrow dim>Leaderboard prize pool</Eyebrow>
                <div
                    className="font-display flex items-baseline gap-3 leading-none tracking-[-0.025em] text-white"
                    style={{ fontSize: "clamp(72px, 8vw, 108px)", fontWeight: 800 }}
                >
                    ${fmtNbsp(prizePoolUsdc)}
                    <span className="font-mono-ctv text-[12px] font-bold uppercase tracking-[0.18em] text-white/45">
                        USDC
                    </span>
                </div>
                <p className="text-[13px] leading-[1.55] text-white/55">
                    Funded by 1% of every stake placed this month. Top-{topCount}+ predictors share it via merkle drop at epoch close.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[#1E1E1E] pt-5">
                <div>
                    <div className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/45">
                        Volume staked
                    </div>
                    <div className="font-display mt-1 flex items-baseline gap-2 text-[22px] font-extrabold leading-none tracking-[-0.01em] text-white">
                        ${fmtNbsp(currentEpochVolumeUsdc)}
                        <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
                            USDC · this epoch
                        </span>
                    </div>
                </div>
                <div>
                    <div className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/45">Your rank</div>
                    <div
                        className="font-display mt-1 flex items-baseline gap-2 text-[22px] font-extrabold leading-none tracking-[-0.01em]"
                        style={{ color: wallet ? ACCENT : "rgba(255,255,255,0.45)" }}
                    >
                        {!wallet ? "—" : myRank !== null ? `#${myRank}` : "Unranked"}
                        <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
                            {wallet ? `${fmtNbsp(myScoreUsdc)} pts` : "Connect wallet"}
                        </span>
                    </div>
                </div>
            </div>

            <Link
                href="/leaderboard"
                className="font-mono-ctv inline-flex items-center justify-between rounded-md border border-[#2A2A2A] bg-transparent px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85 transition-colors hover:border-[#E8001D] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
            >
                <span>See full leaderboard</span>
                <span aria-hidden>→</span>
            </Link>
        </div>
    );
}
