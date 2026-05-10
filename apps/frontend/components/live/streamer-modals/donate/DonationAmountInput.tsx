"use client";

interface DonationAmountInputProps {
  /** The amount as a string so users can clear the field cleanly. */
  amount: string;
  onChange: (next: string) => void;
  /** Currency prefix shown left of the input (e.g. "$" for USDC, "$PSG" otherwise). */
  prefix: string;
  /** Sub-line below the input (e.g. `≈ 12.43 USDC`). */
  subLabel?: string;
  /** Optional Max-button — fills the field with the full balance amount. */
  onMax?: () => void;
  maxLabel?: string;
}

/**
 * Big bold number input — the centerpiece of the donation modal. The
 * actual currency interpretation (token amount vs USD-equivalent) is
 * decided by the caller; this component is purely presentational.
 */
export function DonationAmountInput({
  amount,
  onChange,
  prefix,
  subLabel,
  onMax,
  maxLabel,
}: DonationAmountInputProps) {
  return (
    <div className="rounded-xl border border-[#262626] bg-[#161616] px-5 py-5">
      <div className="flex items-baseline gap-2">
        <span
          className="font-display text-[28px] font-extrabold text-white/55"
          style={{ lineHeight: 1 }}
        >
          {prefix}
        </span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="font-display w-full bg-transparent leading-none tracking-[-0.02em] text-white outline-none placeholder:text-white/20"
          style={{ fontSize: 56, fontWeight: 800 }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/45">
          {subLabel ?? <span className="text-white/0">·</span>}
        </span>
        {onMax && (
          <button
            type="button"
            onClick={onMax}
            className="font-mono-ctv rounded-md border border-[#262626] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/55 transition-colors hover:border-[#E8001D] hover:text-white"
          >
            {maxLabel ?? "Max"}
          </button>
        )}
      </div>
    </div>
  );
}
