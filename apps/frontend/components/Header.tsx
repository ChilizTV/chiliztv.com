"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
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
                        <div
                            className="font-display text-[24px] font-extrabold uppercase tracking-[0.01em] leading-none text-white"
                        >
                            Chiliz<span className="text-[#E8001D]">TV</span>
                        </div>
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex flex-row items-center gap-x-8">
                        <button
                            className="font-mono-ctv group relative text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:text-[#E8001D] cursor-pointer after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:scale-x-0 after:bg-[#E8001D] after:transition-transform after:duration-200 hover:after:scale-x-100"
                            onClick={() => router.push("/how-it-works")}
                        >
                            How it works
                        </button>
                        <button
                            className="font-mono-ctv group relative text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:text-[#E8001D] cursor-pointer after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:scale-x-0 after:bg-[#E8001D] after:transition-transform after:duration-200 hover:after:scale-x-100"
                            onClick={() => router.push("/browse")}
                        >
                            Discover
                        </button>
                        <button
                            className="font-mono-ctv group relative text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:text-[#E8001D] cursor-pointer after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:scale-x-0 after:bg-[#E8001D] after:transition-transform after:duration-200 hover:after:scale-x-100"
                            onClick={() => router.push("/leaderboard")}
                        >
                            Leaderboard
                        </button>
                        {connected && (
                            <button
                                className="font-mono-ctv group relative text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:text-[#E8001D] cursor-pointer after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:scale-x-0 after:bg-[#E8001D] after:transition-transform after:duration-200 hover:after:scale-x-100"
                                onClick={() => router.push("/dashboard")}
                            >
                                Dashboard
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
                            className="md:hidden overflow-hidden flex flex-col gap-5 mt-5 text-white"
                        >
                            <button
                                onClick={() => {
                                    router.push("/how-it-works");
                                    setMenuOpen(false);
                                }}
                                className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 transition-colors hover:text-white text-left"
                            >
                                How it works
                            </button>
                            <button
                                onClick={() => {
                                    router.push("/browse");
                                    setMenuOpen(false);
                                }}
                                className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 transition-colors hover:text-white text-left"
                            >
                                Discover
                            </button>
                            <button
                                onClick={() => {
                                    router.push("/leaderboard");
                                    setMenuOpen(false);
                                }}
                                className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 transition-colors hover:text-white text-left"
                            >
                                Leaderboard
                            </button>
                            {connected && (
                                <button
                                    onClick={() => {
                                        router.push("/dashboard");
                                        setMenuOpen(false);
                                    }}
                                    className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 transition-colors hover:text-white text-left"
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
