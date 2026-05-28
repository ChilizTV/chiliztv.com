'use client';

import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { useLeaderboardTop } from '@/hooks/api';
import { Eyebrow, GhostBtn, Pill, PrimaryBtn, PulseDot } from '../primitives';
import { LBI } from '../primitives/icons';

interface HeroProps {
    onRules: () => void;
}

const USDC_DECIMALS = 6;

function fmtUsdc(raw: string | undefined): string {
    if (!raw || raw === '0') return '0';
    return Number(formatUnits(BigInt(raw), USDC_DECIMALS)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });
}

/**
 * Hero — live prize pool snapshot + CTA to start betting. Pool figures and
 * cycle metadata come from the leaderboard DTO; nothing is hardcoded "TBA".
 */
export function Hero({ onRules }: HeroProps) {
    const router = useRouter();
    const { data } = useLeaderboardTop(1);
    const prizePool = data?.currentPrizePool ?? '0';
    const epochId = data?.currentEpochId ?? 0;
    const volume = data?.currentEpochVolume ?? '0';
    const topN = data?.topN ?? 10;
    const claimDurationDays = data?.claimDurationDays ?? 7;
    const isEmpty = prizePool === '0';

    return (
        <section className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-16 pt-20 sm:px-14 sm:pb-20 sm:pt-28">
            <Eyebrow>Leaderboard · Live</Eyebrow>

            <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
                {/* Left — copy */}
                <div>
                    <h1
                        className="font-display m-0 uppercase leading-[0.86] tracking-[-0.018em] text-white"
                        style={{ fontSize: 'clamp(56px, 8vw, 108px)', fontWeight: 800 }}
                    >
                        The best
                        <br />
                        predictors <span className="text-[#E8001D]">win</span>
                        <br />
                        every cycle.
                    </h1>

                    <p className="mt-7 max-w-[560px] text-[17px] font-light leading-[1.55] text-white/65">
                        Cycle paid in USDC on Chiliz Chain. Top {topN} predictors split the pool pro-rata by their cumulative payouts. No tier, no subscription — just signal.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <PrimaryBtn onClick={() => router.push('/browse')}>
                            Place a prediction {LBI.arrowRight}
                        </PrimaryBtn>
                        <GhostBtn onClick={onRules}>
                            How payouts work {LBI.arrowDown}
                        </GhostBtn>
                    </div>
                </div>

                {/* Right — live pool card */}
                <div className="relative">
                    <div
                        className="relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111] p-7"
                        style={{ boxShadow: '0 0 60px rgba(45,212,164,0.04)' }}
                    >
                        <div className="flex items-center justify-between">
                            <Eyebrow color="#F5C518">Prize pool</Eyebrow>
                            <Pill
                                border="rgba(45,212,164,0.4)"
                                color="#2dd4a4"
                                icon={<PulseDot color="#2dd4a4" />}
                            >
                                Live
                            </Pill>
                        </div>

                        <div className="mt-7 flex items-end gap-3">
                            <div
                                className="font-display font-extrabold uppercase leading-[0.88] tabular-nums"
                                style={{
                                    color: '#F5C518',
                                    fontSize: 'clamp(56px, 6vw, 88px)',
                                    letterSpacing: '-0.03em',
                                }}
                            >
                                {fmtUsdc(prizePool)}
                            </div>
                            <div className="font-mono-ctv pb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">
                                USDC
                            </div>
                        </div>
                        <div className="font-mono-ctv mt-3 text-[11px] uppercase tracking-[0.18em] text-white/45">
                            {isEmpty
                                ? 'Pool builds up as predictions resolve'
                                : `Funded on-chain · Top ${topN} paid`}
                        </div>

                        <div className="mt-6 h-px w-full bg-[#1E1E1E]" />

                        <div className="mt-4 grid grid-cols-3 gap-4">
                            <PoolFact label="Epoch" value={`#${epochId}`} />
                            <PoolFact label="Volume" value={`${fmtUsdc(volume)} USDC`} />
                            <PoolFact label="Claim window" value={`${claimDurationDays}d`} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PoolFact({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/45">
                {label}
            </div>
            <div className="font-display text-[18px] font-bold uppercase tracking-tight text-white">
                {value}
            </div>
        </div>
    );
}
