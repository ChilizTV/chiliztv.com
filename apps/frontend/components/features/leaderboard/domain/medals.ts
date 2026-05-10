/**
 * Medal palette for the leaderboard tiers.
 *
 * Each medal carries the tokens needed by every consumer:
 *  - `fg`     — text/icon color
 *  - `border` — card / row border (rgba so it tints the surface)
 *  - `bg`     — soft surface tint (rgba)
 *  - `glow`   — outer box-shadow used on the prize cards (`'none'` skips)
 *
 * Kept here (not in primitives) so domain tests / formatters can reach it
 * without pulling React.
 */
export type MedalKind = 'gold' | 'silver' | 'bronze' | 'honor';

export interface MedalPalette {
    readonly fg: string;
    readonly border: string;
    readonly bg: string;
    readonly glow: string;
}

export const MEDAL_PALETTE: Record<MedalKind, MedalPalette> = {
    gold: {
        fg: '#F5C518',
        border: 'rgba(245,197,24,0.45)',
        bg: 'rgba(245,197,24,0.06)',
        glow: '0 0 32px rgba(245,197,24,0.12)',
    },
    silver: {
        fg: '#D8D8DC',
        border: 'rgba(216,216,220,0.40)',
        bg: 'rgba(216,216,220,0.05)',
        glow: '0 0 22px rgba(216,216,220,0.06)',
    },
    bronze: {
        fg: '#C8794B',
        border: 'rgba(200,121,75,0.40)',
        bg: 'rgba(200,121,75,0.05)',
        glow: '0 0 22px rgba(200,121,75,0.06)',
    },
    honor: {
        fg: 'rgba(255,255,255,0.85)',
        border: '#1E1E1E',
        bg: 'transparent',
        glow: 'none',
    },
};
