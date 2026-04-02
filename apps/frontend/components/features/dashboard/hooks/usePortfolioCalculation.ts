import { useState, useEffect, useRef } from "react";
import { fetchTokenPrices, fetchCHZPrice, TokenPriceData } from "@/services";
import {
  mapTokenBalancesToDisplay,
  calculateFanTokensValue,
  calculateTotalPortfolioValue,
  TokenDisplay,
} from "../utils/portfolio.utils";

/**
 * @notice Custom hook for portfolio value calculation and token price management
 * @dev Fetches token prices and CHZ price, calculates portfolio value automatically
 * @param tokenBalances Array of user's token balances with symbol and balance
 * @param chzBalanceFormatted Formatted CHZ balance string from wagmi useBalance hook
 * @param walletAddress User's wallet address
 * @return Portfolio calculation state including prices, tokens, and total value
 */
export function usePortfolioCalculation(
  tokenBalances: Array<{ symbol: string; balance: number }>,
  chzBalanceFormatted: string | undefined,
  walletAddress: string | undefined
) {
  const [tokenPrices, setTokenPrices] = useState<{ [symbol: string]: TokenPriceData }>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(false);
  const [chzPrice, setChzPrice] = useState<number>(0);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [realFanTokens, setRealFanTokens] = useState<TokenDisplay[]>([]);
  const lastSymbolsKeyRef = useRef<string>("");

  /**
   * @notice Fetch token prices when token balances change
   * @dev Uses symbol key to prevent duplicate fetches, refreshes every 10 minutes
   */
  useEffect(() => {
    if (tokenBalances.length === 0) {
      setTokenPrices({});
      lastSymbolsKeyRef.current = "";
      return;
    }

    const symbolsKey = tokenBalances.map((tb) => tb.symbol).sort().join(",");

    if (symbolsKey === lastSymbolsKeyRef.current) {
      return;
    }

    lastSymbolsKeyRef.current = symbolsKey;

    const loadTokenPrices = async () => {
      setIsLoadingPrices(true);
      try {
        const symbols = tokenBalances.map((tb) => tb.symbol);
        const prices = await fetchTokenPrices(symbols);
        setTokenPrices(prices);
      } catch (error) {
        console.error("❌ Error loading token prices:", error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    loadTokenPrices();

    const intervalId = setInterval(() => {
      loadTokenPrices();
    }, 600000);

    return () => clearInterval(intervalId);
  }, [tokenBalances]);

  /**
   * @notice Fetch CHZ price when wallet connects
   * @dev Refreshes CHZ price every 10 minutes
   */
  useEffect(() => {
    const loadCHZPrice = async () => {
      try {
        const price = await fetchCHZPrice();
        setChzPrice(price);
      } catch (error) {
        console.error("❌ Error loading CHZ price:", error);
      }
    };

    if (walletAddress) {
      loadCHZPrice();
      const intervalId = setInterval(loadCHZPrice, 600000);
      return () => clearInterval(intervalId);
    }
  }, [walletAddress]);

  /**
   * @notice Map token balances to display format with price data
   * @dev Combines balance data with token metadata and current prices
   */
  useEffect(() => {
    const tokens = mapTokenBalancesToDisplay(tokenBalances, tokenPrices);
    setRealFanTokens(tokens);
  }, [tokenBalances, tokenPrices]);

  /**
   * @notice Calculate total portfolio value
   * @dev Includes fan tokens value + CHZ balance value
   */
  useEffect(() => {
    const fanTokensValue = calculateFanTokensValue(realFanTokens);
    const totalValue = calculateTotalPortfolioValue(fanTokensValue, chzBalanceFormatted, chzPrice);
    setPortfolioValue(totalValue);
  }, [realFanTokens, chzBalanceFormatted, chzPrice]);

  return {
    tokenPrices,
    isLoadingPrices,
    chzPrice,
    portfolioValue,
    realFanTokens,
    fanTokensValue: calculateFanTokensValue(realFanTokens),
  };
}
