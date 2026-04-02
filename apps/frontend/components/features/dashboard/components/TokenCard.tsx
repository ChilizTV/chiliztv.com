import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { TokenDisplay } from "../utils/portfolio.utils";
import { formatUSDValue, formatTokenBalance } from "@/lib/utils/formatting/price";
import { formatPercentage } from "@/lib/utils/formatting/number";

/**
 * @notice Token display card with balance, price, and 24h change
 * @dev Shows token logo, quantity, current price, price change percentage
 */
export function TokenCard({
  token,
  formatNumber,
  isLoadingPrices,
}: Readonly<{
  token: TokenDisplay;
  formatNumber: (num: number) => string;
  isLoadingPrices: boolean;
}>) {
  return (
    <Card className="bg-[#0f0f0f] border-white/10 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={token.logo} alt={token.team} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {token.symbol}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-white text-sm">{token.team}</h3>
            <p className="text-white/60 text-xs">{token.symbol}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Quantity</span>
            <span className="text-white font-bold">{formatTokenBalance(token.quantity, 2)}</span>
          </div>
          {token.currentPrice > 0 ? (
            <>
              <div className="flex justify-between">
                <span className="text-white/60">Price</span>
                <span className="text-white font-bold">{formatUSDValue(token.currentPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Change (24h)</span>
                <div className="flex items-center gap-1">
                  {token.change > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : token.change < 0 ? (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  ) : null}
                  {token.change !== 0 && (
                    <span
                      className={`text-xs font-bold ${
                        token.change > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {token.change > 0 ? "+" : ""}
                      {formatPercentage(token.change, 2)}
                    </span>
                  )}
                  {token.change === 0 && (
                    <span className="text-xs font-bold text-white/60">0%</span>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 mt-2 flex justify-between">
                <span className="text-white/60">Total Value</span>
                <span className="text-white font-bold">
                  ${formatNumber(token.quantity * token.currentPrice)}
                </span>
              </div>
            </>
          ) : isLoadingPrices ? (
            <div className="pt-2 border-t border-white/10 mt-2 flex justify-between">
              <span className="text-white/60">Loading price...</span>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10 mt-2 flex justify-between">
              <span className="text-white/60">Total Tokens</span>
              <span className="text-white font-bold">{formatTokenBalance(token.quantity, 2)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
