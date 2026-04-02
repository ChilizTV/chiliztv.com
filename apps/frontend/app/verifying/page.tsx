"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckWaitlistAccess } from "@/hooks/api";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAuth } from "@/hooks";

function VerifyingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { primaryWallet } = useDynamicContext();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [storedEmail, setStoredEmail] = useState<string | undefined>();

    const nextTarget = searchParams.get("next") || "/live";

    useEffect(() => {
        if (typeof window !== "undefined") {
            setStoredEmail(localStorage.getItem("waitlist_email") || undefined);
        }
    }, []);

    const { data: accessData, isLoading: accessLoading } = useCheckWaitlistAccess(storedEmail, primaryWallet?.address);

    useEffect(() => {
        if (authLoading || accessLoading) {
            return;
        }

        if (!storedEmail && !primaryWallet?.address) {
            router.replace("/waitlist");
            return;
        }

        if (primaryWallet?.address && !isAuthenticated) {
            return;
        }

        if (accessData?.hasAccess) {
            router.replace(nextTarget);
        } else if (accessData && !accessData.hasAccess) {
            router.replace("/waitlist");
        }
    }, [primaryWallet?.address, router, nextTarget, isAuthenticated, authLoading, accessData, accessLoading, storedEmail]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="text-center space-y-3 animate-in fade-in duration-300">
                <p className="text-sm uppercase tracking-[0.3em] text-primary">ChilizTV</p>
                <p className="text-xl font-semibold text-white/80">Verifying access...</p>
                <p className="text-white/60 text-xs">Hang tight while we confirm your status.</p>
            </div>
        </div>
    );
}

export default function VerifyingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center space-y-3 animate-in fade-in duration-300">
                    <p className="text-sm uppercase tracking-[0.3em] text-primary">ChilizTV</p>
                    <p className="text-xl font-semibold text-white/80">Loading...</p>
                </div>
            </div>
        }>
            <VerifyingContent />
        </Suspense>
    );
}

