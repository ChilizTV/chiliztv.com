import { LBI } from '../primitives/icons';

interface TickerProps {
    items: ReadonlyArray<string>;
}

/**
 * Looping marquee strip up top — purely decorative (`aria-hidden`).
 * Reuses the global `.ctv-marquee` keyframes already declared in
 * `app/globals.css`. The list is doubled so the `translateX(-50%)` loop
 * is seamless.
 */
export function Ticker({ items }: TickerProps) {
    const doubled = [...items, ...items];
    return (
        <div
            aria-hidden
            role="presentation"
            className="relative z-[5] overflow-hidden border-y border-[#1E1E1E] bg-[#0A0A0A]"
        >
            <div
                className="ctv-marquee font-mono-ctv flex items-center gap-12 whitespace-nowrap py-3 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ width: 'max-content' }}
            >
                {doubled.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-3">
                        <span
                            className="inline-flex"
                            style={{ color: i % 3 === 0 ? '#F5C518' : '#E8001D' }}
                        >
                            {LBI.spark}
                        </span>
                        <span className="text-white/70">{item}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
