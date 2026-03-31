import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { TokenCard } from "../components/TokenCard";
import type { TokenDisplay } from "../utils/portfolio.utils";

/**
 * @notice Fan tokens tab content
 * @dev Displays grid of user's fan token holdings
 */
export function FanTokensTab({
  isLoading,
  realFanTokens,
  walletAddress,
  formatNumber,
  isLoadingPrices,
}: Readonly<{
  isLoading: boolean;
  realFanTokens: TokenDisplay[];
  walletAddress: string | undefined;
  formatNumber: (num: number) => string;
  isLoadingPrices: boolean;
}>) {
  return (
    <Card className="bg-[#0f0f0f] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Your Fan Tokens
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-white/60">Loading your fan tokens...</p>
          </div>
        ) : realFanTokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Trophy className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/60 text-center">
              {!walletAddress
                ? "Connect your wallet to see your fan tokens"
                : "You don't have any fan tokens yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {realFanTokens.map((token) => (
              <TokenCard
                key={token.id}
                token={token}
                formatNumber={formatNumber}
                isLoadingPrices={isLoadingPrices}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
