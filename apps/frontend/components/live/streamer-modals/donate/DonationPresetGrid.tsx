"use client";

const PRESETS = [1, 5, 10, 25] as const;

interface DonationPresetGridProps {
  amount: number;
  onPick: (value: number) => void;
}

/** 4-up preset chips (`$1` … `$25`) — only meaningful for USDC-equivalent amounts. */
export function DonationPresetGrid({ amount, onPick }: DonationPresetGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {PRESETS.map((p) => {
        const active = amount === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            className="font-display rounded-lg border py-3 text-center text-[18px] font-bold transition-colors"
            style={{
              borderColor: active ? "#E8001D" : "#262626",
              background: active ? "rgba(232,0,29,0.10)" : "#161616",
              color: active ? "#fff" : "rgba(255,255,255,0.65)",
            }}
          >
            ${p}
          </button>
        );
      })}
    </div>
  );
}
