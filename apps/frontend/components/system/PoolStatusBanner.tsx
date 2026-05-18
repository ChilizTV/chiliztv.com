'use client';

import { useEffect, useState } from 'react';
import { AlertOctagon, X } from 'lucide-react';
import { usePoolState } from '@/hooks/api/usePoolState';

const STORAGE_KEY = 'chiliztv:pool-paused-banner-dismissed-at';
const DISMISS_TTL_MS = 6 * 60 * 60 * 1000; // re-show after 6 hours

/**
 * Global banner that fires only when `pool.paused()` returns true on-chain.
 *
 * Mounted once at the layout level so every page (discover, my-bets, live)
 * gets it for free. Auto-dismissable for the user's tab session, but the
 * dismissal expires after `DISMISS_TTL_MS` so a long-paused pool doesn't
 * stay invisible forever.
 *
 * Wrong-chain awareness lives in `NetworkGuard`, which is mounted *inline*
 * inside each transaction dialog. The two are intentional siblings:
 * NetworkGuard is contextual (one CTA away from the tx), this banner is
 * ambient (one-line page-wide warning).
 */
export function PoolStatusBanner() {
    const { data: state, isLoading } = usePoolState();
    const paused = state?.paused;

    const [dismissed, setDismissed] = useState(true);

    // Read the dismissal flag on mount only — avoids SSR mismatch and the
    // banner flashing into view before the user has a chance to see the page.
    useEffect(() => {
        try {
            const stamp = window.localStorage.getItem(STORAGE_KEY);
            if (!stamp) {
                setDismissed(false);
                return;
            }
            const at = Number(stamp);
            if (!Number.isFinite(at) || Date.now() - at > DISMISS_TTL_MS) {
                window.localStorage.removeItem(STORAGE_KEY);
                setDismissed(false);
            } else {
                setDismissed(true);
            }
        } catch {
            // localStorage unavailable (SSR / privacy mode) — show by default.
            setDismissed(false);
        }
    }, []);

    if (isLoading || paused !== true || dismissed) return null;

    const dismiss = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
        } catch {
            // ignore — dismissed for this render cycle is enough
        }
        setDismissed(true);
    };

    return (
        <div
            role="status"
            aria-live="polite"
            className="sticky top-0 z-[60] flex w-full items-center gap-3 border-b px-4 py-2 text-[12px]"
            style={{
                background: 'rgba(232,0,29,0.12)',
                borderColor: 'rgba(232,0,29,0.4)',
                color: '#FFE0E5',
                fontFamily: "'Barlow', sans-serif",
                backdropFilter: 'blur(4px)',
            }}
        >
            <AlertOctagon size={14} style={{ color: '#E8001D', flexShrink: 0 }} />
            <span className="flex-1">
                <strong className="font-bold uppercase tracking-[0.08em] mr-2">Pool paused</strong>
                Deposits, predictions and withdrawals are temporarily disabled on-chain — your existing positions are safe. Refresh once ops un-pauses.
            </span>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="flex h-6 w-6 items-center justify-center rounded transition-colors"
                style={{ color: '#FFE0E5', opacity: 0.7 }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '0.7';
                }}
            >
                <X size={12} />
            </button>
        </div>
    );
}
