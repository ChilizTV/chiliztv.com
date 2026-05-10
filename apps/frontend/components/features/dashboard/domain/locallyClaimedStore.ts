/**
 * Locally-claimed bets store.
 *
 * The on-chain `Payout` / `Refund` events take a few seconds to a minute
 * to propagate from RPC → backend indexer → API. In that window the bet's
 * `claimedAt` / `refundedAt` are still null on the server, so a naive UI
 * would re-show the "Claim" button — and a second click reverts on-chain.
 *
 * This module owns a tiny pub/sub store keyed by `(contract, marketId,
 * betIndex)` that records bets the user just claimed/refunded. Consumers
 * overlay it on top of the server data so the row flips immediately and
 * stays flipped across refetches. Entries auto-expire after 24h to bound
 * `localStorage` growth and let server data become authoritative.
 */

const STORAGE_KEY = 'ctv:claimed-bets:v1';
const TTL_MS = 24 * 60 * 60 * 1000;

export type LocalClaimKind = 'claimed' | 'refunded';

export interface LocalClaimEntry {
    /** What the user did — distinguishes Payout from Refund overlays. */
    readonly kind: LocalClaimKind;
    /** Unix ms when the local stamp was recorded. */
    readonly at: number;
    /** Tx hash of the on-chain action — useful for deduping toasts. */
    readonly txHash?: string;
}

/** Build a stable key for a bet position on a specific contract. */
export function localClaimKey(input: {
    contractAddress: string;
    marketId: string | number | bigint;
    betIndex: string | number | bigint;
}): string {
    return `${input.contractAddress.toLowerCase()}:${String(input.marketId)}:${String(input.betIndex)}`;
}

type Listener = () => void;
const listeners = new Set<Listener>();

/**
 * Stable empty map — both `getServerSnapshot` and the initial `snapshot`
 * point at this. React's `useSyncExternalStore` requires the server
 * snapshot to be the same reference across calls, otherwise it warns
 * "The result of getServerSnapshot should be cached to avoid an infinite
 * loop". Mutations swap `snapshot` to a fresh map, but the empty
 * placeholder stays referentially identical.
 */
const EMPTY_SNAPSHOT: ReadonlyMap<string, LocalClaimEntry> = new Map();
let snapshot: ReadonlyMap<string, LocalClaimEntry> = EMPTY_SNAPSHOT;

/** Read the persisted map once on first store touch. SSR-safe. */
function readFromStorage(): Map<string, LocalClaimEntry> {
    if (typeof window === 'undefined') return new Map();
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Map();
        const parsed = JSON.parse(raw) as Record<string, LocalClaimEntry>;
        const now = Date.now();
        const fresh = new Map<string, LocalClaimEntry>();
        for (const [key, entry] of Object.entries(parsed)) {
            if (entry && typeof entry.at === 'number' && now - entry.at < TTL_MS) {
                fresh.set(key, entry);
            }
        }
        return fresh;
    } catch {
        return new Map();
    }
}

function writeToStorage(map: ReadonlyMap<string, LocalClaimEntry>): void {
    if (typeof window === 'undefined') return;
    try {
        const obj: Record<string, LocalClaimEntry> = {};
        for (const [k, v] of map) obj[k] = v;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {
        /* quota / private mode — best effort, the store still works in-memory */
    }
}

/**
 * Hydrate snapshot lazily on the first client-side read so SSR stays
 * clean. The persisted map only replaces `EMPTY_SNAPSHOT` if there are
 * actually entries — that way `getSnapshot()` and `getServerSnapshot()`
 * share the same `EMPTY_SNAPSHOT` reference on first paint, avoiding a
 * mismatch warning when the local store is empty.
 */
let hydrated = false;
function ensureHydrated(): void {
    if (hydrated) return;
    hydrated = true;
    if (typeof window === 'undefined') return;
    const fromStorage = readFromStorage();
    if (fromStorage.size > 0) {
        snapshot = fromStorage;
    }
}

function notify(): void {
    for (const l of listeners) l();
}

export const claimedBetsStore = {
    /** Subscribe — used by `useSyncExternalStore`. */
    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    /** Snapshot accessor — stable reference between mutations. */
    getSnapshot(): ReadonlyMap<string, LocalClaimEntry> {
        ensureHydrated();
        return snapshot;
    },
    /** SSR snapshot — must be the same stable reference across calls. */
    getServerSnapshot(): ReadonlyMap<string, LocalClaimEntry> {
        return EMPTY_SNAPSHOT;
    },
    /** Stamp a bet as locally claimed/refunded. Idempotent. */
    mark(key: string, kind: LocalClaimKind, txHash?: string): void {
        ensureHydrated();
        const next = new Map(snapshot);
        next.set(key, { kind, at: Date.now(), txHash });
        snapshot = next;
        writeToStorage(next);
        notify();
    },
    /** Bulk variant — single notification for many keys. */
    markMany(keys: ReadonlyArray<string>, kind: LocalClaimKind, txHash?: string): void {
        if (keys.length === 0) return;
        ensureHydrated();
        const next = new Map(snapshot);
        const at = Date.now();
        for (const k of keys) next.set(k, { kind, at, txHash });
        snapshot = next;
        writeToStorage(next);
        notify();
    },
    /** Drop expired entries. Called automatically on hydrate; exposed for tests. */
    purgeExpired(): void {
        ensureHydrated();
        const now = Date.now();
        let mutated = false;
        const next = new Map(snapshot);
        for (const [k, v] of next) {
            if (now - v.at >= TTL_MS) {
                next.delete(k);
                mutated = true;
            }
        }
        if (mutated) {
            snapshot = next;
            writeToStorage(next);
            notify();
        }
    },
} as const;
