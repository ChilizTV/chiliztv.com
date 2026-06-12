'use client';

import { useRef, useState } from 'react';

/** Copies `value` to the clipboard with a brief ✓ feedback. */
export function CopyButton({ value, label }: Readonly<{ value: string; label: string }>) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async (e: React.MouseEvent) => {
    // Rows are often wrapped in links — copying must not navigate.
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied (http context) — leave the button as-is.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className="font-mono-ctv rounded border border-transparent px-1.5 py-0.5 text-[10px] text-white/45 transition-colors hover:border-[#2A2A2A] hover:text-white focus-visible:ring-2 focus-visible:ring-[#E8001D]"
    >
      {copied ? <span className="text-[#2dd4a4]">✓</span> : '⧉'}
    </button>
  );
}
