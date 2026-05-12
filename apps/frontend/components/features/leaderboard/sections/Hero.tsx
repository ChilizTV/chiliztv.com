'use client';

import { Eyebrow, GhostBtn, Pill, PrimaryBtn, PulseDot } from '../primitives';
import { LBI } from '../primitives/icons';

interface HeroProps {
    onNotify: () => void;
    onRules: () => void;
}

/**
 * Hero — large display title + side teaser card showing the prize-pool
 * placeholder ("TBA") since the real number isn't decided yet.
 */
export function Hero({ onNotify, onRules }: HeroProps) {
    return (
        <section className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-16 pt-20 sm:px-14 sm:pb-20 sm:pt-28">
            <Eyebrow>Leaderboard · Coming soon</Eyebrow>

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
                        every month.
                    </h1>

                    <p className="mt-7 max-w-[560px] text-[17px] font-light leading-[1.55] text-white/65">
                        A monthly prize pool, paid in USDC on Chiliz Chain. Top spots get paid for being right. No tier, no subscription — just signal.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <PrimaryBtn onClick={onNotify}>
                            Notify me when it ships {LBI.arrowRight}
                        </PrimaryBtn>
                        <GhostBtn onClick={onRules}>
                            See the split {LBI.arrowDown}
                        </GhostBtn>
                    </div>

                    <div className="mt-7 inline-flex items-center gap-2.5">
                        <span aria-hidden className="block h-0.5 w-4" style={{ background: '#F5C518' }} />
                        <span
                            className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.16em]"
                            style={{ color: '#F5C518' }}
                        >
                            Launch window <span className="text-white">TBA</span> · Pool size{' '}
                            <span className="text-white">TBA</span>
                        </span>
                    </div>
                </div>

                {/* Right — TBA pool teaser card */}
                <div className="relative">
                    <div
                        className="relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111] p-7"
                        style={{ boxShadow: '0 0 60px rgba(245,197,24,0.04)' }}
                    >
                        <div className="flex items-center justify-between">
                            <Eyebrow color="#F5C518">Prize pool</Eyebrow>
                            <Pill
                                border="rgba(232,0,29,0.4)"
                                color="#E8001D"
                                icon={<PulseDot color="#E8001D" />}
                            >
                                In design
                            </Pill>
                        </div>

                        <div className="mt-7 flex items-end gap-3">
                            <div
                                className="font-display font-extrabold uppercase leading-[0.88] tabular-nums"
                                style={{
                                    color: '#F5C518',
                                    fontSize: 'clamp(72px, 7.4vw, 108px)',
                                    letterSpacing: '-0.03em',
                                }}
                            >
                                TBA
                            </div>
                        </div>
                        <div className="font-mono-ctv mt-3 text-[11px] uppercase tracking-[0.18em] text-white/45">
                            Funded on-chain · Top 10 paid · USDC
                        </div>

                        <div className="mt-6 h-px w-full bg-[#1E1E1E]" />

                        <div className="mt-4 grid grid-cols-3 gap-4">
                            <PoolFact label="Status" value="Soon" />
                            <PoolFact label="Cycle" value="Monthly" />
                            <PoolFact label="Min predictions" value="5" />
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
