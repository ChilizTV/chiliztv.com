'use client';

import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';

interface UnsupportedSportPanelProps {
    /** Optional close callback when the panel is shown inside a dialog. */
    readonly onClose?: () => void;
}

/**
 * Placeholder shown when a non-football match is loaded into the betting UI
 * (currently: basketball). Mirrors the football betting flow's visual language
 * so users understand the feature is on the roadmap, not broken.
 */
export function UnsupportedSportPanel({ onClose }: UnsupportedSportPanelProps) {
    const router = useRouter();

    const handleDiscover = () => {
        router.push('/browse');
        onClose?.();
    };

    return (
        <div className="flex flex-col items-center gap-5 px-8 py-12 text-center">
            <div className="font-mono-ctv inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[#E8001D]">
                <span aria-hidden className="block h-[2px] w-7 bg-[#E8001D]" />
                Basketball · Roadmap
            </div>
            <div
                className="relative flex items-center justify-center rounded-full"
                style={{
                    width: 76,
                    height: 76,
                    background: 'rgba(232,0,29,0.06)',
                    border: '1px solid rgba(232,0,29,0.25)',
                }}
            >
                <Trophy size={32} className="text-[#E8001D]" />
            </div>
            <div
                className="font-display text-white"
                style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                }}
            >
                Coming soon
            </div>
            <div className="max-w-md text-[14px] font-light leading-[1.55] text-white/55">
                Football markets only for now. Basketball matches will go live once the betting UI ships.
            </div>
            <button
                type="button"
                onClick={handleDiscover}
                className="font-mono-ctv mt-1 inline-flex items-center gap-2 rounded-md bg-[#E8001D] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                style={{ boxShadow: '0 8px 24px rgba(232,0,29,0.25)' }}
            >
                Discover football matches <span aria-hidden>→</span>
            </button>
        </div>
    );
}
