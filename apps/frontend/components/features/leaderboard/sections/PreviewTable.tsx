import { Eyebrow } from '../primitives';
import { MOCK_BLURRED_ROWS, MOCK_TOP_10 } from '../domain';
import { PREVIEW_COLS, PreviewRow } from './PreviewRow';

const COLUMNS = ['#', 'Predictor', 'PnL', 'Win', 'Vol', 'Tier'] as const;

/** Pixel blur applied to rows 11+ to suggest a deeper list. */
const BLUR_PX = 4.5;

/**
 * Preview leaderboard — what the live ranking will look like once
 * Cycle 0 ships. Rows 1-10 render sharp; 11-13 render blurred. A
 * watermark overlay covers the lower half with a "Coming soon" CTA so
 * users don't mistake the mock data for live numbers.
 */
export function PreviewTable() {
    return (
        <section
            id="lb-preview"
            className="relative z-[4] mx-auto max-w-[1400px] px-8 py-20 sm:px-14 sm:py-24"
        >
            <div className="mb-9 flex flex-col gap-3">
                <Eyebrow>How it&apos;ll look</Eyebrow>
                <h2
                    className="font-display m-0 uppercase leading-[0.92] tracking-[-0.012em] text-white"
                    style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800 }}
                >
                    The board, when{' '}
                    <span className="text-[#E8001D]">it&apos;s real</span>.
                </h2>
                <p className="max-w-[640px] text-[15px] font-light leading-[1.55] text-white/55">
                    A composite score across PnL, win rate, and volume — settled at the end of every cycle. Below is what the live ranking will look like.
                </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111]">
                {/* Column headers */}
                <div
                    className="grid items-center gap-3 border-b border-[#1E1E1E] bg-[#0F0F0F] px-5 py-3.5"
                    style={{ gridTemplateColumns: PREVIEW_COLS }}
                >
                    {COLUMNS.map((h, i) => (
                        <div
                            key={h}
                            className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.18em] text-white/45"
                            style={{ textAlign: i === COLUMNS.length - 1 ? 'right' : 'left' }}
                        >
                            {h}
                        </div>
                    ))}
                </div>

                {/* Top 10 — sharp */}
                {MOCK_TOP_10.map((row) => (
                    <PreviewRow key={row.rank} row={row} />
                ))}

                {/* Trailing blurred rows */}
                <div className="relative">
                    {MOCK_BLURRED_ROWS.map((row) => (
                        <div
                            key={row.rank}
                            style={{ filter: `blur(${BLUR_PX}px)`, opacity: 0.45 }}
                        >
                            <PreviewRow row={row} />
                        </div>
                    ))}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
                        style={{
                            background:
                                'linear-gradient(180deg, rgba(17,17,17,0) 0%, #111 80%)',
                        }}
                    />
                </div>

                {/* Watermark — covers the lower portion to hammer "coming soon" home */}
                <WatermarkOverlay />
            </div>

            <div className="font-mono-ctv mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
                <span aria-hidden>ⓘ</span>
                Mocked data shown for illustration. Bet to qualify when live.
            </div>
        </section>
    );
}

function WatermarkOverlay() {
    return (
        <div
            className="pointer-events-none absolute inset-x-0 flex items-center justify-center"
            style={{
                top: '30%',
                bottom: 0,
                background:
                    'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.55) 40%, rgba(10,10,10,0.55) 100%)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
            }}
        >
            <div className="px-6 text-center">
                <div
                    className="font-mono-ctv inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: '#F5C518' }}
                >
                    <span aria-hidden>✦</span>
                    Coming soon
                    <span aria-hidden>✦</span>
                </div>
                <div
                    className="font-display mt-3 font-extrabold uppercase leading-[0.92] tracking-[-0.018em] text-white"
                    style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}
                >
                    Real ranks unlock when{' '}
                    <span className="text-[#E8001D]">Cycle 0</span> starts.
                </div>
                <div className="font-mono-ctv mt-3 text-[11px] uppercase tracking-[0.18em] text-white/55">
                    Settled in USDC · launch date TBA
                </div>
            </div>
        </div>
    );
}
