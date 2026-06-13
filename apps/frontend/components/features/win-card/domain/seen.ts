/** Per-(wallet, match) "win card already auto-shown" flag, in localStorage.
 *  Purely a popup-gating UX flag — the card stays reachable from positions. */

const KEY = 'predcast:wincard-seen';

function read(): Record<string, true> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Record<string, true>;
  } catch {
    return {};
  }
}

function entry(wallet: string, matchId: number): string {
  return `${wallet.toLowerCase()}:${matchId}`;
}

export function isWinSeen(wallet: string, matchId: number): boolean {
  return read()[entry(wallet, matchId)] === true;
}

export function markWinSeen(wallet: string, matchId: number): void {
  if (typeof window === 'undefined') return;
  const next = read();
  next[entry(wallet, matchId)] = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full / disabled — the popup will simply show again, harmless.
  }
}
