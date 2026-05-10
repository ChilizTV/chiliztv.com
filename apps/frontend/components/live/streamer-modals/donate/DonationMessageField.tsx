"use client";

import { Eyebrow } from "../shared/Eyebrow";

interface DonationMessageFieldProps {
  message: string;
  onChange: (next: string) => void;
  maxLength?: number;
}

/** Optional "say something nice" message overlay, shown on the live stream. */
export function DonationMessageField({
  message,
  onChange,
  maxLength = 140,
}: DonationMessageFieldProps) {
  return (
    <div>
      <Eyebrow dim>Message · on-stream overlay</Eyebrow>
      <div className="mt-2 rounded-xl border border-[#262626] bg-[#161616] px-4 py-3">
        <textarea
          value={message}
          maxLength={maxLength}
          rows={2}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Say something nice…"
          className="w-full resize-none bg-transparent text-[14px] leading-[1.5] text-white outline-none placeholder:text-white/30"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/35">
            Optional · public
          </span>
          <span className="font-mono-ctv text-[9px] tabular-nums text-white/45">
            {message.length}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}
