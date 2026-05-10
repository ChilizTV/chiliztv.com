import type { ReactNode } from 'react';
import { MEDAL_PALETTE, type MedalKind } from '../domain/medals';
import { LBI } from './icons';

interface RankMedalProps {
    medal?: MedalKind;
    rank: number;
}

function iconFor(medal: MedalKind): ReactNode {
    if (medal === 'gold') return LBI.trophy;
    if (medal === 'silver') return LBI.medal;
    if (medal === 'bronze') return LBI.award;
    return LBI.star;
}

/**
 * Rank cell content. Top-3 get the medal icon (trophy / medal / award)
 * tinted with the tier color; ranks 4+ get a zero-padded mono number.
 */
export function RankMedal({ medal, rank }: RankMedalProps) {
    if (!medal) {
        return (
            <span className="font-mono-ctv inline-block w-[36px] text-center text-[12px] font-bold tabular-nums text-white/45">
                {String(rank).padStart(2, '0')}
            </span>
        );
    }
    const palette = MEDAL_PALETTE[medal];
    return (
        <span className="inline-flex w-[36px] items-center gap-2.5">
            <span style={{ color: palette.fg }} className="inline-flex">
                {iconFor(medal)}
            </span>
        </span>
    );
}

interface AddressLabelProps {
    who: string;
    medal?: MedalKind;
}

/** Display name — `.eth` keeps the display font; raw addresses go mono. */
export function AddressLabel({ who, medal }: AddressLabelProps) {
    const color = medal ? MEDAL_PALETTE[medal].fg : '#fff';
    const isEth = who.endsWith('.eth');
    return (
        <span
            className="font-display text-[18px] font-extrabold uppercase tracking-[-0.005em]"
            style={{ color }}
        >
            {isEth ? (
                who
            ) : (
                <span className="font-mono-ctv text-[14px] font-semibold tracking-[0.04em]">
                    {who}
                </span>
            )}
        </span>
    );
}
