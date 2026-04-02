"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckWaitlistAccess, useJoinWaitlist } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2, TvIcon, Target, Users } from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { WaitlistHeader } from "@/components/WaitlistHeader";
import { WaitlistFooter } from "@/components/WaitlistFooter";
import PixelCard from "@/components/PixelCard";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const SplineBackground = dynamic(() => import("@/components/SplineBackground"), { ssr: false });

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

export default function WaitlistContent() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const router = useRouter();

    const { setShowAuthFlow, primaryWallet } = useDynamicContext();
    const walletAddress = primaryWallet?.address;

    // Check waitlist access using React Query hook
    const { data: accessData } = useCheckWaitlistAccess(undefined, walletAddress);
    const joinWaitlistMutation = useJoinWaitlist();

    useEffect(() => {
        const storedEmail = localStorage.getItem("waitlist_email");
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    useEffect(() => {
        if (accessData?.hasAccess) {
            router.push("/");
        }
    }, [accessData, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Email is required");
            return;
        }

        if (!EMAIL_PATTERN.test(trimmedEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
            setError("Email is too long");
            return;
        }

        if (isSubmitted) {
            return;
        }

        setIsLoading(true);
        setIsSubmitted(true);

        joinWaitlistMutation.mutate(
            {
                email: trimmedEmail,
                walletAddress,
                source: undefined
            },
            {
                onSuccess: () => {
                    setIsSuccess(true);
                    localStorage.setItem("waitlist_email", trimmedEmail);
                    setEmail(trimmedEmail);
                    setIsLoading(false);
                },
                onError: (err: Error) => {
                    setError(err.message || "Unable to join the waitlist. Please try again.");
                    setIsSubmitted(false);
                    setIsLoading(false);
                }
            }
        );
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
            {/* Animated 3D-style Background - Fixed for entire page */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <SplineBackground />

                <div className="absolute inset-0">
                    {/* Stadium-inspired animated background */}
                    <div className="absolute inset-0">
                        {/* Base gradient */}
                        <div className="absolute inset-0 bg-black/20" />

                        {/* Floating particles */}
                        <div className="absolute inset-0">
                            <div className="absolute top-[30%] left-[25%] w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                            <div className="absolute top-[70%] right-[25%] w-1 h-1 bg-[#FF3465]/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                            <div className="absolute top-[50%] left-[70%] w-1 h-1 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
                            <div className="absolute bottom-[40%] left-[50%] w-1 h-1 bg-[#FF3465]/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
                        </div>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Glowing orbs */}
                    <div className="absolute left-[-200px] top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute right-[-150px] bottom-0 w-[300px] h-[300px] bg-[#FF3465]/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
                </div>
            </div>

            <WaitlistHeader />

            {/* Spacer for fixed header, trying to find a solution to do it better */}
            <br /> <br /> <br /> <br /> <br /> <br />

            {/* Hero Section */}
            <section id="hero" className="relative z-20 w-full flex flex-col items-center px-8 pt-20">
                <div className="relative z-20 w-full h-full flex flex-col items-center px-8">
                    {/* Main Content - Centered */}
                    <div className="max-w-5xl mx-auto text-center flex-1 flex flex-col">
                        <div className="mb-8">
                            <h1 className="text-[64px] md:text-[80px] lg:text-[96px] font-black text-white leading-[0.9] mb-6 drop-shadow-2xl" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                Live Football.
                                <br />
                                <span className="text-primary drop-shadow-2xl">Live ChilizTV.</span>
                            </h1>

                        {isSuccess ? (
                            <div className="mt-12 space-y-6 animate-in fade-in duration-500">
                                <div className="relative inline-flex">
                                    <div className="absolute inset-0 animate-ping opacity-30">
                                        <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
                                    </div>
                                    <CheckCircle2 className="w-16 h-16 text-primary relative" />
                                </div>
                                <p className="text-[24px] md:text-[28px] font-semibold text-white drop-shadow-lg" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                   You&rsquo;re in the waitlist!
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-[20px] md:text-[24px] lg:text-[28px] font-semibold text-white mb-6 drop-shadow-lg" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    Join the Exclusive Waitlist
                                </p>

                                {/* Waitlist Form */}
                                <form onSubmit={handleSubmit} className="mt-8 max-w-2xl mx-auto">
                                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                                        <div className="relative w-full sm:w-auto flex-1 max-w-md">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                            <Input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full pl-12 pr-4 py-6 text-base bg-black/50 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                                style={{ fontFamily: 'Lexend, sans-serif' }}
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isLoading || isSubmitted}
                                            size="lg"
                                            className="bg-primary hover:bg-primary/90 px-8 py-6 text-[16px] font-bold tracking-wide uppercase rounded-lg shadow-2xl border-primary/20 border transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            style={{ fontFamily: 'Lexend, sans-serif' }}
                                        >
                                            {isLoading ? "Joining..." : "Join Waitlist"}
                                        </Button>
                                    </div>

                                    {error && (
                                        <div className="mt-4 text-red-400 text-sm bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg px-6 py-3 inline-flex items-center gap-2 drop-shadow-lg" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                            <span className="text-red-500">⚠️</span>
                                            {error}
                                        </div>
                                    )}

                                    {!walletAddress && (
                                        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
                                            <p className="text-white/70 text-sm drop-shadow-md" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                                Connect your wallet to get early access
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowAuthFlow(true)}
                                                className="bg-gradient-to-br from-[#1a1919] to-[#0f0f0f] border border-white/10 text-white hover:text-white hover:border-red-500 hover:scale-105 transition-all duration-300"
                                                style={{ fontFamily: 'Lexend, sans-serif' }}
                                            >
                                                Connect Wallet
                                            </Button>
                                        </div>
                                    )}

                                    {walletAddress && (
                                        <p className="mt-4 text-white/60 text-sm drop-shadow-md font-mono" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                            ✓ Wallet connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                        </p>
                                    )}
                                </form>
                            </>
                        )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Section */}
            <section id="product-section" className="py-16 sm:px-6 lg:px-8 relative">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Section Subtitle */}
                    <h2 className="text-center text-[20px] md:text-[24px] font-semibold text-white mb-12" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        Be among the first to experience the future of sports entertainment.
                    </h2>

                    {/* Product Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PixelCard variant="pink" gap={12} speed={40} className="w-full">
                            <div className="relative z-10 flex flex-col justify-center p-6 w-full h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <TvIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-white font-semibold text-base" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                        Sports Streaming
                                    </h3>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    Watch streamers with a fan community, share your own content and earn fan tokens.
                                </p>
                            </div>
                        </PixelCard>
                        <PixelCard variant="pink" gap={12} speed={40} className="w-full">
                            <div className="relative z-10 flex flex-col justify-center p-6 w-full h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Target className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-white font-semibold text-base" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                        Predict & Earn
                                    </h3>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    Make predictions, compete with your friends and the community to win exclusive rewards in fan tokens.
                                </p>
                            </div>
                        </PixelCard>
                        <PixelCard variant="pink" gap={12} speed={40} className="w-full">
                            <div className="relative z-10 flex flex-col justify-center p-6 w-full h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-white font-semibold text-base" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                        Everyone can be a Creator
                                    </h3>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    Create your own sports content and monetize your passion. Stream live, share analysis, and fan tokens.
                                </p>
                            </div>
                        </PixelCard>
                    </div>
                </div>
            </section>

            {/* Q&A Section */}
            <section id="faq-section" className="py-16 sm:px-6 lg:px-8 relative">
                <div className="max-w-3xl mx-auto px-6">
                    {/* Section Title */}
                    <h2 className="text-center text-[64px] md:text-[72px] font-bold text-white mb-16" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        FAQ
                    </h2>

                    {/* FAQ Items */}
                    <div className="space-y-4">
                        {[
                            {
                                question: "Who can stream on ChilizTV?",
                                answer: "Anyone holding fan tokens can become a streamer on ChilizTV. Simply connect your wallet, verify your fan token holdings, and start sharing your sports content with the community. Whether you're a dedicated fan, analyst, or sports enthusiast, you have the power to create and monetize your content."
                            },
                            {
                                question: "How does the ZK Identity system protect my privacy?",
                                answer: "Our ZK (Zero-Knowledge) Identity system ensures 100% anonymity when withdrawing your funds. We collect zero personal data, and all transactions are cryptographically verified without revealing your identity. Your privacy is guaranteed through advanced zero-knowledge proofs, making your financial activities completely untraceable."
                            },
                            {
                                question: "What sports can I make predictions on?",
                                answer: "During the beta phase, ChilizTV will focus exclusively on football (soccer), allowing you to make predictions on matches, tournaments, and live events. As we expand, we'll be adding UFC, basketball, and many other popular sports to the platform."
                            },
                            {
                                question: "How does the prediction system work?",
                                answer: "Our prediction system allows you to make forecasts on live sports events and compete with the community. Place your predictions using fan tokens, and if you're correct, you'll earn rewards based on the prediction pool. The more accurate your predictions, the higher your ranking and potential earnings. All predictions are transparently recorded on the blockchain."
                            },
                            {
                                question: "Can I watch live sports matches on ChilizTV?",
                                answer: "ChilizTV is primarily a platform for fan-created content, live commentary, analysis, and community engagement around sports events. While we don't stream official matches directly, our creators provide real-time reactions, expert analysis, watch parties, and post-match discussions. You'll experience sports through the passionate lens of the fan community while earning and engaging with fan tokens."
                            }
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={false}
                                animate={{
                                    scale: openFaqIndex === index ? 1.02 : 1,
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className={`border-2 rounded-lg overflow-hidden bg-black/70 backdrop-blur-sm ${
                                    openFaqIndex === index
                                        ? 'border-primary shadow-lg shadow-primary/20'
                                        : 'border-white/20 hover:border-primary/50'
                                }`}
                            >
                                <button
                                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between px-6 py-4 text-left group transition-all duration-300 bg-black/30 hover:bg-black/50"
                                    style={{ fontFamily: 'Lexend, sans-serif' }}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="text-primary font-bold text-sm">[{index + 1}]</span>
                                        <h3 className="text-white font-semibold text-base md:text-lg uppercase tracking-wide">
                                            {faq.question}
                                        </h3>
                                    </div>
                                    <motion.span
                                        animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-primary font-bold text-xl ml-4 flex-shrink-0"
                                    >
                                        {openFaqIndex === index ? '[-]' : '[+]'}
                                    </motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {openFaqIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <motion.div
                                                initial={{ y: -10 }}
                                                animate={{ y: 0 }}
                                                exit={{ y: -10 }}
                                                transition={{ duration: 0.3 }}
                                                className="px-6 py-5 bg-black/20 border-t-2 border-primary/30"
                                            >
                                                <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="join" className="py-16 sm:px-6 lg:px-8 pb-20 relative">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-center text-[20px] md:text-[24px] font-semibold text-white mb-12" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        Ready to Join the Community?
                    </h2>

                    {/* CTA Form */}
                    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                            <div className="relative w-full sm:w-auto flex-1 max-w-md">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-6 text-base bg-black/50 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                    style={{ fontFamily: 'Lexend, sans-serif' }}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || isSubmitted}
                                size="lg"
                                className="bg-primary hover:bg-primary/90 px-8 py-6 text-[16px] font-bold tracking-wide uppercase rounded-lg shadow-2xl border-primary/20 border transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                style={{ fontFamily: 'Lexend, sans-serif' }}
                            >
                                {isLoading ? "Joining..." : "Join Waitlist"}
                            </Button>
                        </div>

                        {error && (
                            <div className="mt-4 text-red-400 text-sm bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg px-6 py-3 inline-flex items-center gap-2 drop-shadow-lg" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                <span className="text-red-500">⚠️</span>
                                {error}
                            </div>
                        )}

                                    {walletAddress ? (
                                        <p className="mt-4 text-white/60 text-sm drop-shadow-md font-mono" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                            ✓ Wallet connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                        </p>
                                    ) : (
                                        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
                                            <p className="text-white/70 text-sm drop-shadow-md" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                                Connect your wallet to get early access
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowAuthFlow(true)}
                                                className="bg-gradient-to-br from-[#1a1919] to-[#0f0f0f] border border-white/10 text-white hover:text-white hover:border-red-500 hover:scale-105 transition-all duration-300"
                                                style={{ fontFamily: 'Lexend, sans-serif' }}
                                            >
                                                Connect Wallet
                                            </Button>
                                        </div>
                                    )}
                    </form>
                </div>
            </section>

            <WaitlistFooter />
        </div>
    );
}
