'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { WinCardData } from '../domain/types';
import { fmtMult } from '../domain/logic';
import { WinCard } from './WinCard';

const CARD_W = 1080;
const CARD_H = 1920;

/** Largest scale that fits the story card in the available box. */
function useFitScale(): number {
  const [scale, setScale] = useState(0.3);
  useEffect(() => {
    const compute = () => {
      const maxW = Math.min(window.innerWidth - 48, 460);
      const maxH = window.innerHeight - 220; // leave room for the action dock
      setScale(Math.max(0.1, Math.min(maxW / CARD_W, maxH / CARD_H)));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);
  return scale;
}

interface WinCardModalProps {
  readonly data: WinCardData;
  readonly onClose: () => void;
}

/** Full-screen celebration overlay: the story card + Share / Replay actions.
 *  No claim here — claiming lives in 'Your positions'. */
export function WinCardModal({ data, onClose }: WinCardModalProps) {
  const scale = useFitScale();
  // Bumping the key remounts the card → replays the reveal animation.
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const share = async () => {
    const url = `https://predcast.tv/live/${data.matchId}`;
    const text = `Called it. ×${fmtMult(data.mult)} on PredCast.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PredCast', text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success('Link copied — share your win');
    } catch {
      // user cancelled the share sheet, or clipboard denied — no-op
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-y-auto bg-black/80 px-6 py-8 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Win card"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="font-mono-ctv absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/50 text-white/80 backdrop-blur transition-colors hover:text-white"
      >
        ✕
      </button>

      {/* card — click inside must not close */}
      <div onClick={(e) => e.stopPropagation()} style={{ width: CARD_W * scale, height: CARD_H * scale, flex: 'none' }}>
        <div style={{ width: CARD_W, height: CARD_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <WinCard key={replayKey} data={data} format="story" />
        </div>
      </div>

      {/* actions */}
      <div onClick={(e) => e.stopPropagation()} className="mt-5 flex w-full max-w-[460px] flex-col gap-3">
        <button
          type="button"
          onClick={share}
          className="font-display flex h-14 items-center justify-center gap-3 rounded-xl bg-[#E8001D] text-[19px] font-extrabold uppercase tracking-[0.03em] text-white transition-colors hover:bg-[#FF1737]"
          style={{ boxShadow: '0 12px 30px rgba(232,0,29,0.32)' }}
        >
          Share image
          <span className="font-mono-ctv text-[13px] font-bold">→</span>
        </button>
        <button
          type="button"
          onClick={() => setReplayKey((k) => k + 1)}
          className="font-display flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] text-[17px] font-bold uppercase tracking-[0.03em] text-white/90 transition-colors hover:border-white/35"
        >
          Replay
        </button>
        <div className="font-mono-ctv flex justify-center gap-4 pt-1 text-[10px] uppercase tracking-[0.2em] text-white/35">
          <span>X</span>
          <span>·</span>
          <span>WhatsApp</span>
          <span>·</span>
          <span>Telegram</span>
        </div>
      </div>
    </div>
  );
}
