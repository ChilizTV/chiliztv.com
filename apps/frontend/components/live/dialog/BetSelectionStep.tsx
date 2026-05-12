'use client';

import type { MarketKey, MarketOutcome } from '@/lib/contracts/markets';
import { MarketState, stateLabel } from '@/lib/contracts/markets';

interface BetSelectionStepProps {
    readonly marketKey: MarketKey;
    readonly marketLabel: string;
    readonly stepTitle: string;
    readonly helper: string;
    readonly outcomes: ReadonlyArray<MarketOutcome>;
    readonly selectedSelection: number | null;
    readonly onSelect: (selection: number) => void;
    readonly state: MarketState | number;
    readonly line: number;
    readonly homeTeam?: string;
    readonly awayTeam?: string;
    /** Catalog-tagged "favorite" outcome (lowest odds, optional). */
    readonly favoriteSelection?: number;
    /** Per-outcome odds from the DB JSONB (selection → decimal). Empty map = no bet. */
    readonly oddsBySelection: ReadonlyMap<number, number>;
}

const STATE_HINT: Partial<Record<MarketState, string>> = {
    [MarketState.Suspended]: 'Market paused — odds being repriced. Try again in a minute.',
    [MarketState.Closed]: 'Market closed — awaiting resolution.',
    [MarketState.Resolved]: 'This market has settled. View results in My Predictions.',
    [MarketState.Cancelled]: 'This market was cancelled. Refunds available in My Predictions.',
};

/** Dispatcher — picks the right pick variant based on market type. */
export function BetSelectionStep(props: BetSelectionStepProps) {
    const { marketKey, state, oddsBySelection } = props;
    const isOpen = state === MarketState.Open;
    const stateMessage = !isOpen ? STATE_HINT[state as MarketState] : null;
    const hasAnyOdds = oddsBySelection.size > 0;

    return (
        <div>
            <PickHeader stepTitle={props.stepTitle} helper={props.helper} />

            {stateMessage && (
                <div
                    className="mb-4 px-3 py-2 rounded text-[11px]"
                    style={{
                        background: 'rgba(245,197,24,0.08)',
                        border: '1px solid rgba(245,197,24,0.3)',
                        color: '#F5C518',
                        fontFamily: "'Barlow', sans-serif",
                    }}
                >
                    {stateMessage} <span style={{ color: '#888' }}>· {stateLabel(state)}</span>
                </div>
            )}

            {!hasAnyOdds && isOpen && (
                <div
                    className="mb-4 px-3 py-2 rounded text-[11px]"
                    style={{
                        background: 'rgba(245,197,24,0.08)',
                        border: '1px solid rgba(245,197,24,0.3)',
                        color: '#F5C518',
                        fontFamily: "'Barlow', sans-serif",
                    }}
                >
                    Odds not posted yet — betting on this market is disabled until the admin publishes them.
                </div>
            )}

            {(marketKey === 'winner' || marketKey === 'halftime' || marketKey === 'firstscorer') && (
                <WinnerPick {...props} disabled={!isOpen} />
            )}
            {marketKey === 'goalstotal' && (
                <BinaryPick {...props} kind="totals" disabled={!isOpen} />
            )}
            {marketKey === 'bothscore' && (
                <BinaryPick {...props} kind="btts" disabled={!isOpen} />
            )}
        </div>
    );
}

function PickHeader({ stepTitle, helper }: { stepTitle: string; helper: string }) {
    return (
        <div className="mb-5">
            <div
                className="font-display uppercase leading-[0.95] tracking-[-0.005em] text-white"
                style={{ fontSize: 18, fontWeight: 800 }}
            >
                {stepTitle}
            </div>
            <div className="mt-2 text-[12px] font-light leading-[1.55] text-white/55">
                {helper}
            </div>
        </div>
    );
}

function FavBadge() {
    return (
        <span
            className="font-mono-ctv ml-2 inline-flex items-center rounded-sm px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-[0.14em]"
            style={{ color: '#F5C518', background: 'rgba(245,197,24,0.10)', border: '1px solid rgba(245,197,24,0.4)' }}
        >
            Favorite
        </span>
    );
}

function OddsTag({ odds }: { odds: number | null }) {
    return (
        <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">Odds</span>
            <span
                className="font-display tabular-nums text-white"
                style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}
            >
                {odds !== null && odds > 0 ? odds.toFixed(2) : '—'}
            </span>
        </div>
    );
}

function CrestPlaceholder({ marker }: { marker: string }) {
    return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#0d0d0d]">
            <span
                className="font-display font-extrabold uppercase tracking-[0.04em] text-white/55"
                style={{ fontSize: 13 }}
            >
                {marker}
            </span>
        </div>
    );
}

function TeamCrest({ label, color }: { label: string; color: string }) {
    const short = label.slice(0, 3).toUpperCase();
    return (
        <div
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: color, border: '1px solid rgba(255,255,255,0.1)' }}
        >
            <span
                className="font-display font-extrabold uppercase tracking-[0.04em] text-white"
                style={{ fontSize: 13 }}
            >
                {short}
            </span>
        </div>
    );
}

interface VariantProps extends BetSelectionStepProps {
    readonly disabled: boolean;
}

