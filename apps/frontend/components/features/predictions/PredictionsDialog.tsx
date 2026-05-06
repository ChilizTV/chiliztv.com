"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { useBalance } from "wagmi";
import { parseUnits } from "viem";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Confetti from "react-confetti";
import { useFanTokens } from "@/hooks/useFanTokens";
import { useBettingMatch } from "@/hooks/useBettingMatch";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { useCreatePrediction } from "@/hooks/api";
import { ExtendedOdds } from "@/models/match.model";
import { useCHZPrice } from "./hooks";
import {
  getTeamData,
  getOutcomeIndex,
  calculateAmountFontSize,
  calculatePercentageAmount,
  MARKET_IDS,
  BET_PERCENTAGES,
  OVER_UNDER_OUTCOMES,
  BTTS_OUTCOMES,
  BETTING_LIMITS,
  MARKET_NAMES,
} from "./utils";
import { formatUSDValue, convertUSDtoCHZ } from "@/lib/utils/formatting/price";
import { formatDecimal } from "@/lib/utils/formatting/number";

interface DynamicUserExtended {
  userId?: string;
  alias?: string;
  email?: string;
}

interface PredictionsDialogProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  TeamA: string;
  TeamB: string;
  walletAddress?: string;
  bettingContractAddress?: `0x${string}`;
  odds?: ExtendedOdds | null;
  matchId: number;
  matchStartTime: string;
}

/**
 * @notice Predictions dialog component for placing bets
 * @dev Handles team selection, over/under, BTTS betting with fan token gating
 */
