/**
 * @notice Achievement badges section displaying monthly winners
 * @dev Shows Champion, Sharpshooter, and Speed Demon badges
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Star, Target, Zap } from "lucide-react";

/**
 * @notice Display monthly achievement badges
 */
export function AchievementBadges() {
  return (
    <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-[#1a1919] to-[#0f0f0f] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
          <Star className="w-5 h-5 text-primary" />
          Monthly Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Champion Badge */}
          <div className="text-center p-4 bg-gradient-to-b from-yellow-500/20 to-yellow-600/5 rounded-lg border border-yellow-500/20">
            <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-bold text-white mb-1 text-base sm:text-lg">Champion</h4>
            <p className="text-yellow-500 text-sm sm:text-base">Most wins this month</p>
            <p className="text-white/60 text-xs sm:text-sm mt-1">FootballKing - 127 wins</p>
          </div>

          {/* Sharpshooter Badge */}
          <div className="text-center p-4 bg-gradient-to-b from-blue-500/20 to-blue-600/5 rounded-lg border border-blue-500/20">
            <Target className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <h4 className="font-bold text-white mb-1 text-base sm:text-lg">Sharpshooter</h4>
            <p className="text-blue-500 text-sm sm:text-base">Highest accuracy</p>
            <p className="text-white/60 text-xs sm:text-sm mt-1">StrategyGuru - 89.2%</p>
          </div>

          {/* Speed Demon Badge */}
          <div className="text-center p-4 bg-gradient-to-b from-purple-500/20 to-purple-600/5 rounded-lg border border-purple-500/20">
            <Zap className="w-12 h-12 text-purple-500 mx-auto mb-2" />
            <h4 className="font-bold text-white mb-1 text-base sm:text-lg">Speed Demon</h4>
            <p className="text-purple-500 text-sm sm:text-base">Fastest live predictions</p>
            <p className="text-white/60 text-xs sm:text-sm mt-1">LivePredictionPro - 0.3s avg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
