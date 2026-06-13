'use client';

import { useEffect, useState } from 'react';

import type { WinCardData, WinCardFormat } from '../domain/types';
import { fmtMult, fmtWinNum, winOnomatopoeia, winTier } from '../domain/logic';
import styles from './WinCard.module.css';
import { WinHalo, WinRays, WinConfetti } from './WinCardFx';
import { WinCardMark } from './WinCardMark';
import { WinCardAvatar } from './WinCardAvatar';

const ONOMA_SIZE: Record<WinCardFormat, Record<1 | 2 | 3 | 4, number>> = {
  story: { 1: 236, 2: 322, 3: 264, 4: 268 },
  square: { 1: 150, 2: 204, 3: 168, 4: 170 },
};

const MAX_LISTED_BETS = 4;

/** Count-up 1 → target. Jumps to final when static or reduced-motion. */
function useCountUp(target: number, isStatic: boolean): number {
  const reduce =
    isStatic ||
    (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [v, setV] = useState(reduce ? target : 1);
  useEffect(() => {
    if (reduce) {
      setV(target);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start == null) start = t;
      const el = t - start - 350;
      const p = el < 0 ? 0 : Math.min(1, el / 1300);
      setV(1 + (target - 1) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}

interface WinCardProps {
  readonly data: WinCardData;
  readonly format?: WinCardFormat;
  /** Freeze the final state (image render / capture) — no animation. */
  readonly isStatic?: boolean;
}

/** Crest: real team logo when available, else the derived 3-letter code. */
function Crest({ logo, code, size }: Readonly<{ logo: string | null; code: string; size: number }>) {
  return (
    <div className={styles.crest} style={{ width: size, height: size }}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" loading="lazy" />
      ) : (
        <span className={styles.wscDisp} style={{ fontSize: size * 0.33 }}>
          {code}
        </span>
      )}
    </div>
  );
}

export function WinCard({ data, format = 'story', isStatic = false }: WinCardProps) {
  const tier = winTier(data.mult);
  const onoma = winOnomatopoeia(data.mult);
  const story = format === 'story';
  const mult = useCountUp(data.mult, isStatic);
  const net = data.payout - data.stake;
  const seed = data.contractAddress.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;

  const [anim, setAnim] = useState(!isStatic);
  useEffect(() => {
    if (isStatic) return;
    const t = setTimeout(() => setAnim(false), 2600);
    return () => clearTimeout(t);
  }, [isStatic]);

  const cls = [styles.wsc, tier === 4 ? styles.t4 : '', anim ? styles.anim : ''].filter(Boolean).join(' ');
  const dim = story ? { width: 1080, height: 1920 } : { width: 1080, height: 1080 };
  const onomaSize = ONOMA_SIZE[format][tier];
  const multSize = story ? (tier === 1 ? 220 : 296) : tier === 1 ? 160 : 204;
  const dotIdx = onoma.length - 1;

  const single = data.bets.length === 1;
  const visibleBets = data.bets.slice(0, MAX_LISTED_BETS);
  const hiddenCount = data.bets.length - visibleBets.length;

  return (
    <div className={cls} style={dim}>
      <WinHalo tier={tier} />
      <WinRays tier={tier} />
      {tier >= 3 ? <WinConfetti tier={tier} seed={seed} /> : null}
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.content} style={{ padding: story ? '76px 76px 64px' : '60px 64px 52px' }}>
        {/* header */}
        <div className={styles.header}>
          <div className={`${styles.eyebrow} ${styles.wscMono}`} style={{ fontSize: 25, letterSpacing: '0.22em' }}>
            <span className={styles.bar} />
            {data.eyebrow}
          </div>
          <div className={`${styles.settled} ${styles.wscMono}`} style={{ fontSize: 22, letterSpacing: '0.2em' }}>
            <span className={styles.dot} />
            Settled on-chain
          </div>
        </div>

        {/* hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: story ? 34 : 22, minHeight: 0 }}>
          <div className={`${styles.onoma} ${styles.wscDisp}`} style={{ fontSize: onomaSize }}>
            {onoma.slice(0, dotIdx)}
            <span className={styles.pt}>.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: story ? 18 : 12 }}>
            <div className={`${styles.multlabel} ${styles.wscMono}`} style={{ fontSize: story ? 24 : 20 }}>
              Multiplier
            </div>
            <div className={`${styles.mult} ${styles.wscDisp}`} style={{ fontSize: multSize }}>
              <span className={styles.x}>×</span>
              {fmtMult(mult)}
            </div>
          </div>

          <div className={`${styles.gain} ${styles.wscDisp}`} style={{ fontSize: story ? 80 : 60 }}>
            +{fmtWinNum(net)} USDC
          </div>

          <div className={`${styles.strip} ${styles.wscMono}`} style={{ fontSize: story ? 27 : 22, padding: story ? '22px 40px' : '16px 30px' }}>
            <span className={styles.lab}>Stake</span>
            <span className={styles.val}>{fmtWinNum(data.stake)}</span>
            <span className={styles.arr}>→</span>
            <span className={styles.lab}>Payout</span>
            <span className={styles.val}>{fmtWinNum(data.payout)}</span>
            <span className={styles.lab}>USDC</span>
          </div>
        </div>

        {/* bet block */}
        <div className={styles.bet} style={{ padding: story ? '40px 48px' : '26px 40px' }}>
          <div className={`${styles.stage} ${styles.wscMono}`} style={{ fontSize: story ? 22 : 19 }}>
            {data.stage}
          </div>

          {single ? (
            <div className={`${styles.title} ${styles.wscDisp}`} style={{ fontSize: story ? 60 : 44, marginTop: story ? 18 : 12 }}>
              {data.bets[0].label}
            </div>
          ) : null}

          {/* team row — the shared match */}
          {story ? (
            <div className={styles.betrow} style={{ marginTop: single ? 34 : 24 }}>
              <div className={styles.team}>
                <Crest logo={data.home.logo} code={data.home.code} size={64} />
                <span className={`${styles.name} ${styles.wscDisp}`} style={{ fontSize: 28 }}>
                  {data.home.name}
                </span>
              </div>
              <div className={`${styles.score} ${styles.wscDisp}`} style={{ fontSize: 66 }}>
                {data.score ?? '—'}
              </div>
              <div className={styles.team}>
                <Crest logo={data.away.logo} code={data.away.code} size={64} />
                <span className={`${styles.name} ${styles.wscDisp}`} style={{ fontSize: 28 }}>
                  {data.away.name}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.wscMono} style={{ marginTop: 14, fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.14em' }}>
              {data.home.code} <span style={{ color: '#fff' }}>{data.score ?? '—'}</span> {data.away.code}
            </div>
          )}

          {/* multi-bet list */}
          {!single ? (
            <div className={styles.betlist} style={{ marginTop: 24 }}>
              {visibleBets.map((b) => (
                <div key={b.id} className={styles.betlistRow} style={{ padding: story ? '18px 26px' : '13px 20px' }}>
                  <span className={`${styles.lbl} ${styles.wscDisp}`} style={{ fontSize: story ? 32 : 24 }}>
                    {b.label}
                  </span>
                  <span className={`${styles.m} ${styles.wscDisp}`} style={{ fontSize: story ? 32 : 24 }}>
                    ×{fmtMult(b.mult)}
                  </span>
                </div>
              ))}
              {hiddenCount > 0 ? (
                <div className={`${styles.betmore} ${styles.wscMono}`} style={{ fontSize: story ? 20 : 16, padding: story ? '16px' : '12px' }}>
                  +{hiddenCount} more {hiddenCount === 1 ? 'bet' : 'bets'}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* crowd */}
        <div className={`${styles.crowd} ${styles.wscMono}`} style={{ fontSize: story ? 25 : 21, margin: story ? '34px 0' : '24px 0' }}>
          {data.crowd.pre}
          <b>{data.crowd.hi}</b>
          {data.crowd.post}
        </div>

        {/* footer */}
        <div className={styles.footer} style={{ paddingTop: story ? 36 : 26 }}>
          <div className={styles.player}>
            <WinCardAvatar pseudo={data.pseudo} size={story ? 74 : 60} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: story ? 8 : 6, minWidth: 0 }}>
              <span className={`${styles.pseudo} ${styles.wscMono}`} style={{ fontSize: story ? 28 : 23 }}>
                {data.pseudo}
              </span>
              {data.rank ? (
                <span className={`${styles.rank} ${styles.wscMono}`} style={{ fontSize: story ? 21 : 18 }}>
                  {data.rank}
                </span>
              ) : null}
            </div>
          </div>
          <div className={styles.brand}>
            <WinCardMark size={story ? 56 : 46} mono={tier === 4} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: story ? 7 : 5 }}>
              <span className={`${styles.word} ${styles.wscDisp}`} style={{ fontSize: story ? 36 : 30 }}>
                PredCast
              </span>
              <span className={`${styles.url} ${styles.wscMono}`} style={{ fontSize: story ? 20 : 17 }}>
                predcast.tv
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
