import type { ReactNode } from 'react';

const STROKE = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

/**
 * Inline SVG icon set — no `lucide` dep on the leaderboard surface so
 * the page stays portable. All icons use `currentColor` so they pick up
 * whatever `color` the parent sets.
 */
export const LBI: Record<string, ReactNode> = {
    arrowRight: (
        <svg width="14" height="14" viewBox="0 0 24 24" {...STROKE} strokeWidth="2.2" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    ),
    arrowDown: (
        <svg width="14" height="14" viewBox="0 0 24 24" {...STROKE} strokeWidth="2.2" aria-hidden>
            <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
    ),
    arrowUpRight: (
        <svg width="11" height="11" viewBox="0 0 24 24" {...STROKE} strokeWidth="2.2" aria-hidden>
            <path d="M7 17 17 7M8 7h9v9" />
        </svg>
    ),
    trophy: (
        <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE} strokeWidth="2" aria-hidden>
            <path d="M6 9V4h12v5a6 6 0 0 1-12 0Z" />
            <path d="M4 4h2v3a3 3 0 0 1-3 3V8a4 4 0 0 1 1-4Z" />
            <path d="M20 4h-2v3a3 3 0 0 0 3 3V8a4 4 0 0 0-1-4Z" />
            <path d="M9 14h6l1 6H8l1-6Z" />
            <path d="M7 22h10" />
        </svg>
    ),
    medal: (
        <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE} strokeWidth="2" aria-hidden>
            <path d="M7 3h10l-3 7H10L7 3Z" />
            <circle cx="12" cy="15" r="6" />
            <path d="M12 12v6M9.5 14.5l5 3M14.5 14.5l-5 3" />
        </svg>
    ),
    award: (
        <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE} strokeWidth="2" aria-hidden>
            <circle cx="12" cy="9" r="6" />
            <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
        </svg>
    ),
    star: (
        <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE} strokeWidth="2" aria-hidden>
            <path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.3l-5.5 2.9 1.1-6.2L3 9.6l6.3-.9L12 3Z" />
        </svg>
    ),
    spark: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2 14 10 22 12 14 14 12 22 10 14 2 12 10 10Z" />
        </svg>
    ),
};

/** Convenience: pick the medal icon for a given tier. */
export function iconForMedal(medal: 'gold' | 'silver' | 'bronze' | 'honor'): ReactNode {
    if (medal === 'gold') return LBI.trophy;
    if (medal === 'silver') return LBI.medal;
    if (medal === 'bronze') return LBI.award;
    return LBI.star;
}
