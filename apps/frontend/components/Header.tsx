"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Trophy, TvIcon, User, X } from "lucide-react";
import { useDynamicContext, DynamicConnectButton } from "@dynamic-labs/sdk-react-core";

export function Header() {
    const router = useRouter();
    const { primaryWallet, handleLogOut } = useDynamicContext();

    const connected = Boolean(primaryWallet?.address);

    const [menuOpen, setMenuOpen] = useState(false);

    const dropdownVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
    };

    return (
        <header className="sticky top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10 bg-gradient-to-b from-black/20 to-transparent shadow-lg">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <button className="flex items-center gap-4 cursor-pointer" onClick={() => router.push("/")}>
                        <Image
                            src="/Logo_FINAL.svg"
                            alt="ChilizTV Logo"
                            width={40}
                            height={40}
                            className="rounded-full shadow-lg transition-transform hover:scale-105"
                        />
                        <div className="text-white text-[24px] uppercase tracking-wider">
                            ChilizTV
                        </div>
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex flex-row gap-[38px] items-center text-[16px]">
                        <button
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                            onClick={() => router.push("/live")}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    router.push("/live");
                                }
                            }}
                        >
                            <TvIcon /> 
                            <span className="text-white/70 hover:text-white transition-colors cursor-pointer">
                                Browse Matches
                            </span>
                        </button>
                        <button
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                            onClick={() => router.push("/leaderboard")}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    router.push("/leaderboard");
                                }
                            }}
                        >
                            <Trophy />
                            <span className="text-white/70 hover:text-white transition-colors cursor-pointer">
                                Leaderboard
                            </span>
                        </button>
                        {connected && (
                            // Balance in USD
                            <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer" onClick={() => router.push("/dashboard")}>
                                <User />
                                <span className="text-white/70 hover:text-white transition-colors cursor-pointer">
                                    Profile
                                </span>
                            </button>
                        )}
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-white" onClick={() => setMenuOpen(prev => !prev)}>
                        {menuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>

                    {/* Auth Buttons (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        {!connected ? (
                                <DynamicConnectButton buttonClassName="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-6 py-2 transition-all duration-300">
                                Connect Wallet
                                </DynamicConnectButton>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-white text-sm font-medium">
                                        {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => handleLogOut?.()}
                                    className="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-6 transition-all duration-300"
                                >
                                    Disconnect
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Drop-down Menu */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={dropdownVariants}
                            transition={{ duration: 0.25 }}
                            className="md:hidden overflow-hidden flex flex-col gap-4 mt-4 text-white text-base"
                        >
                            <button
                                onClick={() => {
                                    router.push("/live");
                                    setMenuOpen(false);
                                }}
                                className="text-white/80 hover:text-white text-left"
                            >
                                Live Matches
                            </button>
                            <button
                                onClick={() => {
                                    router.push("/leaderboard");
                                    setMenuOpen(false);
                                }}
                                className="text-white/80 hover:text-white text-left"
                            >
                                Leaderboard
                            </button>
                            {connected && (
                                <button
                                    onClick={() => {
                                        router.push("/dashboard");
                                        setMenuOpen(false);
                                    }}
                                    className="text-white/80 hover:text-white text-left"
                                >
                                    Dashboard
                                </button>
                            )}
                            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                                {!connected ? (
                                        <DynamicConnectButton>
                                        <Button
                                            onClick={() => setMenuOpen(false)}
                                            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-6 transition-all duration-300"
                                        >
                                            Connect Wallet
                                        </Button>
                                    </DynamicConnectButton>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg justify-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-white text-sm font-medium">
                                                {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                handleLogOut?.();
                                                setMenuOpen(false);
                                            }}
                                            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-6 transition-all duration-300"
                                        >
                                            Disconnect
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
