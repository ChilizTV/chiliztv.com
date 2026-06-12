"use client";

import { useCallback, useEffect, useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { adminApi, type AdminSession } from "@/lib/api/endpoints/admin";
import { getAdminToken, getGateToken, setAdminToken } from "@/lib/api/auth";
import { AdminSessionProvider } from "@/providers/AdminSessionProvider";
import { GateScreen } from "./GateScreen";
import { ConnectWalletScreen } from "./ConnectWalletScreen";
import { AccessDeniedScreen } from "./AccessDeniedScreen";
import { AdminLoadingScreen } from "./AdminLoadingScreen";

type GuardState =
  | { step: "gate" }
  | { step: "disconnected" }
  | { step: "authenticating" }
  | { step: "checking" }
  | { step: "admin"; session: AdminSession }
  | { step: "denied"; wallet: string }
  | { step: "error"; message: string };

/**
 * Entry gate of the whole panel: access code → wallet connect → one-time
 * signature (JWT issued only after on-chain key proof) → RBAC probe via
 * GET /admin/me. Every API call carries both the JWT and the gate token.
 */
export function AdminGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const { primaryWallet } = useDynamicContext();
  const wallet = primaryWallet?.address;
  const [state, setState] = useState<GuardState>({ step: "gate" });

  const probe = useCallback(async (walletAddress: string) => {
    setState({ step: "checking" });
    try {
      const me = await adminApi.me();
      setState({ step: "admin", session: me.data });
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 403) setState({ step: "denied", wallet: walletAddress });
      else setState({ step: "error", message: "Session check failed" });
    }
  }, []);

  const login = useCallback(async () => {
    if (!primaryWallet?.address) return;
    const walletAddress = primaryWallet.address;
    setState({ step: "authenticating" });
    try {
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
      if (status === 403) setState({ step: "denied", wallet: walletAddress });
      else setState({ step: "error", message: "Authentication failed — reconnect and retry" });
    }
  }, [primaryWallet, probe]);

  useEffect(() => {
    if (!getGateToken()) {
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
      return <GateScreen onPassed={() => setState(wallet ? { step: "checking" } : { step: "disconnected" })} />;
    case "disconnected":
      return <ConnectWalletScreen />;
    case "authenticating":
      return <AdminLoadingScreen label="Verifying signature" />;
    case "checking":
      return <AdminLoadingScreen label="Checking access" />;
    case "denied":
      return <AccessDeniedScreen wallet={state.wallet} />;
    case "error":
      return (
        <main className="flex min-h-svh items-center justify-center">
          <p className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF1737]">
            {state.message}
          </p>
        </main>
      );
    case "admin":
      return <AdminSessionProvider session={state.session}>{children}</AdminSessionProvider>;
  }
}
