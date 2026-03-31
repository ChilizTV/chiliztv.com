"use client";

import { Button } from "./ui/button";
import Image from "next/image";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export function WaitlistHeader() {
    const { setShowAuthFlow, primaryWallet, handleLogOut } = useDynamicContext();
    const connected = Boolean(primaryWallet?.address);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <Image
                            src="/Logo_FINAL.svg"
                            alt="ChilizTV Logo"
                            width={36}
                            height={36}
                            className="rounded-full shadow-lg"
                        />
                        <div className="text-white text-[20px] uppercase tracking-wider font-semibold" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            ChilizTV
                        </div>
                    </div>

                    {/* Connect Wallet Button */}
                    <div className="flex items-center gap-4">
                        {!connected ? (
                            <Button
                                onClick={() => setShowAuthFlow(true)}
                                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-6 transition-all duration-300"
                                style={{ fontFamily: 'Lexend, sans-serif' }}
                            >
                                Connect Wallet
                            </Button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-white text-sm font-medium" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
                                </span>
                                </div>
                                <Button
                                    onClick={() => handleLogOut && handleLogOut()}
                                    className="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-6 transition-all duration-300"
                                    style={{ fontFamily: 'Lexend, sans-serif' }}
                                >
                                    Disconnect
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

