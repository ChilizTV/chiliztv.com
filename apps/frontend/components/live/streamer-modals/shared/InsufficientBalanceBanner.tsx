"use client";

interface InsufficientBalanceBannerProps {
  symbol: string;
  shortfall: string;
}

/** Yellow inline warning for "balance too low — need X more $SYM". */
export function InsufficientBalanceBanner({
  symbol,
  shortfall,
}: InsufficientBalanceBannerProps) {
  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#F5C518]/40 bg-[#F5C518]/10 px-3 py-2">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#F5C518]/20 text-[10px] font-bold text-[#F5C518]">
        !
      </span>
      <span className="text-[12px] text-[#F5C518]">
        Balance too low · need {shortfall} more ${symbol}
      </span>
    </div>
  );
}
