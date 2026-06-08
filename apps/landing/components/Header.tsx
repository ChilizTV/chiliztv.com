"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useDynamicContext, DynamicConnectButton } from "@dynamic-labs/sdk-react-core";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const NAV_LINKS = [
  { label: "How it works", href: "/how-it-works", external: false },
  { label: "Discover", href: `${APP_URL}/browse`, external: true },
  { label: "Leaderboard", href: `${APP_URL}/leaderboard`, external: true },
];

export function Header() {
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
          <Link href="/" className="flex items-center cursor-pointer" aria-label="PredCast home">
            <Image
              src="/predcast-logo.svg"
              alt="PredCast"
              width={182}
              height={28}
              priority
              className="h-7 w-auto transition-transform hover:-translate-y-px"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-row items-center gap-x-8">
            {NAV_LINKS.map(({ label, href, external }) =>
              external ? (
                <a
                  key={label}
                  href={href}
                  className="font-mono-ctv group relative text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:text-[#E8001D] after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:scale-x-0 after:bg-[#E8001D] after:transition-transform after:duration-200 hover:after:scale-x-100"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="font-mono-ctv group relative text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:text-[#E8001D] after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:scale-x-0 after:bg-[#E8001D] after:transition-transform after:duration-200 hover:after:scale-x-100"
                >
                  {label}
                </Link>
              )
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white" onClick={() => setMenuOpen((p) => !p)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Wallet button (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {!connected ? (
              <DynamicConnectButton>
                <span className="rounded-md bg-[#E8001D] px-7 py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-white hover:-translate-y-px hover:bg-[#FF1737] transition-all inline-block cursor-pointer" style={{ boxShadow: "0 8px 32px rgba(232,0,29,0.25)" }}>
                  Connect Wallet
                </span>
              </DynamicConnectButton>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#E8001D]/20 border border-[#E8001D]/30 rounded-md">
                  <div className="w-2 h-2 bg-[#2dd4a4] rounded-full animate-pulse" />
                  <span className="font-mono-ctv text-white text-[12px] font-bold tracking-[0.06em]">
                    {primaryWallet?.address?.slice(0, 6)}…{primaryWallet?.address?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={() => handleLogOut?.()}
                  className="font-mono-ctv rounded-md border border-[#2A2A2A] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.06em] text-white/65 hover:border-[#E8001D] hover:text-white transition-all"
                >
                  Disconnect
                </button>
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
              {NAV_LINKS.map(({ label, href, external }) =>
                external ? (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 transition-colors hover:text-white"
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                )
              )}
              <div className="border-t border-white/10 pt-4">
                {!connected ? (
                  <DynamicConnectButton>
                    <span className="block rounded-md bg-[#E8001D] px-6 py-3 text-center text-[13px] font-bold uppercase tracking-[0.06em] text-white cursor-pointer">
                      Connect Wallet
                    </span>
                  </DynamicConnectButton>
                ) : (
                  <button
                    onClick={() => { handleLogOut?.(); setMenuOpen(false); }}
                    className="block w-full rounded-md border border-[#2A2A2A] px-6 py-3 text-center text-[13px] font-bold uppercase tracking-[0.06em] text-white/65"
                  >
                    Disconnect · {primaryWallet?.address?.slice(0, 6)}…{primaryWallet?.address?.slice(-4)}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
