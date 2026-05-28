/**
 * Decode a thrown error from a wagmi/viem write or read call into a UX-ready
 * message. Three layers, in order of priority:
 *
 *   1. User rejection (wallet popup closed) → soft "info" — not really a failure.
 *   2. Custom contract revert (BettingMatch / LiquidityPool / ChilizSwapRouter
 *      / StreamWallet) → human message keyed off `errorName`. Some carry
 *      decoded args we surface inline ("until 23m 04s", "@ 0.04% cap"…).
 *   3. Anything else (RPC down, gas, allowance, native viem error) → fallback
 *      to viem's own `shortMessage` if present, else a generic line.
 */

import {
    BaseError,
    ContractFunctionRevertedError,
    UserRejectedRequestError,
    InsufficientFundsError,
    formatUnits,
} from 'viem';

export type DecodedErrorSeverity = 'error' | 'warning' | 'info';

export interface DecodedError {
    /** Short, sentence-case headline for the toast/banner. */
    readonly title: string;
    /** Optional second line. May be omitted for compact toasts. */
    readonly description?: string;
    readonly severity: DecodedErrorSeverity;
    /** Verbatim error name from the contract revert, if any. Useful for tests. */
    readonly errorName?: string;
}

const USDC_DECIMALS = 6;
const PCT_PRECISION = 100;

