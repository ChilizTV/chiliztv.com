'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { WinCardData } from '../domain/types';
import { WinCardModal } from './WinCardModal';

interface WinCardModalApi {
  /** Open the celebration modal for a built win card. */
  readonly open: (data: WinCardData) => void;
}

const noop: WinCardModalApi = { open: () => undefined };
const WinCardModalContext = createContext<WinCardModalApi>(noop);

/** Hook to open the win-card modal from anywhere under the provider. No-op
 *  (safe) when rendered without a provider. */
export function useWinCardModal(): WinCardModalApi {
  return useContext(WinCardModalContext);
}

/** Holds the single active win card and renders its modal. Wrap surfaces that
 *  trigger the card (dashboard, live page). */
export function WinCardModalProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [active, setActive] = useState<WinCardData | null>(null);
  const api = useMemo<WinCardModalApi>(() => ({ open: setActive }), []);
  const close = useCallback(() => setActive(null), []);

  return (
    <WinCardModalContext.Provider value={api}>
      {children}
      {active ? <WinCardModal data={active} onClose={close} /> : null}
    </WinCardModalContext.Provider>
  );
}
