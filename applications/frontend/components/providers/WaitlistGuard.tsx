"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCheckWaitlistAccess } from "@/hooks/api";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAuth } from "@/hooks";

interface WaitlistGuardProps {
    children: ReactNode;
}

export function WaitlistGuard({ children }: WaitlistGuardProps) {
    const [hasChecked, setHasChecked] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { primaryWallet } = useDynamicContext();
    const { login, isAuthenticated } = useAuth();
    const isAuthenticatingRef = useRef(false);

    const walletAddress = primaryWallet?.address;
    const { data: accessData, isLoading } = useCheckWaitlistAccess(undefined, walletAddress);

    useEffect(() => {
        // Public routes
        if (pathname?.startsWith("/waitlist") || pathname === "/verifying") {
            setHasChecked(true);
            return;
        }

        if (!walletAddress) {
            router.replace("/waitlist");
            return;
        }

        if (isLoading) {
            return;
        }

        if (accessData && !accessData.hasAccess) {
            router.replace("/waitlist");
            return;
        }

        // User has access - authenticate if not already authenticated
        if (accessData?.hasAccess && !isAuthenticated && !isAuthenticatingRef.current) {
            isAuthenticatingRef.current = true;
            login().catch((error) => {
                console.error("Authentication failed after access granted:", error);
            }).finally(() => {
                isAuthenticatingRef.current = false;
                setHasChecked(true);
            });
            return;
        }

        if (accessData?.hasAccess) {
            setHasChecked(true);
        }
    }, [pathname, walletAddress, accessData, isLoading, isAuthenticated, login, router]);

    const isPublicRoute = pathname?.startsWith("/waitlist") || pathname === "/verifying";

    if (isLoading && !isPublicRoute) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-pulse text-center space-y-2">
                    <p className="text-sm uppercase tracking-[0.3em] text-primary">ChilizTV</p>
                    <p className="text-lg font-semibold text-white/80">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!hasChecked && !isPublicRoute) {
        return null;
    }

    return <>{children}</>;
}

