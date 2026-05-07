"use client";

import { useEffect, useMemo, useState } from "react";
import { erc20Abi, formatUnits, maxUint256, parseUnits, type Address } from "viem";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { ChevronDown, Users, Loader2, CheckCircle, Calendar } from "lucide-react";
import { useStreamWallet } from "@/hooks/useStreamWallet";
import { useChilizSwapRouter } from "@/hooks/useChilizSwapRouter";
import { useKayenQuote } from "@/hooks/useKayenQuote";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { chilizConfig } from "@/config/chiliz.config";
import { NetworkGuard } from "@/components/web3/NetworkGuard";

interface StreamSubscriptionButtonProps {
    streamerAddress?: `0x${string}`;
    isStreamer?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type SubscriptionToken =
    | { kind: "USDC" }
    | { kind: "CHZ" }
    | { kind: "ERC20"; address: Address; symbol: string; name: string };

const NATIVE_DECIMALS = 18;
const FAN_TOKEN_DECIMALS = 18;
const DEADLINE_MIN = 20;
const DEFAULT_SLIPPAGE_BPS = 50;

function tokenDecimals(t: SubscriptionToken, usdcDecimals: number | undefined): number | undefined {
    if (t.kind === "USDC") return usdcDecimals;
    if (t.kind === "CHZ") return NATIVE_DECIMALS;
    return FAN_TOKEN_DECIMALS;
}

function tokenLabel(t: SubscriptionToken): string {
    if (t.kind === "USDC") return "USDC";
    if (t.kind === "CHZ") return "CHZ";
    return t.symbol;
}

function formatAtomic(value: bigint | undefined, decimals: number | undefined, fractionDigits = 2): string {
    if (value === undefined || decimals === undefined) return "—";
    const n = Number(formatUnits(value, decimals));
    return n.toLocaleString("en-US", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

/**
 * Subscription dialog routed entirely through `ChilizSwapRouter`. Supports
 * CHZ native, USDC direct, and fan-token paths; all settle in USDC inside
 * the streamer's wallet.
 */
export default function StreamSubscriptionButton({
    streamerAddress,
    isStreamer = false,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: StreamSubscriptionButtonProps) {
    const {
        streamWalletAddress,
        statistics,
        subscription,
    } = useStreamWallet({ streamerAddress });

    const { subscribe, subscribeState, routerAddress } = useChilizSwapRouter();
    const { assetDecimals: usdcDecimals } = usePoolDecimals();
    const { primaryWallet } = useDynamicContext();
    const userAddress = primaryWallet?.address as Address | undefined;

    const [amount, setAmount] = useState("10");
    const [months, setMonths] = useState<string>("1"); // "1"-"12" or "unlimited"
    const [token, setToken] = useState<SubscriptionToken>({ kind: "USDC" });
    const [showTokenList, setShowTokenList] = useState(false);
    const [slippageBps, setSlippageBps] = useState<number>(DEFAULT_SLIPPAGE_BPS);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [internalOpen, setInternalOpen] = useState(false);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

    const decimals = tokenDecimals(token, usdcDecimals);
    const parsedAmount: bigint = useMemo(() => {
        if (!amount || decimals === undefined) return BigInt(0);
        try {
            return parseUnits(amount, decimals);
        } catch {
            return BigInt(0);
        }
    }, [amount, decimals]);

    const durationSeconds: bigint = useMemo(() => {
        if (months === "unlimited") return BigInt(36500) * BigInt(24 * 60 * 60); // ~100y
        const m = parseInt(months, 10);
        if (Number.isNaN(m) || m <= 0) return BigInt(0);
        return BigInt(m) * BigInt(30) * BigInt(24 * 60 * 60);
    }, [months]);

    // ── Token-specific allowance ───────────────────────────────────────────
    const erc20Address: Address | undefined = useMemo(() => {
        if (token.kind === "USDC") return chilizConfig.usdc;
        if (token.kind === "ERC20") return token.address;
        return undefined;
    }, [token]);

    const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
        abi: erc20Abi,
        address: erc20Address,
        functionName: "allowance",
        args: userAddress && erc20Address ? [userAddress, routerAddress] : undefined,
        chainId: chilizConfig.chainId,
        query: { enabled: !!erc20Address && !!userAddress },
    });
    const allowance = (allowanceData as bigint | undefined) ?? BigInt(0);
    const needsApproval = token.kind !== "CHZ" && parsedAmount > BigInt(0) && allowance < parsedAmount;

    // ── FanX/Kayen quote for non-USDC paths ────────────────────────────────
    const quoteTokenIn: Address | undefined =
        token.kind === "ERC20" ? token.address : token.kind === "CHZ" ? chilizConfig.wchz : undefined;
    const { amountOut: quotedUsdcOut, error: quoteError, isLoading: quoteLoading } =
        useKayenQuote(parsedAmount > BigInt(0) ? parsedAmount : undefined, quoteTokenIn);

    const swapPathMissing =
        token.kind !== "USDC" &&
        parsedAmount > BigInt(0) &&
        !quoteLoading &&
        quoteError !== null;

    const amountOutMin: bigint = useMemo(() => {
        if (token.kind === "USDC" || quotedUsdcOut === undefined) return BigInt(0);
        const slippageMul = BigInt(10_000 - slippageBps);
        return (quotedUsdcOut * slippageMul) / BigInt(10_000);
    }, [token.kind, quotedUsdcOut, slippageBps]);

    // ── Approval flow ──────────────────────────────────────────────────────
    const {
        writeContract: writeApprove,
        data: approveTxHash,
        isPending: isApprovePending,
        error: approveError,
    } = useWriteContract();
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
        useWaitForTransactionReceipt({ hash: approveTxHash });

    useEffect(() => {
        if (isApproveSuccess) refetchAllowance();
    }, [isApproveSuccess, refetchAllowance]);

    useEffect(() => {
        if (subscribeState.error) {
            setErrorMessage(subscribeState.error.message ?? "Subscription failed");
        } else if (approveError) {
            setErrorMessage(approveError.message ?? "Approval failed");
        } else {
            setErrorMessage(null);
        }
    }, [subscribeState.error, approveError]);

    useEffect(() => {
        if (subscribeState.isSuccess) {
            setIsOpen(false);
            setErrorMessage(null);
        }
    }, [subscribeState.isSuccess, setIsOpen]);

    const isActiveSubscription = subscription?.isSubscribed || false;

    if (!streamerAddress) return null;

    const isLoading =
        subscribeState.isPending ||
        subscribeState.isConfirming ||
        isApprovePending ||
        isApproveConfirming;

    const fanTokens = (chilizConfig.tokens || []).filter((t) => !!t.tokenAddress);
    const tokenOptions: SubscriptionToken[] = [
        { kind: "USDC" },
        { kind: "CHZ" },
        ...fanTokens.map((t) => ({
            kind: "ERC20" as const,
            address: t.tokenAddress as Address,
            symbol: t.symbol,
            name: t.name,
        })),
    ];

    const handleSubmit = () => {
        if (!streamerAddress) return;
        setErrorMessage(null);

        if (needsApproval && erc20Address) {
            writeApprove({
                abi: erc20Abi,
                address: erc20Address,
                functionName: "approve",
                args: [routerAddress, maxUint256],
            });
            return;
        }

        const deadline = BigInt(Math.floor(Date.now() / 1000) + DEADLINE_MIN * 60);
        subscribe({
            token:
                token.kind === "USDC"
                    ? "USDC"
                    : token.kind === "CHZ"
                      ? "CHZ"
                      : token.address,
            streamer: streamerAddress,
            duration: durationSeconds,
            amount: parsedAmount,
            amountOutMin,
            deadline,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {controlledOpen === undefined && (
                <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Users className="mr-2 h-4 w-4" />
                        {isStreamer ? "Subscriber Stats" : isActiveSubscription ? "Manage Subscription" : "Subscribe"}
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {isStreamer ? "Subscription Statistics" : "Subscribe to Streamer"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {isStreamer
                            ? "View your subscriber base and recurring revenue"
                            : isActiveSubscription
                              ? "Manage your active subscription"
                              : "Subscribe in CHZ, USDC, or any fan token — settles in USDC"}
                    </DialogDescription>
                </DialogHeader>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            {isStreamer ? "Subscription Statistics" : "Your Subscription"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isStreamer ? (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Subscribers:</span>
                                <span className="font-mono text-purple-400 font-bold">
                                    {streamWalletAddress ? statistics.totalSubscribers : "0"}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Status:</span>
                                    <span
                                        className={`font-semibold ${
                                            isActiveSubscription ? "text-green-400" : "text-gray-500"
                                        }`}
                                    >
                                        {isActiveSubscription ? "✓ Active" : "Inactive"}
                                    </span>
                                </div>
                                {subscription && subscription.amount && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Amount:</span>
                                        <span className="font-mono text-purple-400">
                                            {subscription.amount} USDC
                                        </span>
                                    </div>
                                )}
                                {subscription && subscription.expiryTime && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Expires:</span>
                                        <span className="font-mono text-yellow-400">{subscription.expiryTime}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                                    <span className="text-gray-400">Community:</span>
                                    <span className="text-purple-400">
                                        {streamWalletAddress ? statistics.totalSubscribers : "0"} subscribers
                                    </span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {!isStreamer && !isActiveSubscription && (
                    <div className="space-y-3 mt-4">
                        <NetworkGuard />

                        {/* Token picker */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowTokenList((v) => !v)}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded text-sm bg-gray-800 border border-gray-700 text-gray-200"
                            >
                                <span className="uppercase text-xs text-gray-500">Pay with</span>
                                <span className="flex items-center gap-1.5 font-bold text-white">
                                    {tokenLabel(token)} <ChevronDown size={12} />
                                </span>
                            </button>
                            {showTokenList && (
                                <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded bg-gray-900 border border-gray-700">
                                    {tokenOptions.map((t, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setToken(t);
                                                setShowTokenList(false);
                                                setAmount("10");
                                            }}
                                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
                                        >
                                            <span className="font-bold uppercase">{tokenLabel(t)}</span>
                                            {t.kind === "ERC20" && (
                                                <span className="text-xs text-gray-500">{t.name}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <Label htmlFor="subscriptionAmount" className="text-gray-300">
                                Amount ({tokenLabel(token)})
                            </Label>
                            <Input
                                id="subscriptionAmount"
                                type="number"
                                step="1"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white mt-1"
                                placeholder="10"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Suggested: 10–50 USDC equivalent per month
                            </p>
                        </div>

                        {/* Duration */}
                        <div>
                            <Label htmlFor="subscriptionMonths" className="text-gray-300">
                                Duration
                            </Label>
                            <Select value={months} onValueChange={setMonths}>
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <SelectItem key={m} value={String(m)}>
                                            {m} month{m > 1 ? "s" : ""}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="unlimited">No end (unlimited)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* FanX quote */}
                        {token.kind !== "USDC" && parsedAmount > BigInt(0) && (
                            <div className="rounded p-3 bg-gray-800/60 border border-gray-700 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="uppercase text-gray-500">FanX quote</span>
                                    <span className="font-mono text-white">
                                        {quotedUsdcOut !== undefined
                                            ? `${formatAtomic(quotedUsdcOut, usdcDecimals)} USDC`
                                            : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="uppercase text-gray-500">Min received</span>
                                    <span className="font-mono text-gray-400">
                                        {amountOutMin > BigInt(0)
                                            ? `${formatAtomic(amountOutMin, usdcDecimals)} USDC`
                                            : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="uppercase text-gray-500">Slippage</span>
                                    {[10, 50, 100].map((bps) => (
                                        <button
                                            key={bps}
                                            type="button"
                                            onClick={() => setSlippageBps(bps)}
                                            className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                                slippageBps === bps
                                                    ? "bg-purple-500/20 text-purple-300 border-purple-500"
                                                    : "bg-gray-900 text-gray-400 border-gray-700"
                                            }`}
                                        >
                                            {(bps / 100).toFixed(2)}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {swapPathMissing && (
                            <div className="px-3 py-2 rounded text-xs bg-red-500/10 border border-red-500/30 text-red-300">
                                No FanX/Kayen liquidity for {tokenLabel(token)} → USDC. Pick another token.
                            </div>
                        )}

                        {errorMessage && (
                            <div className="px-3 py-2 rounded text-xs bg-red-500/10 border border-red-500/30 text-red-300">
                                {errorMessage}
                            </div>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={
                                isLoading ||
                                parsedAmount === BigInt(0) ||
                                durationSeconds === BigInt(0) ||
                                swapPathMissing
                            }
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                            {isApprovePending
                                ? "Confirm approval…"
                                : isApproveConfirming
                                  ? `Approving ${tokenLabel(token)}…`
                                  : subscribeState.isPending
                                    ? "Confirm in wallet…"
                                    : subscribeState.isConfirming
                                      ? "Subscribing…"
                                      : subscribeState.isSuccess
                                        ? (
                                              <>
                                                  <CheckCircle className="mr-2 h-4 w-4" />
                                                  Subscribed!
                                              </>
                                          )
                                        : needsApproval
                                          ? `Approve ${tokenLabel(token)}`
                                          : (
                                                <>
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    Subscribe Now
                                                </>
                                            )}
                        </Button>

                        <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/20">
                            <p className="text-xs font-semibold text-purple-400 mb-2">Subscriber Benefits:</p>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>✓ Exclusive subscriber badge</li>
                                <li>✓ Priority chat messages</li>
                                <li>✓ Access to subscriber-only content</li>
                                <li>✓ Support your favorite streamer</li>
                            </ul>
                        </div>
                    </div>
                )}

                {!isStreamer && isActiveSubscription && (
                    <div className="mt-4">
                        <div className="bg-gradient-to-r from-green-900/30 to-emerald-800/30 rounded-lg p-4 border border-green-500/30">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <p className="text-sm font-semibold text-green-400">You&apos;re Subscribed!</p>
                            </div>
                            <p className="text-xs text-gray-400">
                                Thank you for supporting this creator. Your subscription is active until{" "}
                                {subscription?.expiryTime}.
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500">
                        {streamWalletAddress ? (
                            <>
                                Wallet: {streamWalletAddress.slice(0, 6)}…{streamWalletAddress.slice(-4)}
                            </>
                        ) : (
                            <>Wallet will be created automatically on first subscription</>
                        )}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
