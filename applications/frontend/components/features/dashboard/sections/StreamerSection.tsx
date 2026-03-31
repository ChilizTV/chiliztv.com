"use client";

import { Users, Star, Coins } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { useFollowerCount, useStreamerStats } from "@/hooks/api";

interface StreamerSectionProps {
  userId: string;
  walletAddress?: string;
}

export function StreamerSection({ userId, walletAddress }: StreamerSectionProps) {
  const { data: followerCount = 0 } = useFollowerCount(userId || undefined);
  const { data: statsData } = useStreamerStats(walletAddress || "");

  const stats = statsData?.stats;
  const totalSubscribers = stats?.totalSubscribers ?? 0;
  const totalRevenue = stats ? `${parseFloat(stats.totalRevenue || "0").toFixed(2)} CHZ` : "0 CHZ";

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Your Streamer Stats
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Followers"
          value={followerCount}
          icon={<Users className="w-6 h-6 text-purple-400" />}
        />
        <StatCard
          title="Subscribers"
          value={totalSubscribers}
          icon={<Star className="w-6 h-6 text-yellow-400" />}
        />
        <StatCard
          title="Total Earned"
          value={totalRevenue}
          icon={<Coins className="w-6 h-6 text-green-400" />}
        />
      </div>
    </div>
  );
}
