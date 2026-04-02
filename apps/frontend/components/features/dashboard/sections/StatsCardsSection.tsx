import { Trophy, TrendingUp, History } from "lucide-react";
import { StatCard } from "../components/StatCard";

/**
 * @notice Stats cards section showing portfolio metrics
 * @dev Displays fan tokens, portfolio value, and active predictions
 */
export function StatsCardsSection({
  fanTokenBalance,
  portfolioValue,
  activePredictions,
  walletAddress,
  isLoadingFanTokens,
  formatNumber,
}: Readonly<{
  fanTokenBalance: number;
  portfolioValue: number;
  activePredictions: number;
  walletAddress: string | undefined;
  isLoadingFanTokens: boolean;
  formatNumber: (num: number) => string;
}>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Fan Tokens"
        value={
          !walletAddress
            ? "Connect wallet"
            : isLoadingFanTokens
            ? "Loading..."
            : formatNumber(fanTokenBalance)
        }
        icon={<Trophy className="w-6 h-6 text-white" />}
      />
      <StatCard
        title="Portfolio Value"
        value={`$${formatNumber(portfolioValue)}`}
        icon={<TrendingUp className="w-6 h-6 text-green-500" />}
      />
      <StatCard
        title="Active Predictions"
        value={activePredictions}
        icon={<History className="w-6 h-6 text-blue-500" />}
      />
    </div>
  );
}
