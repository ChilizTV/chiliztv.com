import { parseAbiItem } from 'viem';

// Full ABIs sourced from the Foundry build artifacts.
export {
    CHILIZ_SWAP_ROUTER_ABI,
    STREAM_WALLET_ABI,
    STREAM_WALLET_FACTORY_ABI,
    PARI_MATCH_FACTORY_ABI,
    PARI_MATCH_BASE_ABI,
    FOOTBALL_PARI_MATCH_ABI,
    BASKETBALL_PARI_MATCH_ABI,
    LEADERBOARD_REWARDS_ABI,
} from './contracts';

// ERC20 minimal ABI for reading token balances.
export const ERC20_ABI = [
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    }
] as const;

// Minimal inline ABI for PariMatchFactory — owner-restricted match creation.
export const PARI_MATCH_FACTORY_INLINE_ABI = [
    {
        type: 'function',
        name: 'createFootballMatch',
        inputs: [
            { name: '_matchName', type: 'string' },
            { name: '_owner', type: 'address' },
            { name: '_oracle', type: 'address' }
        ],
        outputs: [{ name: 'proxy', type: 'address' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'createBasketballMatch',
        inputs: [
            { name: '_matchName', type: 'string' },
            { name: '_owner', type: 'address' },
            { name: '_oracle', type: 'address' }
        ],
        outputs: [{ name: 'proxy', type: 'address' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'isMatch',
        inputs: [{ name: 'matchAddress', type: 'address' }],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view'
    },
    {
        type: 'event',
        name: 'MatchCreated',
        inputs: [
            { name: 'proxy', type: 'address', indexed: true },
            { name: 'sportType', type: 'uint8', indexed: false },
            { name: 'owner', type: 'address', indexed: true }
        ]
    },
    {
        type: 'event',
        name: 'WiringSet',
        inputs: [
            { name: 'usdcToken', type: 'address', indexed: true },
            { name: 'feeRecipient', type: 'address', indexed: true },
            { name: 'swapRouter', type: 'address', indexed: true }
        ]
    }
] as const;

// Minimal inline ABI for PariMatchBase — used by backend adapters/indexers.
// Full ABI for the frontend lives in wagmi-generated hooks.
export const PARI_MATCH_BASE_INLINE_ABI = [
    // Errors (for revert decoding)
    { type: 'error', name: 'InvalidMarketId', inputs: [{ name: 'marketId', type: 'uint256' }] },
    { type: 'error', name: 'InvalidMarketState', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'current', type: 'uint8' }, { name: 'required', type: 'uint8' }] },
    { type: 'error', name: 'InvalidMarketType', inputs: [{ name: 'marketType', type: 'bytes32' }] },
    { type: 'error', name: 'InvalidOutcome', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'outcome', type: 'uint64' }] },
    { type: 'error', name: 'StakeBelowMinimum', inputs: [{ name: 'stake', type: 'uint256' }, { name: 'minimum', type: 'uint256' }] },
    { type: 'error', name: 'NothingToClaim', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'user', type: 'address' }] },
    { type: 'error', name: 'AlreadyClaimed', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'user', type: 'address' }] },
    { type: 'error', name: 'AccessControlUnauthorizedAccount', inputs: [{ name: 'account', type: 'address' }, { name: 'neededRole', type: 'bytes32' }] },
    // Market creation
    {
        type: 'function',
        name: 'addMarketWithLine',
        inputs: [
            { name: 'marketType', type: 'bytes32' },
            { name: 'line', type: 'int16' }
        ],
        outputs: [{ name: 'marketId', type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'addMarketsBatch',
        inputs: [
            { name: 'marketTypes', type: 'bytes32[]' },
            { name: 'lines', type: 'int16[]' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    // Market state
    { type: 'function', name: 'openMarket', inputs: [{ name: 'marketId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', name: 'suspendMarket', inputs: [{ name: 'marketId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', name: 'closeMarket', inputs: [{ name: 'marketId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', name: 'openMarketsBatch', inputs: [{ name: 'marketIds', type: 'uint256[]' }], outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', name: 'closeMarketsBatch', inputs: [{ name: 'marketIds', type: 'uint256[]' }], outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', name: 'cancelMarket', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'reason', type: 'string' }], outputs: [], stateMutability: 'nonpayable' },
    // Betting (PariMatch is the escrow — caller approves USDC then calls)
    {
        type: 'function',
        name: 'placeBetUSDC',
        inputs: [
            { name: 'marketId', type: 'uint256' },
            { name: 'outcome', type: 'uint64' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'placeBetUSDCFor',
        inputs: [
            { name: 'user', type: 'address' },
            { name: 'marketId', type: 'uint256' },
            { name: 'outcome', type: 'uint64' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    // Resolution
    {
        type: 'function',
        name: 'resolveMarket',
        inputs: [
            { name: 'marketId', type: 'uint256' },
            { name: 'result', type: 'uint64' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    // Claims
    { type: 'function', name: 'claim', inputs: [{ name: 'marketId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', name: 'claimBatch', inputs: [{ name: 'marketIds', type: 'uint256[]' }], outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', name: 'claimRefund', inputs: [{ name: 'marketId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', name: 'claimRefundBatch', inputs: [{ name: 'marketIds', type: 'uint256[]' }], outputs: [], stateMutability: 'nonpayable' },
    // Views
    { type: 'function', name: 'marketCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        name: 'getMarketCore',
        inputs: [{ name: 'marketId', type: 'uint256' }],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'state', type: 'uint8' },
                    { name: 'result', type: 'uint64' },
                    { name: 'createdAt', type: 'uint40' },
                    { name: 'resolvedAt', type: 'uint40' },
                    { name: 'resolvedNetPool', type: 'uint256' }
                ]
            }
        ],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getMarketSpec',
        inputs: [{ name: 'marketId', type: 'uint256' }],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'marketType', type: 'bytes32' },
                    { name: 'line', type: 'int16' },
                    { name: 'maxOutcome', type: 'uint8' },
                    { name: 'extra', type: 'uint8' },
                    { name: 'groupId', type: 'uint16' }
                ]
            }
        ],
        stateMutability: 'view'
    },
    { type: 'function', name: 'getTotalPool', inputs: [{ name: 'marketId', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'getOutcomePool', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'outcome', type: 'uint64' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'getUserStake', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'user', type: 'address' }, { name: 'outcome', type: 'uint64' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'getUserTotalStake', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'user', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'hasClaimed', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'user', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'getImpliedProbabilityBps', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'outcome', type: 'uint64' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'feeBps', inputs: [], outputs: [{ name: '', type: 'uint16' }], stateMutability: 'view' },
    { type: 'function', name: 'leaderboardFeeBps', inputs: [], outputs: [{ name: '', type: 'uint16' }], stateMutability: 'view' }
] as const;

// FootballPariMatch sport-specific resolver entrypoint.
// Struct shape mirrors `FootballPariMatch.FootballScore` (Solidity calldata
// struct, no storage layout). The trailing 3 fields support FULL_TIME_WINNER:
//   - aetHomeGoals / aetAwayGoals: aggregate after extra time (pass 90' score
//     for non-AET matches so FULL_TIME_WINNER mirrors WINNER in that case).
//   - penWinner: 0=Home, 1=Away, 255=PEN_WINNER_NONE (no shootout occurred).
export const FOOTBALL_PARI_MATCH_INLINE_ABI = [
    {
        type: 'function',
        name: 'resolveByScore',
        inputs: [
            {
                name: 's',
                type: 'tuple',
                components: [
                    { name: 'homeGoals', type: 'uint8' },
                    { name: 'awayGoals', type: 'uint8' },
                    { name: 'htHomeGoals', type: 'uint8' },
                    { name: 'htAwayGoals', type: 'uint8' },
                    { name: 'firstScorerId', type: 'uint8' },
                    { name: 'aetHomeGoals', type: 'uint8' },
                    { name: 'aetAwayGoals', type: 'uint8' },
                    { name: 'penWinner', type: 'uint8' }
                ]
            }
        ],
        outputs: [{ name: 'marketsResolved', type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'resolveBatchByScore',
        inputs: [
            { name: 'marketIds', type: 'uint256[]' },
            {
                name: 's',
                type: 'tuple',
                components: [
                    { name: 'homeGoals', type: 'uint8' },
                    { name: 'awayGoals', type: 'uint8' },
                    { name: 'htHomeGoals', type: 'uint8' },
                    { name: 'htAwayGoals', type: 'uint8' },
                    { name: 'firstScorerId', type: 'uint8' }
                ]
            }
        ],
        outputs: [{ name: 'marketsResolved', type: 'uint256' }],
        stateMutability: 'nonpayable'
    }
] as const;

// Position event emitted by PariMatchBase on every stake placed.
export const POSITION_TAKEN_EVENT = parseAbiItem(
    'event PositionTaken(uint256 indexed marketId, address indexed user, uint64 outcome, uint256 stake, uint256 newOutcomePool, uint256 newTotalPool)'
);
export const POSITION_CLAIMED_EVENT = parseAbiItem(
    'event PositionClaimed(uint256 indexed marketId, address indexed user, uint256 stake, uint256 payout)'
);
export const STAKE_REFUNDED_EVENT = parseAbiItem(
    'event StakeRefunded(uint256 indexed marketId, address indexed user, uint256 amount)'
);
export const MARKET_RESOLVED_EVENT = parseAbiItem(
    'event MarketResolved(uint256 indexed marketId, uint64 result, uint256 totalPool, uint256 fee, uint256 resolvedNetPool)'
);
export const MARKET_STATE_CHANGED_EVENT = parseAbiItem(
    'event MarketStateChanged(uint256 indexed marketId, uint8 oldState, uint8 newState)'
);
export const MARKET_CANCELLED_EVENT = parseAbiItem(
    'event MarketCancelled(uint256 indexed marketId, string reason)'
);
export const LEADERBOARD_RECORD_FAILED_EVENT = parseAbiItem(
    'event LeaderboardRecordFailed(address indexed leaderboard, address indexed user, uint256 payout)'
);
