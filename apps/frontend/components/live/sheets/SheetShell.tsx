"use client";

import { useEffect, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Eyebrow } from "../primitives";

interface SheetShellProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  /** Pixel max-width for the modal. */
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Live-page modal shell — design-spec sheet with red accent ribbon,
 * eyebrow + display title, scrollable body, optional sticky footer.
 *
 * Wraps Radix Dialog under the hood so focus management, Escape, and
 * overlay-click-to-close behave like every other modal in the app.
 */
export function SheetShell({
  open,
  onClose,
  title,
  eyebrow,
  width = 720,
  children,
  footer,
}: SheetShellProps) {
  // Esc key fallback — Radix already handles this, but keep a safety net
  // in case the parent suppresses it.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="block gap-0 overflow-hidden border-[#1E1E1E] bg-[#0d0d0d] p-0 text-white sm:max-w-[var(--sheet-width)]"
        style={{ ["--sheet-width" as string]: `${width}px` }}
      >
        <DialogTitle className="sr-only">
          {typeof title === "string" ? title : "Live action"}
        </DialogTitle>

        <div className="flex max-h-[88vh] w-full flex-col overflow-hidden">
          {/* accent ribbon */}
          <span
            aria-hidden
            className="absolute left-0 top-0 z-10 h-[3px] w-full"
            style={{ background: "linear-gradient(90deg, #E8001D 0%, transparent 60%)" }}
          />

          <header className="flex items-start justify-between gap-4 border-b border-[#1E1E1E] bg-[#111] px-6 py-5">
            <div>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              <div className="font-display mt-2 text-[24px] font-extrabold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-[28px]">
                {title}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="font-mono-ctv inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#1E1E1E] bg-[#0d0d0d] text-white/55 transition-colors hover:border-[#3A3A3A] hover:text-white"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">{children}</div>

          {footer && (
            <footer className="border-t border-[#1E1E1E] bg-[#111] px-6 py-4">{footer}</footer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
