"use client";

interface BigTipBannerProps {
  /** Threshold (USDC) the tip must reach to surface the banner. */
  threshold?: number;
  amount: number;
}

/**
 * Red-accented banner shown when the tip amount crosses a threshold —
 * lets the user know the contribution is big enough to take over the
 * full stream overlay.
 */
export function BigTipBanner({ threshold = 50, amount }: BigTipBannerProps) {
  if (amount < threshold) return null;
  return (
    <div className="rounded-xl border border-[#E8001D]/40 bg-[#E8001D]/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8001D" strokeWidth="2">
          <path d="M12 2 15 9l7 1-5 5 1.5 7L12 18l-6.5 4L7 15 2 10l7-1z" />
        </svg>
        <span className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8001D]">
          Big tip — full-screen takeover on stream
        </span>
      </div>
    </div>
  );
}
