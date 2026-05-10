"use client";

import type { Address } from "viem";
import { SubscriptionModal } from "./streamer-modals";

interface StreamSubscriptionButtonProps {
  streamerAddress?: `0x${string}`;
  isStreamer?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  streamerName?: string;
  streamerHandle?: string;
  streamerAvatarUrl?: string;
  /** Monthly USDC price for the subscription. */
  monthlyPriceUsd?: number;
}

/**
 * Thin facade over the new design-spec `SubscriptionModal`. Same prop
 * shape as the legacy component — streamers see no modal (their stats
 * live in the dashboard).
 */
export default function StreamSubscriptionButton({
  streamerAddress,
  isStreamer = false,
  open,
  onOpenChange,
  streamerName,
  streamerHandle,
  streamerAvatarUrl,
  monthlyPriceUsd,
}: StreamSubscriptionButtonProps) {
  if (!streamerAddress || isStreamer) return null;
  return (
    <SubscriptionModal
      open={open ?? false}
      onClose={() => onOpenChange?.(false)}
      streamerAddress={streamerAddress as Address}
      streamerName={streamerName ?? "this streamer"}
      streamerHandle={streamerHandle}
      streamerAvatarUrl={streamerAvatarUrl}
      monthlyPriceUsd={monthlyPriceUsd}
    />
  );
}
