import { parseAbiItem } from 'viem';

// Full ABIs sourced from the Foundry build artifacts (kept in sync via
// `pnpm artifacts:sync` at the repo root).
export {
    LIQUIDITY_POOL_ABI,
    CHILIZ_SWAP_ROUTER_ABI,
    STREAM_WALLET_ABI,
    STREAM_WALLET_FACTORY_ABI,
    BETTING_MATCH_FACTORY_ABI,
    BETTING_MATCH_ABI,
    FOOTBALL_MATCH_FULL_ABI,
    BASKETBALL_MATCH_ABI,
} from './contracts';

// ERC20 ABI for reading token balances
export const ERC20_ABI = [
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    }
] as const;

// Minimal ABI for BettingMatchFactory — must mirror the deployed signature
// `createFootballMatch(string, address owner, address oracle)`.
export const FACTORY_ABI = [
    {
        "type": "function",
        "name": "createFootballMatch",
        "inputs": [
            { "name": "_matchName", "type": "string" },
            { "name": "_owner", "type": "address" },
            { "name": "_oracle", "type": "address" }
        ],
        "outputs": [
            { "name": "proxy", "type": "address" }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createBasketballMatch",
        "inputs": [
            { "name": "_matchName", "type": "string" },
            { "name": "_owner", "type": "address" },
            { "name": "_oracle", "type": "address" }
        ],
        "outputs": [
            { "name": "proxy", "type": "address" }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "MatchCreated",
        "inputs": [
            { "name": "proxy", "type": "address", "indexed": true },
            { "name": "sportType", "type": "uint8", "indexed": false },
            { "name": "owner", "type": "address", "indexed": true }
        ]
    }
] as const;

// FootballMatch ABI for market management and resolution
export const FOOTBALL_MATCH_ABI = [
    // Errors (for proper decoding of on-chain reverts)
    { type: 'error', name: 'InvalidMarketId', inputs: [{ name: 'marketId', type: 'uint256' }] },
    { type: 'error', name: 'InvalidMarketState', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'current', type: 'uint8' }, { name: 'required', type: 'uint8' }] },
    { type: 'error', name: 'InvalidMarketType', inputs: [{ name: 'marketType', type: 'bytes32' }] },
    { type: 'error', name: 'InvalidOddsValue', inputs: [{ name: 'odds', type: 'uint32' }, { name: 'min', type: 'uint32' }, { name: 'max', type: 'uint32' }] },
    { type: 'error', name: 'InvalidSelection', inputs: [{ name: 'marketId', type: 'uint256' }, { name: 'selection', type: 'uint64' }, { name: 'maxAllowed', type: 'uint8' }] },
    { type: 'error', name: 'OddsNotSet', inputs: [{ name: 'marketId', type: 'uint256' }] },
    { type: 'error', name: 'AccessControlUnauthorizedAccount', inputs: [{ name: 'account', type: 'address' }, { name: 'neededRole', type: 'bytes32' }] },
    // Note: the deployed FootballMatch only exposes `addMarketWithLine(bytes32, uint32, int16)`
    // and `addMarketsBatch(...)` — no plain `addMarket`. Always pass `line=0` for line-less markets.
    {
        type: 'function',
        name: 'addMarketWithLine',
        inputs: [
            { name: 'marketType', type: 'bytes32' },
            { name: 'initialOdds', type: 'uint32' },
            { name: 'line', type: 'int16' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'openMarket',
        inputs: [{ name: 'marketId', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'marketCount',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getMarketCore',
        inputs: [{ name: 'marketId', type: 'uint256' }],
        outputs: [
            { name: 'state', type: 'uint8', internalType: 'enum BettingMatch.MarketState' },
            { name: 'result', type: 'uint64', internalType: 'uint64' },
            { name: 'createdAt', type: 'uint40', internalType: 'uint40' },
            { name: 'resolvedAt', type: 'uint40', internalType: 'uint40' },
            { name: 'totalPool', type: 'uint256', internalType: 'uint256' }
        ],
        stateMutability: 'view'
    },
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
    {
        type: 'function',
        name: 'setMarketOdds',
        inputs: [
            { name: 'marketId', type: 'uint256' },
            { name: 'newOdds', type: 'uint32' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'getCurrentOdds',
        inputs: [{ name: 'marketId', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint32' }],
        stateMutability: 'view'
    }
] as const;

export const BET_PLACED_EVENT = parseAbiItem(
    'event BetPlaced(uint256 indexed marketId, address indexed user, uint256 betIndex, uint256 amount, uint64 selection, uint32 odds, uint16 oddsIndex)'
);
