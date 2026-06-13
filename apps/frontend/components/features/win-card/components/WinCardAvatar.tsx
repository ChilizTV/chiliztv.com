import styles from './WinCard.module.css';

const GRADS: ReadonlyArray<readonly [string, string]> = [
  ['#E8001D', '#6F0011'],
  ['#F5C518', '#6F5400'],
  ['#2dd4a4', '#0C5A45'],
  ['#FF1737', '#4D0008'],
  ['#B0001A', '#2A0005'],
];

/** Initial on a deterministic gradient — no photo, matching the brand rule. */
export function WinCardAvatar({ pseudo, size = 72 }: Readonly<{ pseudo: string; size?: number }>) {
  let h = 0;
  for (const c of pseudo) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [a, b] = GRADS[h % GRADS.length];
  return (
    <div className={styles.avatar} style={{ width: size, height: size, background: `linear-gradient(135deg, ${a}, ${b})` }}>
      <span className={styles.wscDisp} style={{ fontSize: size * 0.5 }}>
        {(pseudo[0] ?? '?').toUpperCase()}
      </span>
    </div>
  );
}
