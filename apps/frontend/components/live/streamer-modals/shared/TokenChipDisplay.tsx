"use client";

import Image from "next/image";
import type { StreamerTokenView } from "./tokens";

interface TokenChipDisplayProps {
  token: StreamerTokenView;
  onClick: () => void;
}

/** Small chip-shaped trigger that opens the token picker sheet. */
export function TokenChipDisplay({ token, onClick }: TokenChipDisplayProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-md border border-[#262626] bg-[#161616] px-3 py-2 transition-colors hover:border-[#E8001D]"
    >
      {token.logo ? (
        <Image
          src={token.logo}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 rounded-full object-cover"
        />
      ) : (
        <span
          className="font-mono-ctv grid h-5 w-5 place-items-center rounded-full bg-[#262626] text-[8px] font-bold text-white/65"
        >
          {token.symbol.slice(0, 2)}
        </span>
      )}
      <span className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.14em] text-white">
        ${token.symbol}
      </span>
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-white/45 transition-colors group-hover:text-white"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
