"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { adminApi, type AdminSession } from "@/lib/api/endpoints/admin";
import { clearAdminToken, getAdminToken, getGateToken, setAdminToken } from "@/lib/api/auth";
import { AdminSessionProvider } from "@/providers/AdminSessionProvider";
import { GateScreen } from "./GateScreen";
import { ConnectWalletScreen } from "./ConnectWalletScreen";
import { AccessDeniedScreen } from "./AccessDeniedScreen";
import { AdminLoadingScreen } from "./AdminLoadingScreen";
import { AuthErrorScreen } from "./AuthErrorScreen";

type GuardState =
  | { step: "gate" }
  | { step: "disconnected" }
  | { step: "authenticating" }
  | { step: "checking" }
  | { step: "admin"; session: AdminSession }
  | { step: "denied"; wallet: string }
  | { step: "error"; message: string };

/** Wallet the stored JWT was issued for — a token must never outlive a wallet switch. */
function tokenWallet(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { walletAddress?: string };
    return payload.walletAddress ?? null;
  } catch {
    return null;
  }
}

/**
 * Entry gate of the whole panel: access code → wallet connect → one-time
 * signature (JWT issued only after on-chain key proof) → RBAC probe via
 * GET /admin/me. Every API call carries both the JWT and the gate token.
 */
export function AdminGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const wallet = primaryWallet?.address;
  const [state, setState] = useState<GuardState>({ step: "gate" });
  // Mirror for the effect — error/denied are sticky until the user acts.
  // Synced in its own effect (declared first so it runs before the main one).
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  // Dynamic re-emits primaryWallet on connect; a second concurrent login would
  // overwrite the challenge nonce and fail the first one's signature.
  const loginInFlight = useRef(false);

  const probe = useCallback(async (walletAddress: string) => {
    setState({ step: "checking" });
    try {
      const me = await adminApi.me();
      setState({ step: "admin", session: me.data });
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 403) {
        setState({ step: "denied", wallet: walletAddress });
      } else {
        setState({ step: "error", message: "Session check failed" });
        void handleLogOut().catch(() => undefined);
      }
    }
  }, [handleLogOut]);

  const login = useCallback(async () => {
    if (!primaryWallet?.address || loginInFlight.current) return;
    loginInFlight.current = true;
    const walletAddress = primaryWallet.address;
    setState({ step: "authenticating" });
    try {
      const existing = getAdminToken();
      if (existing && tokenWallet(existing) !== walletAddress.toLowerCase()) clearAdminToken();
      if (!getAdminToken()) {
        const challenge = await adminApi.challenge(walletAddress);
        const signature = await primaryWallet.signMessage(challenge.data.message);
        if (!signature) throw new Error("signature rejected");
        const verified = await adminApi.verify(walletAddress, signature);
        setAdminToken(verified.token);
      }
      await probe(walletAddress);
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 403) {
        setState({ step: "denied", wallet: walletAddress });
      } else {
        // Disconnect so the next attempt starts clean; the screen stays until "Back".
        setState({ step: "error", message: "Signature could not be verified — reconnect and retry" });
        void handleLogOut().catch(() => undefined);
      }
    } finally {
      loginInFlight.current = false;
    }
  }, [primaryWallet, probe, handleLogOut]);

  const backToConnect = useCallback(() => {
    clearAdminToken();
    void handleLogOut().catch(() => undefined);
    setState({ step: "disconnected" });
  }, [handleLogOut]);

  useEffect(() => {
    // error/denied wait for an explicit user action (Back / Use another wallet) —
    // the auto-logout below would otherwise yank the screen away instantly.
    if (stateRef.current.step === "error" || stateRef.current.step === "denied") return;
    // The guard mirrors two non-reactive external stores (sessionStorage gate
    // token, Dynamic wallet) into the state machine — these synchronous
    // transitions are the sync point, not derivable at render (SSR-safe).
    if (!getGateToken()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ step: "gate" });
      return;
    }
    if (!wallet) {
      setState({ step: "disconnected" });
      return;
    }
    void login();
    // login identity changes with the wallet — exactly the re-auth trigger we want.
  }, [wallet, login]);

  switch (state.step) {
    case "gate":
      // A wallet may already be connected when the gate opens — start login
      // directly (the effect only re-fires on wallet change).
      return <GateScreen onPassed={() => (wallet ? void login() : setState({ step: "disconnected" }))} />;
    case "disconnected":
      return <ConnectWalletScreen />;
    case "authenticating":
      return <AdminLoadingScreen label="Verifying signature" />;
    case "checking":
      return <AdminLoadingScreen label="Checking access" />;
    case "denied":
      return <AccessDeniedScreen wallet={state.wallet} onSwitchWallet={backToConnect} />;
    case "error":
      return <AuthErrorScreen message={state.message} onBack={backToConnect} />;
    case "admin":
      return <AdminSessionProvider session={state.session}>{children}</AdminSessionProvider>;
  }
}
