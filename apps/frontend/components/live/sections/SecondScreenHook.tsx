"use client";

import { Eyebrow } from "../primitives";

/**
 * Reassurance copy under the no-stream panel: the room is still worth being in
 * even with no feed — read the pools, take a position, chat the build-up.
 */
export function SecondScreenHook() {
  return (
    <div className="px-0.5 pt-0.5">
      <Eyebrow>Second screen</Eyebrow>
      <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-white/65">
        No one&apos;s streaming yet — <b className="font-medium text-white">call the match here.</b>{" "}
        Read the live pools, take your position, and chat the build-up with the room. The player is
        one tap away the moment someone goes live.
      </p>
    </div>
  );
}
