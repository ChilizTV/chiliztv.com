'use client';

import { useEffect, useRef, useState } from 'react';

const ARM_MS = 4000;
const RING_C = 28.3; // circumference of the r=4.5 ring

interface ConfirmActionButtonProps {
  readonly label: string;
  readonly confirmLabel: string;
  readonly pending: boolean;
  readonly danger?: boolean;
  readonly onConfirm: () => void;
}

/** Two-step inline confirm: first click arms for 4s (countdown ring), second fires. */
export function ConfirmActionButton({
  label,
  confirmLabel,
  pending,
  danger = false,
  onConfirm,
}: Readonly<ConfirmActionButtonProps>) {
  const [armedAt, setArmedAt] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const disarm = () => {
    if (timer.current) clearTimeout(timer.current);
    if (raf.current) cancelAnimationFrame(raf.current);
    setArmedAt(null);
    setProgress(0);
  };

  const click = () => {
    if (pending) return;
    if (armedAt === null) {
      const started = Date.now();
      setArmedAt(started);
      timer.current = setTimeout(disarm, ARM_MS);
      const tick = () => {
        setProgress(Math.min(1, (Date.now() - started) / ARM_MS));
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
      return;
    }
    disarm();
    onConfirm();
  };

  if (armedAt !== null) {
    return (
      <button
        type="button"
        onClick={click}
        className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md border border-[#E8001D] bg-[#E8001D]/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white"
      >
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
          <circle cx="6" cy="6" r="4.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <circle
            cx="6"
            cy="6"
            r="4.5"
            fill="none"
            stroke="#FF1737"
            strokeWidth="2"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * progress}
            transform="rotate(-90 6 6)"
          />
        </svg>
        {confirmLabel}
      </button>
    );
  }

  const tone = danger
    ? 'border-[#E8001D]/40 text-[#FF1737] hover:border-[#E8001D]'
    : 'border-[#2A2A2A] text-white/65 hover:border-[#3A3A3A] hover:text-white';

  return (
    <button
      type="button"
      onClick={click}
      disabled={pending}
      className={`font-mono-ctv rounded-md border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] transition-colors disabled:opacity-40 ${tone}`}
    >
      {pending ? '…' : label}
    </button>
  );
}
