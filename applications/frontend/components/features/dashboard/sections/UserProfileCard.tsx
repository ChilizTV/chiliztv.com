"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Wallet, Trophy, Users, Star, Coins } from "lucide-react";
import { formatPercentage } from "@/lib/utils/formatting/number";
import { useFollowerCount, useStreamerStats } from "@/hooks/api";

interface UserStats {
  totalPredictions: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
}

/**
 * @notice User profile card with avatar, wallet, prediction stats, and streamer stats
 * @dev Shows user info, wallet address, win rate, and Twitch-style streamer stats
 */
export function UserProfileCard({
  username,
  walletAddress,
  userStats,
  userId,
  onEditUsername,
}: Readonly<{
  username: string;
  walletAddress: string | undefined;
  userStats: UserStats;
  userId?: string;
  onEditUsername: () => void;
}>) {
  const { data: followerCount = 0 } = useFollowerCount(userId || undefined);
  const { data: statsData } = useStreamerStats(walletAddress || "");

  const stats = statsData?.stats;
  const totalSubscribers = stats?.totalSubscribers ?? 0;
  const totalRevenue = stats ? parseFloat(stats.totalRevenue || "0").toFixed(2) : "0";

  return (
    <Card className="mb-6 bg-gradient-to-r from-[#1a1919] to-[#0f0f0f] border-white/10">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16 border-2 border-primary/30">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" />
              <AvatarFallback className="bg-primary/20 text-white text-xl font-bold">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl text-white font-bold">{username}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-white/60 hover:text-white"
                  onClick={onEditUsername}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-white/60 text-sm font-mono truncate max-w-[220px]">
                <Wallet className="inline-block w-4 h-4 mr-1" />
                {walletAddress ? (
                  <span className="break-all">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                ) : (
                  <span className="text-red-500">No wallet connected</span>
                )}
              </div>
              <div className="text-sm text-white/70 flex gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Win Rate: {formatPercentage(userStats.winRate)}
                </div>
                <span>Total Predictions: {userStats.totalPredictions}</span>
              </div>
              {/* Streamer stats — Twitch-style compact row */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Users className="w-3 h-3 text-purple-400" />
                  <span className="text-white/80 font-medium">{followerCount}</span>
                  <span>followers</span>
                </span>
                <span className="text-white/20 text-xs">·</span>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-white/80 font-medium">{totalSubscribers}</span>
                  <span>subs</span>
                </span>
                <span className="text-white/20 text-xs">·</span>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Coins className="w-3 h-3 text-green-400" />
                  <span className="text-white/80 font-medium">{totalRevenue} CHZ</span>
                  <span>earned</span>
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">
              {userStats.totalWins} / {userStats.totalPredictions}
            </p>
            <p className="text-sm text-white/60">Wins / Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
