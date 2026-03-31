/**
 * @notice Main leaderboard component
 * @dev Orchestrates predictor and token holder rankings with tabs
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award } from "lucide-react";
import { getAllFanTokens } from "@/utils/FanTokens";
import { MonthlyCashPrizePool } from "../../leaderboard/MonthlyCashPrizePool";
import { LeaderboardHeader, AchievementBadges, PredictorCard, TokenHolderCard } from "./components";
import { mockTopPredictors, mockTopTokenHolders } from "./utils";

/**
 * @notice Main leaderboard page component
 * @dev Displays top predictors and token holders with achievement badges
 */
export function Leaderboard() {
  const [activeTab, setActiveTab] = useState("predicts");
  const fanTokens = getAllFanTokens();

  /**
   * @notice Get token logo URL by symbol
   * @param tokenSymbol Token symbol to lookup
   * @return Logo URL or placeholder
   */
  const getTokenLogo = (tokenSymbol: string): string => {
    const token = fanTokens.find((t: { symbol: string }) => t.symbol === tokenSymbol);
    return token?.image ?? `https://via.placeholder.com/24?text=${tokenSymbol}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <LeaderboardHeader />
        <MonthlyCashPrizePool />
        <AchievementBadges />

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8 sm:mt-10">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1919] border-white/10 mb-6 rounded-md overflow-hidden">
            <TabsTrigger value="predicts" className="data-[state=active]:bg-primary text-white py-2 sm:py-3">
              🎯 Top Predicts
            </TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-primary text-white py-2 sm:py-3">
              💎 Token Holders
            </TabsTrigger>
          </TabsList>

          {/* Top Predicts Tab */}
          <TabsContent value="predicts">
            <Card className="bg-gradient-to-br from-[#1a1919] to-[#0f0f0f] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Trophy className="w-5 h-5 text-primary" />
                  Top Predicts This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopPredictors.map((predictor) => (
                    <PredictorCard
                      key={predictor.rank}
                      predictor={predictor}
                      tokenLogo={getTokenLogo(predictor.favoriteTeam)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Token Holders Tab */}
          <TabsContent value="tokens">
            <Card className="bg-gradient-to-br from-[#1a1919] to-[#0f0f0f] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Award className="w-5 h-5 text-primary" />
                  Top Fan Token Holders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopTokenHolders.map((holder) => (
                    <TokenHolderCard key={holder.rank} holder={holder} tokenLogo={getTokenLogo(holder.topToken)} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