/** WINNER / HALFTIME / FIRST_SCORER — fat outcome rows. */
function WinnerPick({ outcomes, selectedSelection, onSelect, disabled, favoriteSelection, homeTeam, awayTeam, oddsBySelection }: VariantProps) {
    return (
        <div className="flex flex-col gap-2.5">
            {outcomes.map((o, idx) => {
                const selected = selectedSelection === o.selection;
                const isFav = favoriteSelection === o.selection;
                const isHome = idx === 0;
                const isAway = idx === outcomes.length - 1 && outcomes.length === 3;
                const isDraw = idx === 1 && outcomes.length === 3;
                const teamLabel = isHome ? homeTeam : isAway ? awayTeam : undefined;
                const crestMarker = isDraw ? 'X' : '—';
                const odds = oddsBySelection.get(o.selection) ?? null;
                const cellDisabled = disabled || odds === null;

                return (
                    <button
                        key={o.selection}
                        type="button"
                        onClick={() => onSelect(o.selection)}
                        disabled={cellDisabled}
                        className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${selected ? 'border-[#E8001D]' : 'border-[#1E1E1E] hover:border-[#2A2A2A]'}`}
                        style={{
                            background: selected ? 'linear-gradient(180deg, rgba(232,0,29,0.10), rgba(232,0,29,0.02))' : '#111',
                            boxShadow: selected ? '0 8px 30px rgba(232,0,29,0.18), inset 0 0 0 1px rgba(232,0,29,0.18)' : 'none',
                        }}
                    >
                        {teamLabel ? (
                            <TeamCrest label={teamLabel} color={isHome ? '#E8001D' : '#A50044'} />
                        ) : (
                            <CrestPlaceholder marker={crestMarker} />
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                                <span
                                    className="font-display uppercase tracking-[-0.005em] text-white"
                                    style={{ fontSize: 16, fontWeight: 800 }}
                                >
                                    {o.label}
                                </span>
                                {isFav && <FavBadge />}
                            </div>
                            {o.hint && (
                                <div className="font-mono-ctv mt-1 text-[10px] uppercase tracking-[0.16em] text-white/45">
                                    {o.hint}
                                </div>
                            )}
                        </div>
                        <OddsTag odds={odds} />
                        <span
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors ${selected ? 'bg-[#E8001D]' : 'border border-[#2A2A2A]'}`}
                        >
                            {selected && (
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="text-white" aria-hidden>
                                    <path d="M5 12l5 5L20 7" />
                                </svg>
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

/** GOALS_TOTAL (kind=totals, ↑/↓ arrows) and BOTH_SCORE (kind=btts, big YES/NO). */
function BinaryPick({ outcomes, selectedSelection, onSelect, disabled, line, kind, favoriteSelection, oddsBySelection }: VariantProps & { kind: 'totals' | 'btts' }) {
    return (
        <div>
            {kind === 'totals' && line > 0 && (
                <div className="font-mono-ctv mb-4 inline-flex items-center gap-2 rounded-md border border-[#1E1E1E] bg-[#111] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
                    Line · {(line / 10).toFixed(1)} goals
                </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
                {outcomes.map((o) => {
                    const selected = selectedSelection === o.selection;
                    // For totals: selection 1 = Over (up arrow + green), 0 = Under (down + red).
                    // For btts:   selection 1 = Yes (green), 0 = No (red).
                    const positive = o.selection === 1;
                    const arrow = kind === 'totals' ? (positive ? '↑' : '↓') : null;
                    const dirColor = positive ? '#2dd4a4' : '#FF1737';
                    const isFav = favoriteSelection === o.selection;
                    const odds = oddsBySelection.get(o.selection) ?? null;
                    const cellDisabled = disabled || odds === null;

                    return (
                        <button
                            key={o.selection}
                            type="button"
                            onClick={() => onSelect(o.selection)}
                            disabled={cellDisabled}
                            className={`group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border p-7 text-center transition-all hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${selected ? 'border-[#E8001D]' : 'border-[#1E1E1E] hover:border-[#2A2A2A]'}`}
                            style={{
                                background: selected ? 'linear-gradient(180deg, rgba(232,0,29,0.10), rgba(232,0,29,0.02))' : '#111',
                                boxShadow: selected ? '0 8px 30px rgba(232,0,29,0.18), inset 0 0 0 1px rgba(232,0,29,0.18)' : 'none',
                                minHeight: 160,
                            }}
                        >
                            {arrow && (
                                <span
                                    aria-hidden
                                    className="font-display leading-none"
                                    style={{ fontSize: 44, color: dirColor, fontWeight: 800 }}
                                >
                                    {arrow}
                                </span>
                            )}
                            <div
                                className="font-display leading-none uppercase tracking-[-0.01em] text-white"
                                style={{ fontSize: kind === 'btts' ? 36 : 22, fontWeight: 800 }}
                            >
                                {o.label}
                            </div>
                            {o.hint && (
                                <div className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
                                    {o.hint}
                                </div>
                            )}
                            <div className="mt-1 flex items-center gap-2">
                                <span className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                                    Odds
                                </span>
                                <span
                                    className="font-display tabular-nums text-white"
                                    style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }}
                                >
                                    {odds !== null ? odds.toFixed(2) : '—'}
                                </span>
                                {isFav && <FavBadge />}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
