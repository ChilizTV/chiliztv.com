"use client";

import type { Address } from "viem";
import { DonationModal } from "./streamer-modals";

interface StreamWalletButtonProps {
  /** The streamer's wallet address (recipient). Required to render the modal. */
  streamerAddress?: `0x${string}`;
  /** Whether the connected user IS the streamer — they can't tip themselves. */
  isStreamer?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional display name and handle for the in-modal streamer strip. */
  streamerName?: string;
  streamerHandle?: string;
  streamerAvatarUrl?: string;
}

/**
 * Thin facade over the new design-spec `DonationModal`. The component
 * keeps the `StreamWalletButton` name + props shape so existing consumers
 * (chiefly `LiveDetailsPage`) don't need to change.
 *
 * When `isStreamer` is true the modal is suppressed — streamers shouldn't
 * tip themselves; their revenue dashboard lives in the dashboard surface.
 */
export default function StreamWalletButton({
  streamerAddress,
  isStreamer = false,
  open,
  onOpenChange,
  streamerName,
  streamerHandle,
  streamerAvatarUrl,
}: StreamWalletButtonProps) {
  if (!streamerAddress || isStreamer) return null;
  return (
    <DonationModal
      open={open ?? false}
      onClose={() => onOpenChange?.(false)}
      streamerAddress={streamerAddress as Address}
      streamerName={streamerName ?? "this streamer"}
      streamerHandle={streamerHandle}
      streamerAvatarUrl={streamerAvatarUrl}
    />
  );
}
