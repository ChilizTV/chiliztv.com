"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Facebook, Twitter, Youtube } from "lucide-react";

export function Footer() {
    const router = useRouter();

    return (
        <footer className="bg-black/90 text-white border-t border-white/10 backdrop-blur-md px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm" style={{ fontFamily: 'Lexend, sans-serif' }}>
            
            {/* Left: Logo + Name */}
            <div className="flex items-center gap-4">
            <Image src="/Logo_FINAL.svg" alt="ChilizTV" width={36} height={36} className="rounded-full" />
            <span className="text-white text-[18px] uppercase tracking-wider font-semibold">ChilizTV</span>
            </div>

            {/* Center: Navigation */}
            <div className="flex flex-wrap gap-6 justify-center text-white/70 text-[14px]">
            <span className="hover:text-white cursor-pointer transition" onClick={() => router.push("/")}>Home</span>
            <span className="hover:text-white cursor-pointer transition" onClick={() => router.push("/live")}>Live Matches</span>
            <span className="hover:text-white cursor-pointer transition" onClick={() => router.push("/dashboard")}>Dashboard</span>
            {/* <span className="hover:text-white cursor-pointer transition" onClick={() => router.push("/terms")}>Terms</span>
            <span className="hover:text-white cursor-pointer transition" onClick={() => router.push("/privacy")}>Privacy</span> */}
            </div>

            {/* Right: Social Icons */}
            <div className="flex gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                <Twitter className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                <Facebook className="w-5 h-5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                <Youtube className="w-5 h-5" />
            </a>
            </div>
        </div>

        {/* Bottom Line */}
        <div className="text-center text-white/50 text-xs mt-8">
            © {new Date().getFullYear()} ChilizTV. All rights reserved.
        </div>
        </footer>
    );
}
