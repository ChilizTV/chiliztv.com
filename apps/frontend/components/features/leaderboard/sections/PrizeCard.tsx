import { MEDAL_PALETTE } from '../domain/medals';
import type { PoolSplitTier } from '../domain/data';
import { iconForMedal } from '../primitives/icons';

interface PrizeCardProps {
    tier: PoolSplitTier;
}

/** Single tier card in the prize-pool breakdown grid. */
export function PrizeCard({ tier }: PrizeCardProps) {
    const palette = MEDAL_PALETTE[tier.medal];
    return (
        <div
            className="relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-xl border p-7"
            style={{
                background: palette.bg !== 'transparent' ? palette.bg : '#111',
                borderColor: palette.border,
                boxShadow: palette.glow !== 'none' ? palette.glow : undefined,
            }}
        >
            <div>
                <div
                    className="font-mono-ctv inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: palette.fg }}
                >
                    <span aria-hidden className="block h-0.5 w-4" style={{ background: palette.fg }} />
                    {tier.tier}
                </div>

                <div
                    className="font-display mt-5 font-extrabold uppercase leading-[0.92] tabular-nums"
                    style={{
                        color: palette.fg,
                        fontSize: 'clamp(56px, 6vw, 72px)',
                        letterSpacing: '-0.025em',
                    }}
                >
                    {tier.pct}
                    <span style={{ fontSize: '0.55em', marginLeft: 2 }}>%</span>
                </div>

                <div className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {tier.per && tier.count
                        ? `Of pool · split across ${tier.count} winners`
                        : 'Of pool'}
                </div>

                <div className="mt-5 h-px w-full bg-[#1E1E1E]" />

                <div className="font-mono-ctv mt-4 text-[11px] uppercase tracking-[0.16em] text-white/55">
                    USDC payout · TBA
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span style={{ color: palette.fg }} className="inline-flex">
                        {iconForMedal(tier.medal)}
                    </span>
                    <span className="font-display text-[16px] font-bold uppercase tracking-tight text-white">
                        {tier.label}
                    </span>
                </div>
            </div>
        </div>
    );
}
