"use client";

type StakeZoneProps =
    | {
          variant: "live";
          pool: string;
          marketLabel: string;
          onClick: () => void;
      }
    | {
          variant: "befirst";
          onClick: () => void;
      };

const COMMON_CLASSES =
    "ctv-stake-zone -mx-5 -mb-4 mt-4 flex items-center justify-between gap-3 rounded-b-xl bg-[#E8001D] px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]";

/**
 * Magnetic red full-bleed CTA pinned to the card's bottom edge — the focal
 * point of the {@link MatchCardDonut}. Two variants:
 *
 *  - `live`     — pool size as the big figure, market label + pulsing dot
 *                 as the caption. Stake button on the right.
 *  - `befirst`  — "Be first" headline + "Your stake sets the price" caption.
 *                 Used when no one has staked yet (pool is empty).
 *
 * Hover scales the whole surface (1.025) and lifts a wider red glow — the
 * physical "pull" that gives the design its name. Animation classes
 * (`ctv-stake-zone`, `ctv-stake-arrow`) live in `app/globals.css`.
 */
export function StakeZone(props: StakeZoneProps) {
    if (props.variant === "befirst") {
        return (
            <button type="button" onClick={props.onClick} className={COMMON_CLASSES}>
                <span className="flex flex-col">
                    <span className="font-display text-[24px] font-extrabold leading-none tracking-[-0.02em] text-white">
                        Be first
                    </span>
                    <span className="font-mono-ctv mt-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white/80">
                        Your stake sets the price
                    </span>
                </span>
                <span className="font-mono-ctv flex items-center gap-2 text-[14px] font-extrabold uppercase tracking-[0.18em] text-white">
                    Stake <span className="ctv-stake-arrow text-[17px]">→</span>
                </span>
            </button>
        );
    }

    return (
        <button type="button" onClick={props.onClick} className={COMMON_CLASSES}>
            <span className="flex flex-col">
                <span className="font-display text-[28px] font-extrabold leading-none tracking-[-0.02em] text-white">
                    {props.pool}
                </span>
                <span className="font-mono-ctv mt-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white/80">
                    <span aria-hidden className="ctv-pulse-dot block h-[5px] w-[5px] rounded-full bg-white" />
                    Pool · {props.marketLabel}
                </span>
            </span>
            <span className="font-mono-ctv flex items-center gap-2.5 text-[15px] font-extrabold uppercase tracking-[0.2em] text-white">
                Stake <span className="ctv-stake-arrow text-[18px]">→</span>
            </span>
        </button>
    );
}
