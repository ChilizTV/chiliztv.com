import { Eyebrow } from '../primitives';
import { POOL_SPLIT } from '../domain';
import { PrizeCard } from './PrizeCard';

/**
 * Pool-split breakdown — four cards (Gold / Silver / Bronze / Top 10).
 * The split itself is locked; only the absolute pool size is TBA.
 */
export function PrizeBreakdown() {
    return (
        <section
            id="lb-split"
            className="relative z-[4] mx-auto max-w-[1400px] px-8 py-20 sm:px-14 sm:py-24"
        >
            <div className="mb-12 flex flex-col gap-3">
                <Eyebrow color="#F5C518">Pool split</Eyebrow>
                <h2
                    className="font-display m-0 uppercase leading-[0.92] tracking-[-0.012em] text-white"
                    style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800 }}
                >
                    How the pool <span style={{ color: '#F5C518' }}>splits</span>.
                </h2>
                <p className="max-w-[620px] text-[15px] font-light leading-[1.55] text-white/55">
                    Total pool size is still being finalized. The split itself is locked — here&apos;s how every cycle pays out, regardless of pool size.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {POOL_SPLIT.map((tier) => (
                    <PrizeCard key={tier.tier} tier={tier} />
                ))}
            </div>

            <div className="font-mono-ctv mt-7 flex items-start gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
                <span aria-hidden>ⓘ</span>
                <span className="max-w-[640px] leading-[1.55]">
                    Distributed automatically at cycle close via on-chain contract. No claim required — payout lands directly in your wallet.
                </span>
            </div>
        </section>
    );
}
