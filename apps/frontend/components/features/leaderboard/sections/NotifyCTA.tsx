import { Eyebrow } from '../primitives';
import { LBI } from '../primitives/icons';
import { NotifyForm } from './NotifyForm';

/** Closing CTA — email signup + social links. */
export function NotifyCTA() {
    return (
        <section
            id="lb-notify"
            className="relative z-[4] mx-auto max-w-[1400px] px-8 py-24 text-center sm:px-14 sm:py-28"
        >
            <div className="flex flex-col items-center gap-3">
                <Eyebrow>Stay in the loop</Eyebrow>
                <h2
                    className="font-display m-0 uppercase leading-[0.9] tracking-[-0.015em] text-white"
                    style={{ fontSize: 'clamp(48px, 6vw, 84px)', fontWeight: 800 }}
                >
                    Get pinged
                    <br />
                    at <span className="text-[#E8001D]">kickoff</span>.
                </h2>
                <p className="mt-4 max-w-[560px] text-[16px] font-light leading-[1.55] text-white/65">
                    Drop your email — we&apos;ll ping you the moment Cycle 0 opens, and again every cycle close with the results. No spam, just signal.
                </p>
            </div>

            <div className="mx-auto mt-9 max-w-[560px]">
                <NotifyForm />
            </div>

            <div className="font-mono-ctv mt-10 flex flex-wrap items-center justify-center gap-5 text-[10px] uppercase tracking-[0.18em] text-white/45">
                <span>Or follow →</span>
                <a href="#" className="inline-flex items-center gap-1.5 hover:text-white">
                    𝕏 Twitter {LBI.arrowUpRight}
                </a>
                <a href="#" className="inline-flex items-center gap-1.5 hover:text-white">
                    Telegram {LBI.arrowUpRight}
                </a>
                <a href="#" className="inline-flex items-center gap-1.5 hover:text-white">
                    Discord {LBI.arrowUpRight}
                </a>
            </div>
        </section>
    );
}
