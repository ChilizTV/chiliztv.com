"use client";

import Link from "next/link";
import SplineBackground from "./SplineBackground";
import { HeroMatchList } from "./HeroMatchList";

export function HeroSection() {
    return (
        <section className="relative h-screen flex items-center justify-center w-full overflow-hidden bg-black">
        <SplineBackground />

        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0">
                    <div className="absolute top-[30%] left-[25%] w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }} />
                    <div className="absolute top-[70%] right-[25%] w-1 h-1 bg-[#FF3465]/40 rounded-full animate-bounce" style={{ animationDelay: "1s", animationDuration: "4s" }} />
                    <div className="absolute top-[50%] left-[70%] w-1 h-1 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: "2s", animationDuration: "5s" }} />
                    <div className="absolute bottom-[40%] left-[50%] w-1 h-1 bg-[#FF3465]/50 rounded-full animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "3.5s" }} />
                </div>
            </div>
        </div>

        <div className="absolute inset-0 z-10 overflow-hidden">
            <div className="absolute left-[-200px] top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
            <div className="absolute right-[-150px] bottom-0 w-[300px] h-[300px] bg-[#FF3465]/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
        </div>

        <div className="relative z-20 w-full h-full flex flex-col justify-center items-center px-6 sm:px-8 pt-20">
            <div className="max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center w-full">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] font-black text-white leading-[0.9] mb-6 drop-shadow-2xl" style={{ fontFamily: "Lexend, sans-serif" }}>
                        Live Football.
                        <br />
                        <span className="text-primary drop-shadow-2xl">Live ChilizTV.</span>
                    </h1>
                    <p className="text-[18px] sm:text-[20px] md:text-[24px] lg:text-[28px] font-semibold text-white mb-4 sm:mb-6 drop-shadow-lg" style={{ fontFamily: "Lexend, sans-serif" }}>
                        The Ultimate SocialFi Experience for Football Fans.
                    </p>
                    <p className="text-[14px] sm:text-[16px] md:text-[18px] text-white/95 leading-relaxed max-w-2xl mx-auto drop-shadow-md break-words" style={{ fontFamily: "Lexend, sans-serif" }}>
                        Join thousands of fans predict on live football matches.
                        <br />
                        And earn Fan Tokens to unlock exclusive rewards and experiences.
                    </p>
                </div>

                <div className="mb-6 sm:mb-8 px-2">
                    <Link
                        href="/live"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 mb-6"
                        style={{ fontFamily: "Lexend, sans-serif" }}
                    >
                        Browse matches
                    </Link>
                    <HeroMatchList />
                </div>
            </div>
        </div>
        </section>
    );
}