function fmtUsdc(raw: unknown): string {
    if (typeof raw !== 'bigint') return String(raw);
    const human = Number(formatUnits(raw, USDC_DECIMALS));
    return `${human.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

function fmtBps(raw: unknown): string {
    const n = Number(raw);
    if (!Number.isFinite(n)) return String(raw);
    return `${(n / PCT_PRECISION).toFixed(2)}%`;
}

function fmtUnixUntil(raw: unknown): string {
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return String(raw);
    const remaining = Math.max(0, ts - Math.floor(Date.now() / 1000));
    if (remaining === 0) return 'now';
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
    return `${s}s`;
}

/**
 * Per-error-name resolver. Each entry returns the title + optional description.
 * The args order matches the Solidity custom-error signature so the indices
 * are not coincidental — keep them in sync if a contract is upgraded.
 */
const CUSTOM_ERROR_HANDLERS: Record<
    string,
    (args: ReadonlyArray<unknown>) => Pick<DecodedError, 'title' | 'description' | 'severity'>
> = {
    // ── BettingMatch ────────────────────────────────────────────────────────
    InvalidMarketId: () => ({ title: 'Market not found', severity: 'error' }),
    InvalidMarketState: () => ({
        title: 'Market is not open for predictions',
        description: 'Closed, suspended, or already resolved.',
        severity: 'warning',
    }),
    InvalidOddsValue: () => ({
        title: 'Odds out of range',
        description: 'The contract rejected the odds — they must sit between the configured min and max.',
        severity: 'error',
    }),
    OddsNotSet: () => ({
        title: 'Odds not set yet',
        description: 'The market is open but no odds have been registered. Try again in a moment.',
        severity: 'warning',
    }),
    ZeroBetAmount: () => ({ title: 'Stake cannot be zero', severity: 'error' }),
    StakeBelowMinimum: (args) => ({
        title: 'Stake below minimum',
        description: args[1] !== undefined ? `Minimum on this pool is ${fmtUsdc(args[1])}.` : 'Minimum stake not met.',
        severity: 'warning',
    }),
    ZeroNetExposure: () => ({
        title: 'Stake too small for these odds',
        description: 'At the current odds, your stake rounds to zero potential profit. Increase the amount.',
        severity: 'warning',
    }),
    BetNotFound: () => ({
        title: 'Prediction not found',
        description: 'The pool has no record of this prediction — it may already have been claimed or refunded.',
        severity: 'error',
    }),
    AlreadyClaimed: () => ({
        title: 'Already claimed',
        description: 'This prediction has been settled. Refresh the page to update the list.',
        severity: 'info',
    }),
    BetLost: () => ({
        title: 'No payout — prediction lost',
        description: 'This selection lost when the market resolved.',
        severity: 'info',
    }),
    USDCNotConfigured: () => ({
        title: 'Match misconfigured',
        description: 'The USDC token is not yet wired on this match contract. Ops needs to call setUSDCToken.',
        severity: 'error',
    }),
    LiquidityPoolNotConfigured: () => ({
        title: 'Match misconfigured',
        description: 'The liquidity pool is not wired on this match. Ops needs to call setLiquidityPool.',
        severity: 'error',
    }),
    AccessControlUnauthorizedAccount: () => ({
        title: 'Not authorized',
        description: 'This action requires a role you don\'t hold on the contract.',
        severity: 'error',
    }),

    // ── LiquidityPool ───────────────────────────────────────────────────────
    CooldownActive: (args) => ({
        title: 'Withdrawals locked',
        description: args[1] !== undefined
            ? `Cooldown unlocks in ${fmtUnixUntil(args[1])}.`
            : 'Cooldown is still running on your last deposit.',
        severity: 'warning',
    }),
    InsufficientFreeBalance: (args) => ({
        title: 'Pool liquidity too low',
        description: args[0] !== undefined && args[1] !== undefined
            ? `Requested ${fmtUsdc(args[0])} but only ${fmtUsdc(args[1])} is currently free.`
            : 'The pool can\'t back this withdrawal right now — try a smaller amount.',
        severity: 'warning',
    }),
    BetAmountAboveCap: (args) => ({
        title: 'Stake above per-prediction cap',
        description: args[0] !== undefined && args[1] !== undefined
            ? `Stake ${fmtUsdc(args[0])} exceeds the cap ${fmtUsdc(args[1])}.`
            : 'The pool has a per-prediction cap that this stake exceeds.',
        severity: 'warning',
    }),
    MarketLiabilityCapExceeded: (args) => ({
        title: 'Market liability cap reached',
        description: args[1] !== undefined
            ? `This market is already backing ${fmtUsdc(args[1])} of liability — no more predictions accepted.`
            : 'This market has reached its liability ceiling.',
        severity: 'warning',
    }),
    MatchLiabilityCapExceeded: (args) => ({
        title: 'Match liability cap reached',
        description: args[1] !== undefined
            ? `This match is already backing ${fmtUsdc(args[1])} of liability across markets.`
            : 'This match has reached its liability ceiling.',
        severity: 'warning',
    }),
    MatchNotAuthorized: () => ({
        title: 'Match not authorized by the pool',
        description: 'The match contract is not (yet) registered with the liquidity pool.',
        severity: 'error',
    }),
    NotTreasury: () => ({
        title: 'Treasury action only',
        description: 'This call is reserved for the treasury account.',
        severity: 'error',
    }),
    InsufficientTreasuryBalance: () => ({
        title: 'Treasury balance too low',
        description: 'The treasury can\'t cover the requested amount.',
        severity: 'error',
    }),

    // ── ChilizSwapRouter ────────────────────────────────────────────────────
    DeadlinePassed: () => ({
        title: 'Quote expired',
        description: 'The price quote timed out before your tx made it on-chain. Re-submit.',
        severity: 'warning',
    }),
    UnauthorizedBettingMatch: () => ({
        title: 'Match not registered with the router',
        description: 'The router refuses to forward USDC to this match address.',
        severity: 'error',
    }),
    BettingMatchFactoryNotSet: () => ({
        title: 'Router misconfigured',
        description: 'Ops needs to call setMatchFactory on the swap router.',
        severity: 'error',
    }),
    RouterNotConfiguredOnFactory: () => ({
        title: 'Streaming factory misconfigured',
        description: 'Ops needs to call setSwapRouter on the streaming factory.',
        severity: 'error',
    }),
    LiquidityPoolNotSet: () => ({
        title: 'Router misconfigured',
        description: 'Ops needs to call setLiquidityPool on the swap router.',
        severity: 'error',
    }),
    PoolAssetMismatch: () => ({
        title: 'Pool/USDC mismatch',
        description: 'The pool\'s asset doesn\'t match the configured USDC. Ops alert.',
        severity: 'error',
    }),
    TokenIsUSDC: () => ({
        title: 'Wrong token path',
        description: 'Use the USDC entrypoint instead of the swap path for plain USDC deposits.',
        severity: 'warning',
    }),

    // ── StreamWallet / Factory ──────────────────────────────────────────────
    OnlyStreamer: () => ({
        title: 'Streamer-only action',
        description: 'Only the wallet attached to this stream can withdraw revenue.',
        severity: 'error',
    }),
    OnlyAuthorized: () => ({
        title: 'Not authorized',
        description: 'Only the streaming factory or the swap router can record this action.',
        severity: 'error',
    }),
    InsufficientBalance: () => ({
        title: 'Insufficient stream wallet balance',
        description: 'The streamer wallet doesn\'t hold enough USDC for this withdrawal.',
        severity: 'warning',
    }),
    SwapSlippageExceeded: () => ({
        title: 'Swap slippage exceeded',
        description: 'The swap returned less USDC than your slippage tolerance allows. Increase the tolerance or try again.',
        severity: 'warning',
    }),
    WalletAlreadyExists: () => ({
        title: 'Stream wallet already exists',
        description: 'A wallet has already been deployed for this streamer.',
        severity: 'info',
    }),

    // ── Generic shapes shared by several contracts ──────────────────────────
    ZeroAddress: () => ({ title: 'Zero address rejected', severity: 'error' }),
    ZeroAmount: () => ({ title: 'Amount cannot be zero', severity: 'error' }),
    ZeroValue: () => ({ title: 'Value cannot be zero', severity: 'error' }),
    InvalidAmount: () => ({ title: 'Invalid amount', severity: 'error' }),
    InvalidAddress: () => ({ title: 'Invalid address', severity: 'error' }),
    InvalidDuration: () => ({ title: 'Invalid duration', severity: 'error' }),
    InvalidFeeBps: (args) => ({
        title: 'Fee out of range',
        description: args[0] !== undefined ? `Provided ${fmtBps(args[0])} but the cap is 100%.` : undefined,
        severity: 'error',
    }),
    BpsOutOfRange: (args) => ({
        title: 'Bps value out of range',
        description: args[0] !== undefined && args[1] !== undefined
            ? `Provided ${fmtBps(args[0])}, capped at ${fmtBps(args[1])}.`
            : undefined,
        severity: 'error',
    }),
    Unauthorized: () => ({ title: 'Not authorized', severity: 'error' }),
};

/**
 * Cross-contract custom-error selectors (4-byte sigs) → error name.
 *
 * viem's `ContractFunctionRevertedError.data?.errorName` is only populated
 * when the *calling* contract's ABI declares the error. ChilizSwapRouter's
 * `placeBetWithUSDC` calls into BettingMatch / LiquidityPool — when those
 * revert, viem only gets the raw 4-byte selector. This map lets us still
 * surface a friendly message via the existing `CUSTOM_ERROR_HANDLERS`.
 *
 * Selectors computed from `keccak256("ErrorName(arg1Type,arg2Type,...)")`
 * — keep in sync with `apps/smart-contracts/chiliz-tv/src/**`.
 */
const ERROR_SELECTOR_TO_NAME: Readonly<Record<string, string>> = {
    '0x05e0be88': 'OddsNotSet',
    '0x4d22c051': 'MatchNotAuthorized',
    '0x4f8c629e': 'InvalidMarketState',
    '0x4aeb0dcb': 'InsufficientFreeBalance',
    '0x8dc8eaa0': 'BetAmountAboveCap',
    '0xeca7125f': 'MarketLiabilityCapExceeded',
    '0x8c871308': 'MatchLiabilityCapExceeded',
    '0x78e030db': 'StakeBelowMinimum',
    '0x0813eb43': 'ZeroBetAmount',
    '0x340914fe': 'ZeroNetExposure',
    '0x82a2dff3': 'InvalidSelection',
    '0x7231c807': 'InvalidOddsValue',
    '0x9554dd11': 'USDCNotConfigured',
    '0xb8b5ff15': 'LiquidityPoolNotConfigured',
    '0xfd5af2a0': 'CooldownActive',
    '0x2f5a76ec': 'BettingMatchFactoryNotSet',
    '0x2a1eb67c': 'UnauthorizedBettingMatch',
    '0xfae7cf6b': 'PoolAssetMismatch',
    '0x70f65caa': 'DeadlinePassed',
    '0x0d6368f7': 'SwapSlippageExceeded',
    '0x3cab8add': 'TokenIsUSDC',
    '0xf4d678b8': 'InsufficientBalance',
    '0x118a5a82': 'AlreadyClaimed',
    '0x8bf5a6c5': 'BetLost',
    '0xb706971e': 'BetNotFound',
};

/**
 * viem doesn't expose `signature` on every error path; we sniff the revert
 * message which always contains "0xabcdef01" when decoding failed.
 */
function findSelectorInError(error: unknown): string | null {
    if (!error) return null;
    const msg =
        (error as { shortMessage?: string }).shortMessage ??
        (error as { message?: string }).message ??
        '';
    const m = msg.match(/0x[0-9a-fA-F]{8}/);
    return m ? m[0].toLowerCase() : null;
}

/**
 * Walk a wagmi/viem error chain, looking for a `ContractFunctionRevertedError`
 * that carries the decoded `errorName` + `args`. viem nests these inside
 * `.cause` (sometimes more than one level deep), so we walk via `.walk()`
 * when available (BaseError exposes it) and fall back to manual unwrapping.
 */
function findRevertedError(error: unknown): ContractFunctionRevertedError | null {
    if (error instanceof ContractFunctionRevertedError) return error;
    if (!(error instanceof BaseError)) return null;
    const found = error.walk((err) => err instanceof ContractFunctionRevertedError);
    return (found as ContractFunctionRevertedError | null) ?? null;
}

function findUserRejection(error: unknown): UserRejectedRequestError | null {
    if (error instanceof UserRejectedRequestError) return error;
    if (!(error instanceof BaseError)) return null;
    const found = error.walk((err) => err instanceof UserRejectedRequestError);
    return (found as UserRejectedRequestError | null) ?? null;
}

function findInsufficientFunds(error: unknown): InsufficientFundsError | null {
    if (error instanceof InsufficientFundsError) return error;
    if (!(error instanceof BaseError)) return null;
    const found = error.walk((err) => err instanceof InsufficientFundsError);
    return (found as InsufficientFundsError | null) ?? null;
}

export function decodeContractError(error: unknown): DecodedError {
    if (!error) {
        return { title: 'Unknown error', severity: 'error' };
    }

    // Step 1 — wallet popup closed / signature refused.
    if (findUserRejection(error)) {
        return {
            title: 'Transaction cancelled',
            description: 'You declined the request in your wallet.',
            severity: 'info',
        };
    }

    // Step 2 — wallet has no native CHZ to pay gas.
    if (findInsufficientFunds(error)) {
        return {
            title: 'Not enough CHZ for gas',
            description: 'Top up your wallet with CHZ to cover the transaction fee.',
            severity: 'warning',
        };
    }

    // Step 3 — decoded contract revert with errorName.
    const reverted = findRevertedError(error);
    if (reverted) {
        const errorName = reverted.data?.errorName;
        const args = (reverted.data?.args ?? []) as ReadonlyArray<unknown>;
        if (errorName && CUSTOM_ERROR_HANDLERS[errorName]) {
            const handled = CUSTOM_ERROR_HANDLERS[errorName](args);
            return { ...handled, errorName };
        }
        if (errorName) {
            return {
                title: 'Transaction reverted',
                description: `Contract returned ${errorName}.`,
                severity: 'error',
                errorName,
            };
        }
        // Fallback — viem couldn't decode errorName (e.g. cross-contract
        // revert: ChilizSwapRouter calls BettingMatch and the latter's
        // custom error isn't in the router ABI). Sniff the raw selector
        // out of the message and look it up against the static map.
        const selector = findSelectorInError(reverted);
        if (selector && ERROR_SELECTOR_TO_NAME[selector]) {
            const name = ERROR_SELECTOR_TO_NAME[selector];
            const handler = CUSTOM_ERROR_HANDLERS[name];
            if (handler) {
                const handled = handler([]);
                return { ...handled, errorName: name };
            }
            return {
                title: 'Transaction reverted',
                description: `Contract returned ${name}.`,
                severity: 'error',
                errorName: name,
            };
        }
        const reason = reverted.reason ?? reverted.shortMessage;
        return {
            title: 'Transaction reverted',
            description: reason ? String(reason).slice(0, 240) : undefined,
            severity: 'error',
        };
    }

    // Step 4 — generic BaseError surface (RPC, gas, encoding…).
    if (error instanceof BaseError) {
        // Last-chance selector sniff — `EstimateGasExecutionError` etc. carry
        // the raw 4-byte signature in the message even when viem couldn't
        // walk to a `ContractFunctionRevertedError`.
        const selector = findSelectorInError(error);
        if (selector && ERROR_SELECTOR_TO_NAME[selector]) {
            const name = ERROR_SELECTOR_TO_NAME[selector];
            const handler = CUSTOM_ERROR_HANDLERS[name];
            if (handler) {
                const handled = handler([]);
                return { ...handled, errorName: name };
            }
        }
        return {
            title: 'Transaction failed',
            description: error.shortMessage?.slice(0, 240) ?? error.message?.slice(0, 240),
            severity: 'error',
        };
    }

    // Step 5 — non-viem throwables (network fetch, etc.).
    if (error instanceof Error) {
        return {
            title: 'Transaction failed',
            description: error.message.slice(0, 240),
            severity: 'error',
        };
    }

    return { title: 'Transaction failed', severity: 'error' };
}

/**
 * Helper for components that want to surface the error in a sonner toast
 * with the right severity. Uses `console.error` for `error`-level entries
 * so they end up in the browser console for debugging.
 */
export function describeError(error: unknown): { decoded: DecodedError; logged: boolean } {
    const decoded = decodeContractError(error);
    if (decoded.severity === 'error' && error) {
        // eslint-disable-next-line no-console
        console.error('Contract error:', error);
    }
    return { decoded, logged: decoded.severity === 'error' };
}
