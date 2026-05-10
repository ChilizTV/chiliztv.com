"use client";

import { Eyebrow, TokenChipDisplay, type StreamerTokenView } from "../shared";
import { ExpiryDate } from "./ExpiryDate";

interface SubscriptionSummaryProps {
  totalUsd: number;
  tokenAmountSubLabel: string;
  months: number;
  selectedToken: StreamerTokenView;
  onOpenPicker: () => void;
}

const fmtUsd = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Big total · token chip · expiry summary card. Driven by props rather
 * than internal state so the parent modal can keep the source of truth.
 */
export function SubscriptionSummary({
  totalUsd,
  tokenAmountSubLabel,
  months,
  selectedToken,
  onOpenPicker,
}: SubscriptionSummaryProps) {
  return (
    <div className="rounded-xl border border-[#262626] bg-[#161616] px-5 py-4">
      <div className="flex items-center justify-between">
        <Eyebrow dim>Pay with</Eyebrow>
        <TokenChipDisplay token={selectedToken} onClick={onOpenPicker} />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div
            className="font-display leading-none tracking-[-0.02em] text-white"
            style={{ fontSize: 40, fontWeight: 800 }}
          >
            {fmtUsd(totalUsd)}
          </div>
          <div className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
            {tokenAmountSubLabel}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/35">
            Active until
          </div>
          <div className="font-display mt-1 text-[14px] font-bold text-white">
            <ExpiryDate months={months} />
          </div>
        </div>
      </div>
    </div>
  );
}
