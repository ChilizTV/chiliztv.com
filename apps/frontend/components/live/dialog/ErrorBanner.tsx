interface ErrorBannerProps {
    readonly msg: string | null;
    readonly onRetry?: () => void;
    readonly onDismiss?: () => void;
}

/** Red banner above the body — surfaces a single error string at a time. */
export function ErrorBanner({ msg, onRetry, onDismiss }: ErrorBannerProps) {
    if (!msg) return null;
    return (
        <div
            className="mx-7 mb-1 mt-3 flex items-start gap-3 rounded-md border px-4 py-3"
            style={{ borderColor: 'rgba(232,0,29,0.45)', background: 'rgba(232,0,29,0.08)' }}
        >
            <span className="mt-px text-[#FF1737]" aria-hidden>⚠</span>
            <div className="flex-1 text-[12px] font-light leading-[1.5] text-white/80">{msg}</div>
            <div className="flex flex-shrink-0 items-center gap-2">
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="font-mono-ctv rounded-md border border-[#E8001D] bg-[#E8001D]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#E8001D]/20"
                    >
                        Retry
                    </button>
                )}
                {onDismiss && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="font-mono-ctv rounded-md border border-[#2A2A2A] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/65 hover:text-white"
                    >
                        Dismiss
                    </button>
                )}
            </div>
        </div>
    );
}
