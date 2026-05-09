/** Mirrors `enum MarketState` in BettingMatch.sol. Order is load-bearing. */
export enum MarketState {
    Inactive = 0,
    Open = 1,
    Suspended = 2,
    Closed = 3,
    Resolved = 4,
    Cancelled = 5,
}

const STATE_LABELS: Readonly<Record<MarketState, string>> = {
    [MarketState.Inactive]: 'Inactive',
    [MarketState.Open]: 'Open',
    [MarketState.Suspended]: 'Suspended',
    [MarketState.Closed]: 'Closed',
    [MarketState.Resolved]: 'Resolved',
    [MarketState.Cancelled]: 'Cancelled',
};

const STATE_ACCENTS: Readonly<Record<MarketState, string>> = {
    [MarketState.Inactive]: '#555',
    [MarketState.Open]: '#2dd4a4',
    [MarketState.Suspended]: '#F5C518',
    [MarketState.Closed]: '#E8001D',
    [MarketState.Resolved]: '#888',
    [MarketState.Cancelled]: '#888',
};

export function isOpen(state: MarketState | number): boolean {
    return state === MarketState.Open;
}

export function isResolvable(state: MarketState | number): boolean {
    return state === MarketState.Resolved;
}

export function isRefundable(state: MarketState | number): boolean {
    return state === MarketState.Cancelled;
}

export function stateLabel(state: MarketState | number): string {
    return STATE_LABELS[state as MarketState] ?? 'Unknown';
}

export function stateAccent(state: MarketState | number): string {
    return STATE_ACCENTS[state as MarketState] ?? '#888';
}
