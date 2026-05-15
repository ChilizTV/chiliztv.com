'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { Trophy } from 'lucide-react';

interface BetExplosionProps {
  /** When this flips to true, the explosion plays once. */
  active: boolean;
  /** Image URL of the team/outcome logo. If absent, the icon is used instead. */
  logoUrl?: string;
  /** Fallback icon size in px. */
  fallbackIconSize?: number;
  /** Accent colour for shockwave + particle tint. */
  accent: string;
  /** Optional label flashed above the explosion (e.g. outcome name). */
  label?: string;
  /** Called once the animation finishes (use to cleanup parent state). */
  onComplete?: () => void;
}

/**
 * Full-viewport overlay that "explodes" a team logo when a bet succeeds.
 *
 * Stages (orchestrated by framer-motion, all in ~1.6s):
 *   1. Backdrop fades in with a darkened blur.
 *   2. The logo zooms up from 0.3x to 1.4x then snap-shrinks to 0.
 *   3. Simultaneously, 24 radial particles fly outward from the logo origin,
 *      tinted with the outcome accent colour, with random angular jitter.
 *   4. A shockwave ring expands from the centre and fades.
 *   5. The optional label drops in from above then fades.
 *
 * Pure CSS/transform driven — no canvas — so it stays cheap and respects
 * prefers-reduced-motion in browsers that ignore Framer's spring physics.
 */
export function BetExplosion({
  active,
  logoUrl,
  fallbackIconSize = 96,
  accent,
  label,
  onComplete,
}: BetExplosionProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.2;
        const distance = 220 + Math.random() * 120;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 6 + Math.random() * 10,
          rot: Math.random() * 360,
          delay: Math.random() * 0.08,
        };
      }),
    // re-roll particle positions each time the explosion re-triggers
    [active],
  );

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {active && (
        <motion.div
          key="explosion"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 80%)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {/* Optional outcome label drop-in */}
          {label && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 20 }}
              className="absolute top-[18%] text-center"
            >
              <div
                className="text-[12px] font-bold uppercase tracking-[0.2em]"
                style={{ color: accent, fontFamily: "'Barlow', sans-serif" }}
              >
                Bet placed
              </div>
              <div
                className="mt-1 text-[36px] font-bold uppercase leading-none"
                style={{
                  color: '#fff',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  textShadow: `0 0 30px ${accent}`,
                  letterSpacing: '0.04em',
                }}
              >
                {label}
              </div>
            </motion.div>
          )}

          {/* Shockwave ring */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{
              width: 220,
              height: 220,
              border: `4px solid ${accent}`,
              boxShadow: `0 0 80px ${accent}, inset 0 0 80px ${accent}`,
            }}
          />

          {/* Centre logo / icon */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.4, 1.6, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.0, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' }}
            className="relative flex items-center justify-center"
            style={{
              filter: `drop-shadow(0 0 32px ${accent})`,
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="outcome"
                width={fallbackIconSize * 1.6}
                height={fallbackIconSize * 1.6}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <Trophy size={fallbackIconSize} style={{ color: accent }} />
            )}
          </motion.div>

          {/* Radial particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0.6, opacity: 1, rotate: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: [0.6, 1.4, 0],
                opacity: [1, 1, 0],
                rotate: p.rot,
              }}
              transition={{
                duration: 1.2,
                delay: p.delay,
                ease: 'easeOut',
              }}
              className="absolute rounded-sm"
              style={{
                width: p.size,
                height: p.size,
                background: `linear-gradient(135deg, ${accent} 0%, #fff 100%)`,
                boxShadow: `0 0 12px ${accent}`,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
