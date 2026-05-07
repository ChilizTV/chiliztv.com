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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { ChevronDown, Send, Loader2, CheckCircle } from "lucide-react";
import { useStreamWallet } from "@/hooks/useStreamWallet";
import { useChilizSwapRouter } from "@/hooks/useChilizSwapRouter";
import { useKayenQuote } from "@/hooks/useKayenQuote";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { chilizConfig } from "@/config/chiliz.config";
import { NetworkGuard } from "@/components/web3/NetworkGuard";

interface StreamWalletButtonProps {
    /** The streamer's wallet address (recipient). */
    streamerAddress?: `0x${string}`;
    /** Whether the current user IS the streamer (hides donation form). */
    isStreamer?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type DonationToken =
    | { kind: "USDC" }
    | { kind: "CHZ" }
    | { kind: "ERC20"; address: Address; symbol: string; name: string };

const NATIVE_DECIMALS = 18;
const FAN_TOKEN_DECIMALS = 18;
const DEADLINE_MIN = 20; // minutes
const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%

function tokenDecimals(t: DonationToken, usdcDecimals: number | undefined): number | undefined {
    if (t.kind === "USDC") return usdcDecimals;
    if (t.kind === "CHZ") return NATIVE_DECIMALS;
    return FAN_TOKEN_DECIMALS;
}

function tokenLabel(t: DonationToken): string {
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
 * Donation dialog routed entirely through `ChilizSwapRouter`. Supports CHZ
 * native, USDC direct, and fan-token paths with FanX/Kayen quoting.
 *
 * Mirrors `MarketBetDialog`'s flow: token picker → amount → quote → optional
 * approval → swap & donate.
 */
export default function StreamWalletButton({
    streamerAddress,
    isStreamer = false,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: StreamWalletButtonProps) {
    const {
        streamWalletAddress,
        statistics,
    } = useStreamWallet({ streamerAddress });

    const { donate, donateState, routerAddress } = useChilizSwapRouter();
    const { assetDecimals: usdcDecimals } = usePoolDecimals();
    const { primaryWallet } = useDynamicContext();
    const userAddress = primaryWallet?.address as Address | undefined;

    const [donationMessage, setDonationMessage] = useState("");
    const [amount, setAmount] = useState("");
    const [token, setToken] = useState<DonationToken>({ kind: "USDC" });
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

    // ── Token-specific balance + allowance ─────────────────────────────────
    const erc20Address: Address | undefined = useMemo(() => {
        if (token.kind === "USDC") return chilizConfig.usdc;
        if (token.kind === "ERC20") return token.address;
        return undefined; // CHZ has no ERC20 address
    }, [token]);

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

    const fanTokens = (chilizConfig.tokens || []).filter((t) => !!t.tokenAddress);
    const tokenOptions: DonationToken[] = [
        { kind: "USDC" },
        { kind: "CHZ" },
        ...fanTokens.map((t) => ({
            kind: "ERC20" as const,
            address: t.tokenAddress as Address,
            symbol: t.symbol,
            name: t.name,
        })),
    ];

    // ── Approval flow (ERC20 paths only) ────────────────────────────────────
    const {
        writeContract: writeApprove,
        data: approveTxHash,
        isPending: isApprovePending,
        error: approveError,
    } = useWriteContract();
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
        useWaitForTransactionReceipt({ hash: approveTxHash });

    // The dialog asks the user to approve once per token at maxUint256, then
    // the donate path consumes from the allowance. Re-approve flips needed if
    // the user revokes externally.
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

    useEffect(() => {
        if (isApproveSuccess) refetchAllowance();
    }, [isApproveSuccess, refetchAllowance]);

    useEffect(() => {
        if (donateState.error) {
            setErrorMessage(donateState.error.message ?? "Donation failed");
        } else if (approveError) {
            setErrorMessage(approveError.message ?? "Approval failed");
        } else {
            setErrorMessage(null);
        }
    }, [donateState.error, approveError]);

    useEffect(() => {
        if (donateState.isSuccess) {
            setIsOpen(false);
            setAmount("");
            setDonationMessage("");
            setErrorMessage(null);
        }
    }, [donateState.isSuccess, setIsOpen]);

    if (!streamerAddress) return null;

    const isLoading =
        donateState.isPending ||
        donateState.isConfirming ||
        isApprovePending ||
        isApproveConfirming;

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
        donate({
            token:
                token.kind === "USDC"
                    ? "USDC"
                    : token.kind === "CHZ"
                      ? "CHZ"
                      : token.address,
            streamer: streamerAddress,
            message: donationMessage,
            amount: parsedAmount,
            amountOutMin,
            deadline,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {controlledOpen === undefined && (
                <DialogTrigger asChild>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Send className="mr-2 h-4 w-4" />
                        {isStreamer ? "Donation Stats" : "Send Donation"}
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {isStreamer ? "Donation Statistics" : "Support This Streamer"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {isStreamer
                            ? "View your donation revenue and statistics"
                            : "Send a one-time donation in CHZ, USDC, or any fan token"}
                    </DialogDescription>
                </DialogHeader>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">Donation Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Revenue:</span>
                            <span className="font-mono text-green-400">
                                {streamWalletAddress ? statistics.totalRevenue : "0"} USDC
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Withdrawn:</span>
                            <span className="font-mono text-blue-400">
                                {streamWalletAddress ? statistics.totalWithdrawn : "0"} USDC
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Available Balance:</span>
                            <span className="font-mono text-yellow-400 font-bold">
                                {streamWalletAddress ? statistics.availableBalance : "0"} USDC
                            </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                            <span className="text-gray-400">Platform Fee:</span>
                            <span className="text-gray-300">
                                {streamWalletAddress ? `${statistics.platformFeeBps}%` : "5%"}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Donations:</span>
                            <span className="text-purple-400">
                                {streamWalletAddress ? statistics.totalDonations : "0"}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {!isStreamer && (
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
                                                setAmount("");
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
                            <Label htmlFor="donationAmount" className="text-gray-300">
                                Amount ({tokenLabel(token)})
                            </Label>
                            <Input
                                id="donationAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white mt-1"
                                placeholder="0.00"
                            />
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

                        {/* Message */}
                        <div>
                            <Label htmlFor="donationMessage" className="text-gray-300">
                                Message (optional)
                            </Label>
                            <Input
                                id="donationMessage"
                                type="text"
                                value={donationMessage}
                                onChange={(e) => setDonationMessage(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white mt-1"
                                placeholder="Leave a message…"
                                maxLength={200}
                            />
                        </div>

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
                                swapPathMissing
                            }
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {isApprovePending
                                ? "Confirm approval…"
                                : isApproveConfirming
                                  ? `Approving ${tokenLabel(token)}…`
                                  : donateState.isPending
                                    ? "Confirm in wallet…"
                                    : donateState.isConfirming
                                      ? "Sending donation…"
                                      : donateState.isSuccess
                                        ? (
                                              <>
                                                  <CheckCircle className="mr-2 h-4 w-4" />
                                                  Donated!
                                              </>
                                          )
                                        : needsApproval
                                          ? `Approve ${tokenLabel(token)}`
                                          : (
                                                <>
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send Donation
                                                </>
                                            )}
                        </Button>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500">
                        {streamWalletAddress ? (
                            <>
                                Wallet: {streamWalletAddress.slice(0, 6)}…{streamWalletAddress.slice(-4)}
                            </>
                        ) : (
                            <>Wallet will be created automatically on first donation</>
                        )}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
