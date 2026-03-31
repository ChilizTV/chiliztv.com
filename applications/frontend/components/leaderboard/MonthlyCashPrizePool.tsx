import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Trophy, Crown, Medal, Star } from "lucide-react";
import PrizePool from "./PrizePool";
import { formatLargeNumber } from "@/lib/utils/formatting/number";

export function MonthlyCashPrizePool() {
    // Enhanced prize breakdown data with icons
    const prizeBreakdown = [
        { rank: "1st Place", amount: 20000, icon: Crown, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
        { rank: "2nd Place", amount: 15000, icon: Medal, color: "text-gray-300", bgColor: "bg-gray-300/10" },
        { rank: "3rd Place", amount: 10000, icon: Medal, color: "text-amber-600", bgColor: "bg-amber-600/10" },
        { rank: "4th - 10th Place", amount: 5000, icon: Star, color: "text-blue-400", bgColor: "bg-blue-400/10" },
    ];

    const totalPrizePool = prizeBreakdown.reduce((acc, prize) => acc + prize.amount, 0);

    return (
        <Card className="bg-gradient-to-br from-[#1a1919] via-[#0f0f0f] to-[#1a1919] border-white/20 mt-8 sm:mt-10 shadow-2xl shadow-yellow-400/5 hover:shadow-yellow-400/10 transition-all duration-300">
        <CardHeader className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-green-400/5 animate-pulse"></div>
            <CardTitle className="flex items-center gap-3 text-white text-lg sm:text-xl font-bold relative z-10">
            <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
            Monthly Cash Prize Pool
            </CardTitle>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-green-400/20 rounded-full blur-xl"></div>
        </CardHeader>
        
        <CardContent className="relative">
            <p className="text-white/80 mb-6 text-sm sm:text-base leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>
            Compete in this month&apos;s leaderboard to win your share of the cash prize pool. The more you win, the bigger your reward!
            </p>

            <div className="mb-8 text-center">
            <PrizePool totalPrizePool={totalPrizePool} />
            </div>

            <div className="space-y-4">
            {prizeBreakdown.map(({ rank, amount, icon: Icon, color, bgColor }, index) => (
                <div
                key={rank}
                className={`flex justify-between items-center p-4 rounded-lg border border-white/5 ${bgColor} hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${bgColor} border border-white/10`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="text-white/90 font-semibold text-sm sm:text-base">{rank}</span>
                </div>
                <div className="text-right">
                    <div className="text-green-400 font-bold text-lg sm:text-xl">${formatLargeNumber(amount)}</div>
                    <div className="text-white/40 text-xs">per winner</div>
                </div>
                </div>
            ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
                <Star className="w-4 h-4" />
                Pro Tip
            </div>
            <p className="text-white/70 text-sm">
                Winners are determined by monthly leaderboard rankings. Keep playing to climb higher and earn more!
            </p>
            </div>
        </CardContent>

        <style jsx>{`
            @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
            }
        `}</style>
        </Card>
    );
}