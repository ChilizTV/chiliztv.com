"use client";

import Image from "next/image";
import { Linkedin } from "lucide-react";

// X (Twitter) Icon Component
const XIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export function WaitlistFooter() {
    return (
        <footer className="relative z-20 bg-black/50 backdrop-blur-md text-white border-t border-white/10 px-6 py-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm" style={{ fontFamily: 'Lexend, sans-serif' }}>
                
                {/* Left: Logo + Name */}
                <div className="flex items-center gap-4">
                    <Image src="/Logo_FINAL.svg" alt="ChilizTV" width={32} height={32} className="rounded-full" />
                    <span className="text-white text-[16px] uppercase tracking-wider font-semibold">ChilizTV</span>
                </div>

                {/* Right: Social Icons */}
                <div className="flex items-center gap-6">
                    <span className="text-white/60 text-xs">Follow us</span>
                    <div className="flex gap-4">
                        <a 
                            href="https://twitter.com/chiliztv" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-white/70 hover:text-primary transition-colors duration-200"
                            aria-label="X (Twitter)"
                        >
                            <XIcon className="w-5 h-5" />
                        </a>
                        <a 
                            href="https://linkedin.com/company/chiliztv" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-white/70 hover:text-primary transition-colors duration-200"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Line */}
            <div className="text-center text-white/50 text-xs mt-6">
                © {new Date().getFullYear()} ChilizTV. All rights reserved.
            </div>
        </footer>
    );
}

