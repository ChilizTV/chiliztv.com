"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Eyebrow } from "../primitives";

interface MountableSheetProps {
  /** Keep children mounted even while not visible (preserves long-lived state). */
  mounted: boolean;
  /** Visual presence — backdrop, animation, focus trap. */
  visible: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  /** Pixel max-width for the modal. */
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Live-page modal shell — like `SheetShell` but separates `mounted` (DOM
 * presence) from `visible` (user-facing presence). Used when the body must
 * keep running long-lived state — e.g. an active WebRTC pipeline — even
 * after the user closes the sheet. Rendered through a portal so it always
 * floats above the page.
 */
export function MountableSheet({
  mounted,
  visible,
  onClose,
  title,
  eyebrow,
  width = 720,
  children,
  footer,
}: MountableSheetProps) {
  // Lock body scroll while visible.
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  // Esc-to-close while visible.
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!visible}
      className="fixed inset-0 z-50"
      style={{ display: visible ? "flex" : "none" }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-[3px]"
      />
      <div className="relative z-10 m-auto flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#0d0d0d] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
        style={{ maxWidth: width }}
      >
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <footer className="border-t border-[#1E1E1E] bg-[#111] px-6 py-4">{footer}</footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
