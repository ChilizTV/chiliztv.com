'use client';

import { useRouter } from 'next/navigation';
import { useLeaderboardTop } from '@/hooks/api';
import { Eyebrow, PrimaryBtn } from '../primitives';
import { LBI } from '../primitives/icons';

/** Closing CTA — drive new bettors to /browse. */
export function NotifyCTA() {
    const router = useRouter();
    const { data } = useLeaderboardTop(1);
    const topN = data?.topN ?? 10;

    return (
        <section
            id="lb-notify"
            className="relative z-[4] mx-auto max-w-[1400px] px-8 py-24 text-center sm:px-14 sm:py-28"
        >
            <div className="flex flex-col items-center gap-3">
                <Eyebrow>Get on the board</Eyebrow>
                <h2
                    className="font-display m-0 uppercase leading-[0.9] tracking-[-0.015em] text-white"
                    style={{ fontSize: 'clamp(48px, 6vw, 84px)', fontWeight: 800 }}
                >
                    Place your first
                    <br />
                    <span className="text-[#E8001D]">prediction.</span>
                </h2>
                <p className="mt-4 max-w-[560px] text-[16px] font-light leading-[1.55] text-white/65">
                    Every winning prediction adds to your score. Top {topN} cuts the pool every cycle.
                </p>
            </div>

            <div className="mx-auto mt-9 flex justify-center">
                <PrimaryBtn onClick={() => router.push('/browse')}>
                    Browse live matches {LBI.arrowRight}
                </PrimaryBtn>
            </div>

            <div className="font-mono-ctv mt-10 flex flex-wrap items-center justify-center gap-5 text-[10px] uppercase tracking-[0.18em] text-white/45">
                <span>Or follow →</span>
                <a
                    href="https://x.com/PredCastTV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white"
                >
                    𝕏 {LBI.arrowUpRight}
                </a>
                <a href="#" className="inline-flex items-center gap-1.5 hover:text-white">
                    Discord {LBI.arrowUpRight}
                </a>
            </div>
        </section>
    );
}
