"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserUpdateRequest, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useFanTokens } from "@/hooks/useFanTokens";
import { useBalance } from "wagmi";
import {
  useUserPredictions,
  useUserPredictionStats,
  useDonorHistory,
  useSubscriberHistory,
  useFollowedStreamers,
} from "@/hooks/api";
import { usePortfolioCalculation } from "./hooks";
import { formatNumber as utilFormatNumber } from "./utils";
import { DashboardHeader, UserProfileCard, StatsCardsSection, FanTokensTab, PredictionsTab, TransactionsTab, SubscriptionsTab, FollowingTab } from "./sections";

interface UserMetadata {
  winRate?: number;
}

interface User {
  userId?: string;
  username?: string;
  metadata?: UserMetadata;
}

/**
 * @notice Main dashboard component
 * @dev Orchestrates all dashboard sections and data fetching
 */
export function Dashboard() {
  const [isClient, setIsClient] = useState(false);

  const { primaryWallet, user } = useDynamicContext() as {
    primaryWallet?: { address?: string };
    user?: User;
  };
  const { updateUserWithModal } = useUserUpdateRequest();

  const walletAddress = primaryWallet?.address;
  const username = user?.username || "Unknown User";
  const userId = user?.userId || "";

  const { totalBalance: fanTokenBalance, tokenBalances, isLoading: isLoadingFanTokens } = useFanTokens(
    walletAddress,
    !!walletAddress
  );

  const { data: chzBalanceData } = useBalance({
    address: walletAddress as `0x${string}` | undefined,
  });

  const { data: predictions = [], isLoading: isLoadingPredictions } = useUserPredictions(userId);
  const { data: statsData } = useUserPredictionStats(userId);

  const userStats = {
    totalPredictions: statsData?.totalBets || 0,
    totalWins: statsData?.wonBets || 0,
    totalLosses: statsData?.lostBets || 0,
    activePredictions: statsData?.pendingBets || 0,
    winRate: statsData?.winRate || 0,
  };

  const { data: donationsData, isLoading: isLoadingDonations } = useDonorHistory(walletAddress || "");
  const { data: subscriptionsData, isLoading: isLoadingSubscriptions } = useSubscriberHistory(
    walletAddress || ""
  );

  const donations = donationsData?.donations || [];
  const subscriptions = subscriptionsData?.subscriptions || [];
  const isLoadingTransactions = isLoadingDonations || isLoadingSubscriptions;

  const { portfolioValue, realFanTokens, isLoadingPrices } = usePortfolioCalculation(
    tokenBalances,
    chzBalanceData?.formatted,
    walletAddress
  );

  const { data: followedStreamers = [], isLoading: isLoadingFollows } = useFollowedStreamers(userId || undefined);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatNumber = (num: number) => utilFormatNumber(num, isClient);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <DashboardHeader username={isClient ? username : "..."} />

        <UserProfileCard
          username={isClient ? username : "..."}
          walletAddress={walletAddress}
          userStats={userStats}
          userId={userId || undefined}
          onEditUsername={() => updateUserWithModal(["username"])}
        />

        <StatsCardsSection
          fanTokenBalance={fanTokenBalance}
          portfolioValue={portfolioValue}
          activePredictions={userStats.activePredictions}
          walletAddress={walletAddress}
          isLoadingFanTokens={isLoadingFanTokens}
          formatNumber={formatNumber}
        />

        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-[#1a1919] border-white/10 mb-4">
            <TabsTrigger
              value="tokens"
              className="data-[state=active]:bg-primary text-white"
            >
              Fan Tokens
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-primary text-white"
            >
              Predictions
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-primary text-white"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="data-[state=active]:bg-primary text-white"
            >
              Subscriptions
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="data-[state=active]:bg-primary text-white"
            >
              Following
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tokens">
            <FanTokensTab
              isLoading={isLoadingFanTokens}
              realFanTokens={realFanTokens}
              walletAddress={walletAddress}
              formatNumber={formatNumber}
              isLoadingPrices={isLoadingPrices}
            />
          </TabsContent>

          <TabsContent value="history">
            <PredictionsTab
              isLoading={isLoadingPredictions}
              predictions={predictions}
              walletAddress={walletAddress}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab
              isLoading={isLoadingTransactions}
              donations={donations}
              subscriptions={subscriptions}
              walletAddress={walletAddress}
            />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsTab
              isLoading={isLoadingTransactions}
              subscriptions={subscriptions}
              walletAddress={walletAddress}
            />
          </TabsContent>

          <TabsContent value="following">
            <FollowingTab
              follows={followedStreamers}
              subscriptions={subscriptions}
              userId={userId}
              isLoading={isLoadingFollows}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}