export default function PredictionsDialog({
  isLoggedIn,
  onLogin,
  TeamA,
  TeamB,
  walletAddress,
  bettingContractAddress,
  odds,
  matchId,
  matchStartTime,
}: PredictionsDialogProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedOverUnder, setSelectedOverUnder] = useState<"under" | "over" | null>(null);
  const [selectedBtts, setSelectedBtts] = useState<"yes" | "no" | null>(null);
  const [predictionAmount, setpredictionAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasSavedForTxRef = useRef<string | null>(null);
  const [betDetails, setBetDetails] = useState<{
    team: string;
    amount: string;
    odds: number;
    predictionType: 'WIN_HOME' | 'WIN_AWAY' | 'DRAW' | 'OVER' | 'UNDER';
    predictedTeam: string;
  } | null>(null);
  const { primaryWallet: wallets, user: dynamicUser } = useDynamicContext();

  const user = wallets?.address ?? "";
  const userId = (dynamicUser as DynamicUserExtended)?.userId || "";
  const chzPrice = useCHZPrice(isDialogOpen);
  const { mutateAsync: createPrediction } = useCreatePrediction();

  const { data: balanceData } = useBalance({
    address: user as `0x${string}`,
  });

  const { totalBalance: fanTokenBalance } = useFanTokens(
    walletAddress || user,
    isDialogOpen && (!!walletAddress || !!user)
  );
  const hasFanTokens = fanTokenBalance >= 1;

  useEffect(() => {
    const getWindowDimensions = () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    setWindowDimensions(getWindowDimensions());

    const handleResize = () => {
      setWindowDimensions(getWindowDimensions());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxAmount = balanceData ? Number(balanceData.formatted) * chzPrice! : 0;

  const matchContractAddress =
    bettingContractAddress || ("0x0000000000000000000000000000000000000000" as `0x${string}`);

  const { assetDecimals: usdcDecimals } = usePoolDecimals();
  const { placeBet, betState } = useBettingMatch(
    matchContractAddress,
    user as `0x${string}`
  );

  const { isPending, isConfirming, isSuccess: isConfirmed, txHash: hash } = betState;

  const hasValidSelection =
    selectedTeam || (hasFanTokens && selectedOverUnder) || (hasFanTokens && selectedBtts);

  const handleprediction = async () => {
    if (!isLoggedIn) {
      console.error("User is not logged in");
      onLogin();
      return;
    }

    if (!hasValidSelection || !predictionAmount.trim()) {
      console.error("Please select a bet and enter a prediction amount");
      return;
    }

    if (!chzPrice) {
      console.error("CHZ price not loaded");
      return;
    }

    const amountInCHZ = convertUSDtoCHZ(Number(predictionAmount), chzPrice);

    const teamAName = typeof TeamA === 'object' && TeamA !== null ? (TeamA as unknown as { name: string }).name : TeamA;
    const teamBName = typeof TeamB === 'object' && TeamB !== null ? (TeamB as unknown as { name: string }).name : TeamB;

    try {
      let marketId: number;
      let outcome: number;
      let selectedPrediction: string;
      let selectedOdds: number = 2.0;
      let predictionType: 'WIN_HOME' | 'WIN_AWAY' | 'DRAW' | 'OVER' | 'UNDER';
      let predictedTeam: string;

      if (selectedTeam) {
        marketId = Number(MARKET_IDS.MATCH_WINNER);
        outcome = Number(getOutcomeIndex(selectedTeam, TeamA, TeamB));
        selectedPrediction = selectedTeam;

        const winnerOdds = odds?.match_winner;
        if (selectedTeam === teamASymbol && winnerOdds?.home) {
          selectedOdds = winnerOdds.home;
          predictionType = 'WIN_HOME';
          predictedTeam = teamAName;
        } else if (selectedTeam === "Draw" && winnerOdds?.draw) {
          selectedOdds = winnerOdds.draw;
          predictionType = 'DRAW';
          predictedTeam = "Draw";
        } else if (selectedTeam === teamBSymbol && winnerOdds?.away) {
          selectedOdds = winnerOdds.away;
          predictionType = 'WIN_AWAY';
          predictedTeam = teamBName;
        } else {
          // Fallback if odds not available
          predictionType = selectedTeam === teamASymbol ? 'WIN_HOME' : selectedTeam === "Draw" ? 'DRAW' : 'WIN_AWAY';
          predictedTeam = selectedTeam === teamASymbol ? teamAName : selectedTeam === "Draw" ? "Draw" : teamBName;
        }
      } else if (selectedOverUnder) {
        marketId = Number(MARKET_IDS.OVER_UNDER);
        outcome = selectedOverUnder === "over" ? OVER_UNDER_OUTCOMES.OVER : OVER_UNDER_OUTCOMES.UNDER;
        selectedPrediction = selectedOverUnder === "over" ? "Over 2.5" : "Under 2.5";
        selectedOdds = 1.9;
        predictionType = selectedOverUnder === "over" ? 'OVER' : 'UNDER';
        predictedTeam = selectedPrediction;
      } else if (selectedBtts) {
        marketId = Number(MARKET_IDS.BOTH_TEAMS_SCORE);
        outcome = selectedBtts === "yes" ? BTTS_OUTCOMES.YES : BTTS_OUTCOMES.NO;
        selectedPrediction = selectedBtts === "yes" ? "BTTS Yes" : "BTTS No";
        selectedOdds = 1.85;
        // BTTS doesn't map to the predictionType enum, let's map to OVER for now
        predictionType = 'OVER';
        predictedTeam = selectedPrediction;
      } else {
        console.error("No valid selection");
        return;
      }

      // Store bet details for saving to DB after confirmation
      setBetDetails({
        team: selectedPrediction,
        amount: predictionAmount,
        odds: selectedOdds,
        predictionType,
        predictedTeam
      });

      // BettingMatch takes the bet amount in the pool asset's atomic units.
      // Decimals come from the live pool — Spicy test USDC is 18-decimal, real
      // (Circle) USDC is 6-decimal, so we read it dynamically. predictionAmount
      // is in USD, so 1 USD ≈ 1 USDC for bet sizing purposes.
      // Caller must approve USDC for matchContract first.
      if (usdcDecimals === undefined) {
        console.error("USDC decimals not loaded yet");
        return;
      }
      const grossAmountUsdcRaw = parseUnits(predictionAmount, usdcDecimals);
      await placeBet(marketId, outcome, grossAmountUsdcRaw);
    } catch (err) {
      console.error("Error placing bet:", err);
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
    }
  };

  useEffect(() => {
    if (isConfirmed && hash && hasSavedForTxRef.current !== hash) {
      hasSavedForTxRef.current = hash;
      setShowConfetti(true);
      setShowConfirmationDialog(true);

      // Save prediction to DB with real Dynamic userId
      if (userId && betDetails && matchId && hash) {
        const username = (dynamicUser as DynamicUserExtended)?.alias || (dynamicUser as DynamicUserExtended)?.email || "Unknown";

        // Extract team names (handle both string and object formats)
        const teamAName = typeof TeamA === 'object' && TeamA !== null ? (TeamA as unknown as { name: string }).name : TeamA;
        const teamBName = typeof TeamB === 'object' && TeamB !== null ? (TeamB as unknown as { name: string }).name : TeamB;

        createPrediction({
          userId,
          walletAddress: user.toLowerCase(),
          username,
          matchId,
          matchName: `${teamAName} vs ${teamBName}`,
          predictionType: betDetails.predictionType,
          predictionValue: betDetails.amount,
          predictedTeam: betDetails.predictedTeam,
          odds: betDetails.odds,
          transactionHash: hash,
          matchStartTime,
        }).catch(err => {
          console.error("Error saving prediction to DB:", err);
        });
      }

      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [isConfirmed, hash, userId, matchId, betDetails, createPrediction, TeamA, TeamB, dynamicUser, matchStartTime, user]);

  const teamAData = getTeamData(TeamA);
  const teamBData = getTeamData(TeamB);
  const teamASymbol = teamAData?.symbol ?? TeamA;
  const teamBSymbol = teamBData?.symbol ?? TeamB;
  const teamAImage = teamAData?.image ?? "";
  const teamBImage = teamBData?.image ?? "";

  const winnerOdds = odds?.match_winner;
  const homeOdds = winnerOdds?.home ? formatDecimal(winnerOdds.home, 2) : "N/A";
  const drawOdds = winnerOdds?.draw ? formatDecimal(winnerOdds.draw, 2) : "N/A";
  const awayOdds = winnerOdds?.away ? formatDecimal(winnerOdds.away, 2) : "N/A";

  const overUnderOdds = odds?.over_under;
  const overOdds = overUnderOdds?.over_2_5 ? formatDecimal(overUnderOdds.over_2_5, 2) : "N/A";
  const underOdds = overUnderOdds?.under_2_5 ? formatDecimal(overUnderOdds.under_2_5, 2) : "N/A";

  const bttsOdds = odds?.both_teams_score;
  const bttsYesOdds = bttsOdds?.yes ? formatDecimal(bttsOdds.yes, 2) : "N/A";
  const bttsNoOdds = bttsOdds?.no ? formatDecimal(bttsOdds.no, 2) : "N/A";

  const fontSize = calculateAmountFontSize(predictionAmount);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <TrendingUp className="mr-2 h-5 w-5" />
            Place Your Prediction
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white border-gray-800 max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-0">
            <div className="px-6 py-4 bg-linear-to-r from-primary via-primary/90 to-purple-700 rounded-t-lg flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-white/80 shrink-0" />
              <DialogTitle className="text-lg font-bold text-white tracking-wide uppercase">
                Place Your Prediction
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6 px-6 py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 text-white text-lg font-bold">
                {teamAImage ? (
                  <Image src={teamAImage} alt={teamASymbol} width={36} height={36} className="rounded-full" />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {teamASymbol.charAt(0).toUpperCase()}
                  </span>
                )}
                <span>{teamASymbol}</span>
                <span className="text-gray-500 text-base font-normal mx-1">vs</span>
                {teamBImage ? (
                  <Image src={teamBImage} alt={teamBSymbol} width={36} height={36} className="rounded-full" />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-linear-to-br from-red-600 to-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {teamBSymbol.charAt(0).toUpperCase()}
                  </span>
                )}
                <span>{teamBSymbol}</span>
              </div>
              {hasFanTokens && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <span className="text-purple-400 text-xs font-medium">
                    Fan Token Holder: Special Markets Unlocked!
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">{MARKET_NAMES[Number(MARKET_IDS.MATCH_WINNER)]}</label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={selectedTeam === teamASymbol ? "default" : "outline"}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    selectedTeam === teamASymbol
                      ? "bg-primary border-primary"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedTeam(teamASymbol);
                    setSelectedOverUnder(null);
                    setSelectedBtts(null);
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {teamAImage ? (
                      <Image src={teamAImage} alt={teamASymbol} width={18} height={18} className="rounded-full shrink-0" />
                    ) : (
                      <span className="w-4.5 h-4.5 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                        {teamASymbol.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="font-semibold truncate">{teamASymbol}</span>
                  </div>
                  <span className="text-xs text-gray-400">Odds: {homeOdds}</span>
                </Button>

                <Button
                  type="button"
                  variant={selectedTeam === "Draw" ? "default" : "outline"}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    selectedTeam === "Draw"
                      ? "bg-primary border-primary"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedTeam("Draw");
                    setSelectedOverUnder(null);
                    setSelectedBtts(null);
                  }}
                >
                  <span className="font-semibold">Draw</span>
                  <span className="text-xs text-gray-400">Odds: {drawOdds}</span>
                </Button>

                <Button
                  type="button"
                  variant={selectedTeam === teamBSymbol ? "default" : "outline"}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    selectedTeam === teamBSymbol
                      ? "bg-primary border-primary"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedTeam(teamBSymbol);
                    setSelectedOverUnder(null);
                    setSelectedBtts(null);
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {teamBImage ? (
                      <Image src={teamBImage} alt={teamBSymbol} width={18} height={18} className="rounded-full shrink-0" />
                    ) : (
                      <span className="w-4.5 h-4.5 rounded-full bg-linear-to-br from-red-600 to-orange-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                        {teamBSymbol.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="font-semibold truncate">{teamBSymbol}</span>
                  </div>
                  <span className="text-xs text-gray-400">Odds: {awayOdds}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3 relative">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                {MARKET_NAMES[Number(MARKET_IDS.OVER_UNDER)]}
                <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Fan Token Exclusive</span>
              </label>
              {!hasFanTokens && (
                <p className="text-xs text-purple-400/70 italic">Hold fan tokens to unlock</p>
              )}
              <div className={`grid grid-cols-2 gap-3 transition-all ${!hasFanTokens ? "blur-[1.5px]" : ""}`}>
                <Button
                  type="button"
                  variant={selectedOverUnder === "over" ? "default" : "outline"}
                  disabled={!hasFanTokens}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    selectedOverUnder === "over"
                      ? "bg-primary border-primary"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  } ${!hasFanTokens ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (hasFanTokens) {
                      setSelectedOverUnder("over");
                      setSelectedTeam(null);
                      setSelectedBtts(null);
                    }
                  }}
                >
                  <span className="font-semibold">Over 2.5</span>
                  <span className="text-xs text-gray-400">Odds: {overOdds}</span>
                </Button>

                <Button
                  type="button"
                  variant={selectedOverUnder === "under" ? "default" : "outline"}
                  disabled={!hasFanTokens}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    selectedOverUnder === "under"
                      ? "bg-primary border-primary"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  } ${!hasFanTokens ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (hasFanTokens) {
                      setSelectedOverUnder("under");
                      setSelectedTeam(null);
                      setSelectedBtts(null);
                    }
                  }}
                >
                  <span className="font-semibold">Under 2.5</span>
                  <span className="text-xs text-gray-400">Odds: {underOdds}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3 relative">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                {MARKET_NAMES[Number(MARKET_IDS.BOTH_TEAMS_SCORE)]}
                <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Fan Token Exclusive</span>
              </label>
              {!hasFanTokens && (
                <p className="text-xs text-purple-400/70 italic">Hold fan tokens to unlock</p>
              )}
              <div className={`grid grid-cols-2 gap-3 transition-all ${!hasFanTokens ? "blur-[1.5px]" : ""}`}>
                <Button
                  type="button"
                  variant={selectedBtts === "yes" ? "default" : "outline"}
                  disabled={!hasFanTokens}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    selectedBtts === "yes"
                      ? "bg-primary border-primary"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  } ${!hasFanTokens ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (hasFanTokens) {
                      setSelectedBtts("yes");
                      setSelectedTeam(null);
                      setSelectedOverUnder(null);
                    }
                  }}
                >
                  <span className="font-semibold">Yes</span>
                  <span className="text-xs text-gray-400">Odds: {bttsYesOdds}</span>
                </Button>

                <Button
                  type="button"
                  variant={selectedBtts === "no" ? "default" : "outline"}
                  disabled={!hasFanTokens}
                  className={`flex flex-col items-center gap-2 p-4 h-auto ${
                    selectedBtts === "no"
                      ? "bg-primary border-primary"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  } ${!hasFanTokens ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (hasFanTokens) {
                      setSelectedBtts("no");
                      setSelectedTeam(null);
                      setSelectedOverUnder(null);
                    }
                  }}
                >
                  <span className="font-semibold">No</span>
                  <span className="text-xs text-gray-400">Odds: {bttsNoOdds}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Bet Amount (USDC)
                <span className="text-xs text-gray-500 ml-2">
                  Min: ${BETTING_LIMITS.MIN_BET}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={predictionAmount}
                  onChange={(e) => setpredictionAmount(e.target.value)}
                  placeholder="0.00"
                  min={BETTING_LIMITS.MIN_BET}
                  className="w-full p-6 text-center bg-gray-800 border border-gray-700 rounded-lg text-white font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ fontSize: `${fontSize}rem` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BET_PERCENTAGES.map((percent) => (
                  <Button
                    key={percent}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                    onClick={() => setpredictionAmount(formatDecimal(calculatePercentageAmount(maxAmount, percent), 2))}
                  >
                    {percent === 100 ? "MAX" : `${percent}%`}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-gray-400 text-center">
                Balance: {formatUSDValue(maxAmount)} USDC
              </p>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button
              onClick={handleprediction}
              disabled={!hasValidSelection || !predictionAmount.trim() || isPending || isConfirming}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white py-6 text-lg font-bold rounded-xl"
            >
              {isPending || isConfirming ? "Confirming..." : "Confirm Prediction"}
            </Button>
          </DialogFooter>

          {errorMessage && (
            <div className="mx-6 mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <DialogContent className="sm:max-w-[500px] bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-green-400">
              🎉 Prediction Placed Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-center text-gray-300">
              Your prediction has been placed and confirmed on the blockchain.
            </p>
            {hash && (
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Transaction Hash:</p>
                <p className="text-xs font-mono text-blue-400 break-all">{hash}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowConfirmationDialog(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
