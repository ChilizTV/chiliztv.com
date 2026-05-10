"use client";

import { type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface StreamerModalShellProps {
  open: boolean;
  onClose: () => void;
  /** SR-only title (a visible title is rendered by `StreamerModalHeader`). */
  ariaTitle: string;
  children: ReactNode;
}

/**
 * Outer modal chrome for the streamer donation / subscription modals.
 *
 * Wraps Radix Dialog so focus, escape, and overlay-click-to-close keep
 * working like any other dialog in the app, while overriding the layout
 * to match the design's centered-column shell with red accent halo.
 */
export function StreamerModalShell({
  open,
  onClose,
  ariaTitle,
  children,
}: StreamerModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="block gap-0 overflow-hidden border-[#262626] bg-[#0d0d0d] p-0 text-white sm:max-w-[480px]"
      >
        <DialogTitle className="sr-only">{ariaTitle}</DialogTitle>

        <div
          className="relative flex w-full flex-col overflow-hidden"
          style={{
            maxHeight: "90vh",
            boxShadow:
              "0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02)",
          }}
        >
          {/* Scrollable column — the modal can be tall enough to overflow,
              especially on small viewports. The TokenPickerSheet (rendered
              by the children) is `absolute inset-0` and resolves to the
              outer `relative` ancestor, so it still covers the whole shell
              regardless of scroll position. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
