"use client";

import { Eyebrow } from "../shared/Eyebrow";

type PerkIconKind = "shield" | "video" | "bell" | "star";

interface Perk {
  icon: PerkIconKind;
  text: string;
}

const PERKS: Perk[] = [
  { icon: "shield", text: "Sub-only chat & emotes" },
  { icon: "video", text: "Replays of past streams" },
  { icon: "bell", text: "Live notifications, ad-free" },
  { icon: "star", text: "Priority on tip overlays" },
];

function PerkIcon({ kind }: { kind: PerkIconKind }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (kind === "shield")
    return (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  if (kind === "video")
    return (
      <svg {...common}>
        <rect x="2" y="6" width="14" height="12" rx="2" />
        <path d="m22 8-6 4 6 4z" />
      </svg>
    );
  if (kind === "bell")
    return (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="m12 2 3 7 7 1-5 5 1.5 7L12 18l-6.5 4L7 15 2 10l7-1z" />
    </svg>
  );
}

/** Static perks grid surfaced inside the subscription modal. */
export function SubscriptionPerks() {
  return (
    <div>
      <Eyebrow dim>You get</Eyebrow>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2.5">
        {PERKS.map((p, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#E8001D]/15 text-[#E8001D]">
              <PerkIcon kind={p.icon} />
            </span>
            <span className="text-[12px] leading-[1.4] text-white/80">{p.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
