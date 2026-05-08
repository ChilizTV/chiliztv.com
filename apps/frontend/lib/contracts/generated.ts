import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BasketballMatch
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const basketballMatchAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_FIRST_TO_SCORE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_HIGHEST_QUARTER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_QUARTER_WINNER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_SPREAD',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_TOTAL_POINTS',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_WINNER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_ODDS',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_NET_STAKE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_ODDS',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ODDS_PRECISION',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ODDS_SETTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RESOLVER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SWAP_ROUTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'initialOdds', internalType: 'uint32', type: 'uint32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
    ],
    name: 'addMarketWithLine',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'initialOdds', internalType: 'uint32', type: 'uint32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
      { name: 'quarter', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'addMarketWithQuarter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketTypes', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'initialOdds', internalType: 'uint32[]', type: 'uint32[]' },
      { name: 'lines', internalType: 'int16[]', type: 'int16[]' },
    ],
    name: 'addMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketTypes', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'initialOdds', internalType: 'uint32[]', type: 'uint32[]' },
      { name: 'lines', internalType: 'int16[]', type: 'int16[]' },
      { name: 'quarters', internalType: 'uint8[]', type: 'uint8[]' },
    ],
    name: 'addMarketsBatchWithQuarter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'basketballMarkets',
    outputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
      { name: 'quarter', internalType: 'uint8', type: 'uint8' },
      { name: 'maxSelections', internalType: 'uint8', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'cancelMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'claimAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'start', internalType: 'uint256', type: 'uint256' },
      { name: 'end', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimRange',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'closeMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'closeMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyPause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getBasketballMarket',
    outputs: [
      { name: 'marketTypeStr', internalType: 'string', type: 'string' },
      { name: 'line', internalType: 'int16', type: 'int16' },
      { name: 'quarter', internalType: 'uint8', type: 'uint8' },
      { name: 'maxSelections', internalType: 'uint8', type: 'uint8' },
      {
        name: 'state',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
      { name: 'currentOdds', internalType: 'uint32', type: 'uint32' },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
      { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getBetDetails',
    outputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'odds', internalType: 'uint32', type: 'uint32' },
      { name: 'timestamp', internalType: 'uint40', type: 'uint40' },
      { name: 'claimed', internalType: 'bool', type: 'bool' },
      { name: 'potentialPayout', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getCurrentOdds',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketCore',
    outputs: [
      {
        name: '',
        internalType: 'struct BettingMatch.MarketCore',
        type: 'tuple',
        components: [
          {
            name: 'state',
            internalType: 'enum BettingMatch.MarketState',
            type: 'uint8',
          },
          { name: 'result', internalType: 'uint64', type: 'uint64' },
          { name: 'createdAt', internalType: 'uint40', type: 'uint40' },
          { name: 'resolvedAt', internalType: 'uint40', type: 'uint40' },
          { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketInfo',
    outputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'state',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
      { name: 'currentOdds', internalType: 'uint32', type: 'uint32' },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
      { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketLiability',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getOddsHistory',
    outputs: [{ name: '', internalType: 'uint32[]', type: 'uint32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'getUserBets',
    outputs: [
      {
        name: '',
        internalType: 'struct BettingMatch.Bet[]',
        type: 'tuple[]',
        components: [
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'selection', internalType: 'uint64', type: 'uint64' },
          { name: 'oddsIndex', internalType: 'uint16', type: 'uint16' },
          { name: 'timestamp', internalType: 'uint40', type: 'uint40' },
          { name: 'claimed', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_matchName', internalType: 'string', type: 'string' },
      { name: '_owner', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'liquidityPool',
    outputs: [
      { name: '', internalType: 'contract ILiquidityPool', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'marketCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'matchName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxAllowedOdds',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'openMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'openMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'placeBetUSDC',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'placeBetUSDCFor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteNetExposure',
    outputs: [
      { name: 'netExposure', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'resolveMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'results', internalType: 'uint64[]', type: 'uint64[]' },
    ],
    name: 'resolveMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_pool', internalType: 'address', type: 'address' }],
    name: 'setLiquidityPool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'newOdds', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'setMarketOdds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newMax', internalType: 'uint32', type: 'uint32' }],
    name: 'setMaxAllowedOdds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_usdcToken', internalType: 'address', type: 'address' }],
    name: 'setUSDCToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'sportType',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'suspendMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdcToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'betIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'selection',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      { name: 'odds', internalType: 'uint32', type: 'uint32', indexed: false },
      {
        name: 'oddsIndex',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'BetPlaced',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'LiquidityPoolSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'MarketCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'marketType',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'initialOdds',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'MarketCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'result',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'resolvedAt',
        internalType: 'uint40',
        type: 'uint40',
        indexed: false,
      },
    ],
    name: 'MarketResolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldState',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newState',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'MarketStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'name', internalType: 'string', type: 'string', indexed: true },
      {
        name: 'sportType',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MatchInitialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldMax',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'newMax',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'MaxAllowedOddsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldOdds',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'newOdds',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'oddsIndex',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'OddsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'betIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Payout',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'betIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Refund',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'USDCTokenSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'AddressInsufficientBalance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'AlreadyClaimed',
  },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BetLost',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BetNotFound',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidMarketId',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'current',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
      {
        name: 'required',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
    ],
    name: 'InvalidMarketState',
  },
  {
    type: 'error',
    inputs: [{ name: 'marketType', internalType: 'bytes32', type: 'bytes32' }],
    name: 'InvalidMarketType',
  },
  {
    type: 'error',
    inputs: [
      { name: 'odds', internalType: 'uint32', type: 'uint32' },
      { name: 'min', internalType: 'uint32', type: 'uint32' },
      { name: 'max', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'InvalidOddsValue',
  },
  {
    type: 'error',
    inputs: [{ name: 'quarter', internalType: 'uint8', type: 'uint8' }],
    name: 'InvalidQuarter',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'maxAllowed', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'InvalidSelection',
  },
  { type: 'error', inputs: [], name: 'LiquidityPoolNotConfigured' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'MaxOddsEntriesReached',
  },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'OddsNotSet',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  {
    type: 'error',
    inputs: [
      { name: 'netStake', internalType: 'uint256', type: 'uint256' },
      { name: 'minimum', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StakeBelowMinimum',
  },
  { type: 'error', inputs: [], name: 'USDCNotConfigured' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'ZeroBetAmount' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'ZeroNetExposure',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BettingMatch
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const bettingMatchAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_ODDS',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_NET_STAKE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_ODDS',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ODDS_PRECISION',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ODDS_SETTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RESOLVER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SWAP_ROUTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'initialOdds', internalType: 'uint32', type: 'uint32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
    ],
    name: 'addMarketWithLine',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'cancelMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'claimAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'start', internalType: 'uint256', type: 'uint256' },
      { name: 'end', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimRange',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'closeMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'closeMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyPause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getBetDetails',
    outputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'odds', internalType: 'uint32', type: 'uint32' },
      { name: 'timestamp', internalType: 'uint40', type: 'uint40' },
      { name: 'claimed', internalType: 'bool', type: 'bool' },
      { name: 'potentialPayout', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getCurrentOdds',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketCore',
    outputs: [
      {
        name: '',
        internalType: 'struct BettingMatch.MarketCore',
        type: 'tuple',
        components: [
          {
            name: 'state',
            internalType: 'enum BettingMatch.MarketState',
            type: 'uint8',
          },
          { name: 'result', internalType: 'uint64', type: 'uint64' },
          { name: 'createdAt', internalType: 'uint40', type: 'uint40' },
          { name: 'resolvedAt', internalType: 'uint40', type: 'uint40' },
          { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketInfo',
    outputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'state',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
      { name: 'currentOdds', internalType: 'uint32', type: 'uint32' },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
      { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketLiability',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getOddsHistory',
    outputs: [{ name: '', internalType: 'uint32[]', type: 'uint32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'getUserBets',
    outputs: [
      {
        name: '',
        internalType: 'struct BettingMatch.Bet[]',
        type: 'tuple[]',
        components: [
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'selection', internalType: 'uint64', type: 'uint64' },
          { name: 'oddsIndex', internalType: 'uint16', type: 'uint16' },
          { name: 'timestamp', internalType: 'uint40', type: 'uint40' },
          { name: 'claimed', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'liquidityPool',
    outputs: [
      { name: '', internalType: 'contract ILiquidityPool', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'marketCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'matchName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxAllowedOdds',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'openMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'openMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'placeBetUSDC',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'placeBetUSDCFor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteNetExposure',
    outputs: [
      { name: 'netExposure', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'resolveMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'results', internalType: 'uint64[]', type: 'uint64[]' },
    ],
    name: 'resolveMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_pool', internalType: 'address', type: 'address' }],
    name: 'setLiquidityPool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'newOdds', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'setMarketOdds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newMax', internalType: 'uint32', type: 'uint32' }],
    name: 'setMaxAllowedOdds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_usdcToken', internalType: 'address', type: 'address' }],
    name: 'setUSDCToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'sportType',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'suspendMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdcToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'betIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'selection',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      { name: 'odds', internalType: 'uint32', type: 'uint32', indexed: false },
      {
        name: 'oddsIndex',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'BetPlaced',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'LiquidityPoolSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'MarketCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'marketType',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'initialOdds',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'MarketCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'result',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'resolvedAt',
        internalType: 'uint40',
        type: 'uint40',
        indexed: false,
      },
    ],
    name: 'MarketResolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldState',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newState',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'MarketStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'name', internalType: 'string', type: 'string', indexed: true },
      {
        name: 'sportType',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MatchInitialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldMax',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'newMax',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'MaxAllowedOddsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldOdds',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'newOdds',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'oddsIndex',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'OddsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'betIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Payout',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'betIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Refund',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'USDCTokenSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'AddressInsufficientBalance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'AlreadyClaimed',
  },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BetLost',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BetNotFound',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidMarketId',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'current',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
      {
        name: 'required',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
    ],
    name: 'InvalidMarketState',
  },
  {
    type: 'error',
    inputs: [
      { name: 'odds', internalType: 'uint32', type: 'uint32' },
      { name: 'min', internalType: 'uint32', type: 'uint32' },
      { name: 'max', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'InvalidOddsValue',
  },
  { type: 'error', inputs: [], name: 'LiquidityPoolNotConfigured' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'MaxOddsEntriesReached',
  },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'OddsNotSet',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  {
    type: 'error',
    inputs: [
      { name: 'netStake', internalType: 'uint256', type: 'uint256' },
      { name: 'minimum', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StakeBelowMinimum',
  },
  { type: 'error', inputs: [], name: 'USDCNotConfigured' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'ZeroBetAmount' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'ZeroNetExposure',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BettingMatchFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const bettingMatchFactoryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'BASKETBALL',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'FOOTBALL',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'allMatches',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'basketballImplementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_matchName', internalType: 'string', type: 'string' },
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_oracle', internalType: 'address', type: 'address' },
    ],
    name: 'createBasketballMatch',
    outputs: [{ name: 'proxy', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_matchName', internalType: 'string', type: 'string' },
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_oracle', internalType: 'address', type: 'address' },
    ],
    name: 'createFootballMatch',
    outputs: [{ name: 'proxy', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'footballImplementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllMatches',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'matchAddress', internalType: 'address', type: 'address' },
    ],
    name: 'getSportType',
    outputs: [
      {
        name: '',
        internalType: 'enum BettingMatchFactory.SportType',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'sport', internalType: 'uint8', type: 'uint8' }],
    name: 'implementations',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isMatch',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'liquidityPool',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'matchSportType',
    outputs: [
      {
        name: '',
        internalType: 'enum BettingMatchFactory.SportType',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newImpl', internalType: 'address', type: 'address' }],
    name: 'setBasketballImplementation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newImpl', internalType: 'address', type: 'address' }],
    name: 'setFootballImplementation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_liquidityPool', internalType: 'address', type: 'address' },
      { name: '_usdcToken', internalType: 'address', type: 'address' },
      { name: '_swapRouter', internalType: 'address', type: 'address' },
    ],
    name: 'setWiring',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'swapRouter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdcToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldImpl',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newImpl',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BasketballImplementationUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldImpl',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newImpl',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'FootballImplementationUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'proxy',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sportType',
        internalType: 'enum BettingMatchFactory.SportType',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MatchCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'liquidityPool',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'usdcToken',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'swapRouter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'WiringSet',
  },
  { type: 'error', inputs: [], name: 'InvalidAddress' },
  {
    type: 'error',
    inputs: [
      { name: 'matchAddress', internalType: 'address', type: 'address' },
    ],
    name: 'MatchNotFound',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'WiringNotConfigured' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ChilizSwapRouter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const chilizSwapRouterAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_masterRouter', internalType: 'address', type: 'address' },
      { name: '_tokenRouter', internalType: 'address', type: 'address' },
      { name: '_usdc', internalType: 'address', type: 'address' },
      { name: '_wchz', internalType: 'address', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: '_platformFeeBps', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'bettingMatchFactory',
    outputs: [
      {
        name: '',
        internalType: 'contract BettingMatchFactory',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'depositLiquidityWithCHZ',
    outputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'depositLiquidityWithToken',
    outputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'depositLiquidityWithUSDC',
    outputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'streamer', internalType: 'address', type: 'address' },
      { name: 'message', internalType: 'string', type: 'string' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'donateWithCHZ',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'streamer', internalType: 'address', type: 'address' },
      { name: 'message', internalType: 'string', type: 'string' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'donateWithToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'streamer', internalType: 'address', type: 'address' },
      { name: 'message', internalType: 'string', type: 'string' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'donateWithUSDC',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'liquidityPool',
    outputs: [
      {
        name: '',
        internalType: 'contract ILiquidityPoolDeposit',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'masterRouter',
    outputs: [
      {
        name: '',
        internalType: 'contract IKayenMasterRouterV2',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'placeBetWithCHZ',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'placeBetWithToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'placeBetWithUSDC',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'platformFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_pool', internalType: 'address', type: 'address' }],
    name: 'setLiquidityPool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_factory', internalType: 'address', type: 'address' }],
    name: 'setMatchFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_feeBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setPlatformFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_factory', internalType: 'address', type: 'address' }],
    name: 'setStreamWalletFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_treasury', internalType: 'address', type: 'address' }],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'streamWalletFactory',
    outputs: [
      {
        name: '',
        internalType: 'contract StreamWalletFactory',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'streamer', internalType: 'address', type: 'address' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'subscribeWithCHZ',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'streamer', internalType: 'address', type: 'address' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'subscribeWithToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'streamer', internalType: 'address', type: 'address' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'subscribeWithUSDC',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tokenRouter',
    outputs: [
      { name: '', internalType: 'contract IKayenRouter', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdc',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'wchz',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bettingMatch',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'chzSpent',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'usdcReceived',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'selection',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'BetPlacedViaCHZ',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bettingMatch',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenSpent',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'usdcReceived',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'selection',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'BetPlacedViaToken',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bettingMatch',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'selection',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'BetPlacedWithUSDC',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'donor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'chzSpent',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'usdcDonated',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'message',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'DonationWithCHZ',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'donor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenSpent',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'usdcDonated',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'message',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'DonationWithToken',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'donor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'message',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'DonationWithUSDCEvent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'depositor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'chzSpent',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'usdcReceived',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'sharesMinted',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LiquidityDepositedWithCHZ',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'depositor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenSpent',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'usdcReceived',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'sharesMinted',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LiquidityDepositedWithToken',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'depositor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'sharesMinted',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LiquidityDepositedWithUSDC',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldPool',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newPool',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'LiquidityPoolSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldFactory',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newFactory',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MatchFactorySet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldFeeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'newFeeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'PlatformFeeBpsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldFactory',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newFactory',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'StreamWalletFactorySet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subscriber',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'chzSpent',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'usdcPaid',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'duration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionWithCHZ',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subscriber',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenSpent',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'usdcPaid',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'duration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionWithToken',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subscriber',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'duration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionWithUSDCEvent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasurySet',
  },
  { type: 'error', inputs: [], name: 'BettingMatchFactoryNotSet' },
  { type: 'error', inputs: [], name: 'DeadlinePassed' },
  { type: 'error', inputs: [], name: 'InvalidFeeBps' },
  { type: 'error', inputs: [], name: 'LiquidityPoolNotSet' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [
      { name: 'poolAsset', internalType: 'address', type: 'address' },
      { name: 'expectedUsdc', internalType: 'address', type: 'address' },
    ],
    name: 'PoolAssetMismatch',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'RouterNotConfiguredOnFactory' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'TokenIsUSDC' },
  {
    type: 'error',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
    ],
    name: 'UnauthorizedBettingMatch',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroValue' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FootballMatch
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const footballMatchAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_BOTH_SCORE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_CORRECT_SCORE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_FIRST_SCORER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_GOALS_TOTAL',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_HALFTIME',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MARKET_WINNER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_ODDS',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_NET_STAKE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_ODDS',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ODDS_PRECISION',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ODDS_SETTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RESOLVER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SWAP_ROUTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'initialOdds', internalType: 'uint32', type: 'uint32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
    ],
    name: 'addMarketWithLine',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketTypes', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'initialOdds', internalType: 'uint32[]', type: 'uint32[]' },
      { name: 'lines', internalType: 'int16[]', type: 'int16[]' },
    ],
    name: 'addMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'cancelMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'claimAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'start', internalType: 'uint256', type: 'uint256' },
      { name: 'end', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimRange',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'closeMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'closeMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyPause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'footballMarkets',
    outputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
      { name: 'maxSelections', internalType: 'uint8', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getBetDetails',
    outputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'odds', internalType: 'uint32', type: 'uint32' },
      { name: 'timestamp', internalType: 'uint40', type: 'uint40' },
      { name: 'claimed', internalType: 'bool', type: 'bool' },
      { name: 'potentialPayout', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getCurrentOdds',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getFootballMarket',
    outputs: [
      { name: 'marketTypeStr', internalType: 'string', type: 'string' },
      { name: 'line', internalType: 'int16', type: 'int16' },
      { name: 'maxSelections', internalType: 'uint8', type: 'uint8' },
      {
        name: 'state',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
      { name: 'currentOdds', internalType: 'uint32', type: 'uint32' },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
      { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketCore',
    outputs: [
      {
        name: '',
        internalType: 'struct BettingMatch.MarketCore',
        type: 'tuple',
        components: [
          {
            name: 'state',
            internalType: 'enum BettingMatch.MarketState',
            type: 'uint8',
          },
          { name: 'result', internalType: 'uint64', type: 'uint64' },
          { name: 'createdAt', internalType: 'uint40', type: 'uint40' },
          { name: 'resolvedAt', internalType: 'uint40', type: 'uint40' },
          { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketInfo',
    outputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'state',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
      { name: 'currentOdds', internalType: 'uint32', type: 'uint32' },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
      { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketLiability',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getOddsHistory',
    outputs: [{ name: '', internalType: 'uint32[]', type: 'uint32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'getUserBets',
    outputs: [
      {
        name: '',
        internalType: 'struct BettingMatch.Bet[]',
        type: 'tuple[]',
        components: [
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'selection', internalType: 'uint64', type: 'uint64' },
          { name: 'oddsIndex', internalType: 'uint16', type: 'uint16' },
          { name: 'timestamp', internalType: 'uint40', type: 'uint40' },
          { name: 'claimed', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_matchName', internalType: 'string', type: 'string' },
      { name: '_owner', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'liquidityPool',
    outputs: [
      { name: '', internalType: 'contract ILiquidityPool', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'marketCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'matchName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxAllowedOdds',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'openMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'openMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'placeBetUSDC',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'placeBetUSDCFor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteNetExposure',
    outputs: [
      { name: 'netExposure', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'resolveMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'results', internalType: 'uint64[]', type: 'uint64[]' },
    ],
    name: 'resolveMarketsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_pool', internalType: 'address', type: 'address' }],
    name: 'setLiquidityPool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'newOdds', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'setMarketOdds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newMax', internalType: 'uint32', type: 'uint32' }],
    name: 'setMaxAllowedOdds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_usdcToken', internalType: 'address', type: 'address' }],
    name: 'setUSDCToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'sportType',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'suspendMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdcToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'betIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'selection',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      { name: 'odds', internalType: 'uint32', type: 'uint32', indexed: false },
      {
        name: 'oddsIndex',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'BetPlaced',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'LiquidityPoolSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'MarketCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'marketType',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'initialOdds',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'MarketCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'result',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'resolvedAt',
        internalType: 'uint40',
        type: 'uint40',
        indexed: false,
      },
    ],
    name: 'MarketResolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldState',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newState',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'MarketStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'name', internalType: 'string', type: 'string', indexed: true },
      {
        name: 'sportType',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MatchInitialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldMax',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'newMax',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'MaxAllowedOddsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldOdds',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'newOdds',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'oddsIndex',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'OddsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'betIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Payout',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'betIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Refund',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'USDCTokenSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'AddressInsufficientBalance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'AlreadyClaimed',
  },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BetLost',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BetNotFound',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidMarketId',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'current',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
      {
        name: 'required',
        internalType: 'enum BettingMatch.MarketState',
        type: 'uint8',
      },
    ],
    name: 'InvalidMarketState',
  },
  {
    type: 'error',
    inputs: [{ name: 'marketType', internalType: 'bytes32', type: 'bytes32' }],
    name: 'InvalidMarketType',
  },
  {
    type: 'error',
    inputs: [
      { name: 'odds', internalType: 'uint32', type: 'uint32' },
      { name: 'min', internalType: 'uint32', type: 'uint32' },
      { name: 'max', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'InvalidOddsValue',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'selection', internalType: 'uint64', type: 'uint64' },
      { name: 'maxAllowed', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'InvalidSelection',
  },
  { type: 'error', inputs: [], name: 'LiquidityPoolNotConfigured' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'MaxOddsEntriesReached',
  },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'OddsNotSet',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  {
    type: 'error',
    inputs: [
      { name: 'netStake', internalType: 'uint256', type: 'uint256' },
      { name: 'minimum', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StakeBelowMinimum',
  },
  { type: 'error', inputs: [], name: 'USDCNotConfigured' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'ZeroBetAmount' },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'ZeroNetExposure',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LiquidityPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const liquidityPoolAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'BPS_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LP_WITHDRAWAL_FEE_BPS_MAX',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MATCH_AUTHORIZER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MATCH_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_BPS_SETTABLE',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ROUTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'TREASURY_SHARE_BPS_MAX',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'accruedTreasury',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
    ],
    name: 'authorizeMatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelTreasuryProposal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    name: 'convertToAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    name: 'convertToShares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'holder', internalType: 'address', type: 'address' }],
    name: 'costBasis',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'deposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'depositCooldownSeconds',
    outputs: [{ name: '', internalType: 'uint48', type: 'uint48' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'freeBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'usdc_', internalType: 'contract IERC20', type: 'address' },
      { name: 'admin_', internalType: 'address', type: 'address' },
      { name: 'treasury_', internalType: 'address', type: 'address' },
      { name: 'protocolFeeBps_', internalType: 'uint16', type: 'uint16' },
      { name: 'maxMarketBps_', internalType: 'uint16', type: 'uint16' },
      { name: 'maxMatchBps_', internalType: 'uint16', type: 'uint16' },
      { name: 'cooldown_', internalType: 'uint48', type: 'uint48' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'holder', internalType: 'address', type: 'address' }],
    name: 'lastDepositAt',
    outputs: [{ name: '', internalType: 'uint48', type: 'uint48' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lpWithdrawalFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'marketLiability',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
    ],
    name: 'matchLiability',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxBetAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'maxDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxLiabilityPerMarketBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxLiabilityPerMatchBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'maxMint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'maxRedeem',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'maxWithdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'mint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'stake', internalType: 'uint256', type: 'uint256' },
      { name: 'releasedNetExposure', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'payRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'payout', internalType: 'uint256', type: 'uint256' },
      { name: 'releasedNetExposure', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'payWinner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingTreasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    name: 'previewDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    name: 'previewMint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    name: 'previewRedeem',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    name: 'previewWithdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTreasury', internalType: 'address', type: 'address' }],
    name: 'proposeTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'protocolFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'bettor', internalType: 'address', type: 'address' },
      { name: 'netStake', internalType: 'uint256', type: 'uint256' },
      { name: 'netExposure', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordBet',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'redeem',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
    ],
    name: 'revokeMatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newSeconds', internalType: 'uint48', type: 'uint48' }],
    name: 'setDepositCooldownSeconds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setLpWithdrawalFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newMax', internalType: 'uint256', type: 'uint256' }],
    name: 'setMaxBetAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setMaxLiabilityPerMarketBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setMaxLiabilityPerMatchBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setProtocolFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setTreasuryShareBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'losingLiabilityToRelease',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'losingNetStake', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'settleMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalLiabilities',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryShareBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryWithdrawable',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'utilization',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bettingMatch',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'bettor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'netStake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'netExposure',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BetRecorded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldSeconds',
        internalType: 'uint48',
        type: 'uint48',
        indexed: false,
      },
      {
        name: 'newSeconds',
        internalType: 'uint48',
        type: 'uint48',
        indexed: false,
      },
    ],
    name: 'DepositCooldownSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'gain',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'fee', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'LpWithdrawalFeeAccrued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'newBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'LpWithdrawalFeeBpsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bettingMatch',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'releasedLiability',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MarketSettled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bettingMatch',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MatchAuthorized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bettingMatch',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MatchRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldMax',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newMax',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MaxBetAmountSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'newBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'MaxLiabilityPerMarketSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'newBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'MaxLiabilityPerMatchSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'newBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'ProtocolFeeSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bettingMatch',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'stake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'releasedLiability',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RefundPaid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryAccepted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bettingMatch',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'losingNetStake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'treasuryShare',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TreasuryAccrued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pending',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryProposalCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'proposer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pending',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryProposed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'newBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'TreasuryShareBpsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TreasuryWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bettingMatch',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'payout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WinnerPaid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'cap', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BetAmountAboveCap',
  },
  {
    type: 'error',
    inputs: [
      { name: 'provided', internalType: 'uint16', type: 'uint16' },
      { name: 'max', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'BpsOutOfRange',
  },
  {
    type: 'error',
    inputs: [
      { name: 'holder', internalType: 'address', type: 'address' },
      { name: 'unlocksAt', internalType: 'uint48', type: 'uint48' },
    ],
    name: 'CooldownActive',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxDeposit',
  },
  {
    type: 'error',
    inputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxMint',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxRedeem',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxWithdraw',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  {
    type: 'error',
    inputs: [
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'free', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientFreeBalance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'available', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientTreasuryBalance',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'LiabilityUnderflow' },
  {
    type: 'error',
    inputs: [
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'cap', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'MarketLiabilityCapExceeded',
  },
  {
    type: 'error',
    inputs: [
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'cap', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'MatchLiabilityCapExceeded',
  },
  {
    type: 'error',
    inputs: [
      { name: 'bettingMatch', internalType: 'address', type: 'address' },
    ],
    name: 'MatchNotAuthorized',
  },
  { type: 'error', inputs: [], name: 'NoPendingTreasury' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'NotMatchAuthorizer',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'pending', internalType: 'address', type: 'address' },
    ],
    name: 'NotPendingTreasury',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'treasury', internalType: 'address', type: 'address' },
    ],
    name: 'NotTreasury',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// StreamWallet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const streamWalletAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'availableBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'message', internalType: 'string', type: 'string' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'donate',
    outputs: [
      { name: 'platformFee', internalType: 'uint256', type: 'uint256' },
      { name: 'streamerAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'donor', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'message', internalType: 'string', type: 'string' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'donateFor',
    outputs: [
      { name: 'platformFee', internalType: 'uint256', type: 'uint256' },
      { name: 'streamerAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'donor', internalType: 'address', type: 'address' }],
    name: 'getDonationAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getSubscription',
    outputs: [
      {
        name: '',
        internalType: 'struct StreamWallet.Subscription',
        type: 'tuple',
        components: [
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'expiryTime', internalType: 'uint256', type: 'uint256' },
          { name: 'active', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'streamer_', internalType: 'address', type: 'address' },
      { name: 'treasury_', internalType: 'address', type: 'address' },
      { name: 'platformFeeBps_', internalType: 'uint16', type: 'uint16' },
      { name: 'kayenRouter_', internalType: 'address', type: 'address' },
      { name: 'usdc_', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'isSubscribed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'kayenRouter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'lifetimeDonations',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'platformFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'donor', internalType: 'address', type: 'address' },
      { name: 'totalUsdcAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'platformFee', internalType: 'uint256', type: 'uint256' },
      { name: 'streamerAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'message', internalType: 'string', type: 'string' },
    ],
    name: 'recordDonationByRouter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subscriber', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'recordSubscription',
    outputs: [
      { name: 'platformFee', internalType: 'uint256', type: 'uint256' },
      { name: 'streamerAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subscriber', internalType: 'address', type: 'address' },
      { name: 'totalUsdcAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordSubscriptionByRouter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_swapRouter', internalType: 'address', type: 'address' }],
    name: 'setSwapRouter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'streamer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'subscriptions',
    outputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'expiryTime', internalType: 'uint256', type: 'uint256' },
      { name: 'active', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'swapRouter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalRevenue',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSubscribers',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalWithdrawn',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdc',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawRevenue',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'donor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'message',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'streamerAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DonationReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'treasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PlatformFeeCollected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RevenueWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subscriber',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'duration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'expiryTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionRecorded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRouter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRouter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SwapRouterUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'DeadlinePassed' },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InsufficientBalance' },
  { type: 'error', inputs: [], name: 'InvalidAddress' },
  { type: 'error', inputs: [], name: 'InvalidAmount' },
  { type: 'error', inputs: [], name: 'InvalidDuration' },
  { type: 'error', inputs: [], name: 'InvalidFeeBps' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'OnlyAuthorized' },
  { type: 'error', inputs: [], name: 'OnlyFactory' },
  { type: 'error', inputs: [], name: 'OnlyStreamer' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'SwapSlippageExceeded' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// StreamWalletFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const streamWalletFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'initialOwner', internalType: 'address', type: 'address' },
      { name: 'treasury_', internalType: 'address', type: 'address' },
      {
        name: 'defaultPlatformFeeBps_',
        internalType: 'uint16',
        type: 'uint16',
      },
      { name: 'kayenRouter_', internalType: 'address', type: 'address' },
      { name: 'usdc_', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultPlatformFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'streamer', internalType: 'address', type: 'address' }],
    name: 'deployWalletFor',
    outputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'streamer', internalType: 'address', type: 'address' },
      { name: 'message', internalType: 'string', type: 'string' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'donateToStream',
    outputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'streamer', internalType: 'address', type: 'address' }],
    name: 'getOrCreateWallet',
    outputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'streamer', internalType: 'address', type: 'address' }],
    name: 'getWallet',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'streamer', internalType: 'address', type: 'address' }],
    name: 'hasWallet',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'implementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'kayenRouter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'setImplementation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newRouter', internalType: 'address', type: 'address' }],
    name: 'setKayenRouter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newFeeBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setPlatformFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_swapRouter', internalType: 'address', type: 'address' }],
    name: 'setSwapRouter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTreasury', internalType: 'address', type: 'address' }],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newUsdc', internalType: 'address', type: 'address' }],
    name: 'setUsdc',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'streamWalletImplementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'streamerWallets',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'streamer', internalType: 'address', type: 'address' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'amountOutMin', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'subscribeToStream',
    outputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'swapRouter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'streamer', internalType: 'address', type: 'address' },
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeWallet',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdc',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'donor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'message',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'DonationProcessed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldImplementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newImplementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ImplementationUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRouter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRouter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'KayenRouterUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldFeeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'newFeeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'PlatformFeeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'wallet',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'StreamWalletCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'subscriber',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionProcessed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRouter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRouter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SwapRouterUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldUsdc',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newUsdc',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'UsdcUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'streamer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'wallet',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newImplementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'WalletUpgraded',
  },
  { type: 'error', inputs: [], name: 'InvalidAddress' },
  { type: 'error', inputs: [], name: 'InvalidAmount' },
  { type: 'error', inputs: [], name: 'InvalidDuration' },
  { type: 'error', inputs: [], name: 'InvalidFeeBps' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'Unauthorized' },
  { type: 'error', inputs: [], name: 'WalletAlreadyExists' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__
 */
export const useBasketballMatchReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: basketballMatchAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useBasketballMatchReadAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useBasketballMatchReadDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"MARKET_FIRST_TO_SCORE"`
 */
export const useBasketballMatchReadMarketFirstToScore =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'MARKET_FIRST_TO_SCORE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"MARKET_HIGHEST_QUARTER"`
 */
export const useBasketballMatchReadMarketHighestQuarter =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'MARKET_HIGHEST_QUARTER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"MARKET_QUARTER_WINNER"`
 */
export const useBasketballMatchReadMarketQuarterWinner =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'MARKET_QUARTER_WINNER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"MARKET_SPREAD"`
 */
export const useBasketballMatchReadMarketSpread =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'MARKET_SPREAD',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"MARKET_TOTAL_POINTS"`
 */
export const useBasketballMatchReadMarketTotalPoints =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'MARKET_TOTAL_POINTS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"MARKET_WINNER"`
 */
export const useBasketballMatchReadMarketWinner =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'MARKET_WINNER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"MAX_ODDS"`
 */
export const useBasketballMatchReadMaxOdds =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'MAX_ODDS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"MIN_NET_STAKE"`
 */
export const useBasketballMatchReadMinNetStake =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'MIN_NET_STAKE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"MIN_ODDS"`
 */
export const useBasketballMatchReadMinOdds =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'MIN_ODDS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"ODDS_PRECISION"`
 */
export const useBasketballMatchReadOddsPrecision =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'ODDS_PRECISION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"ODDS_SETTER_ROLE"`
 */
export const useBasketballMatchReadOddsSetterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'ODDS_SETTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useBasketballMatchReadPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"RESOLVER_ROLE"`
 */
export const useBasketballMatchReadResolverRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'RESOLVER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"SWAP_ROUTER_ROLE"`
 */
export const useBasketballMatchReadSwapRouterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'SWAP_ROUTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useBasketballMatchReadUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"basketballMarkets"`
 */
export const useBasketballMatchReadBasketballMarkets =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'basketballMarkets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"getBasketballMarket"`
 */
export const useBasketballMatchReadGetBasketballMarket =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'getBasketballMarket',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"getBetDetails"`
 */
export const useBasketballMatchReadGetBetDetails =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'getBetDetails',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"getCurrentOdds"`
 */
export const useBasketballMatchReadGetCurrentOdds =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'getCurrentOdds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"getMarketCore"`
 */
export const useBasketballMatchReadGetMarketCore =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'getMarketCore',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"getMarketInfo"`
 */
export const useBasketballMatchReadGetMarketInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'getMarketInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"getMarketLiability"`
 */
export const useBasketballMatchReadGetMarketLiability =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'getMarketLiability',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"getOddsHistory"`
 */
export const useBasketballMatchReadGetOddsHistory =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'getOddsHistory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useBasketballMatchReadGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"getUserBets"`
 */
export const useBasketballMatchReadGetUserBets =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'getUserBets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"hasRole"`
 */
export const useBasketballMatchReadHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"liquidityPool"`
 */
export const useBasketballMatchReadLiquidityPool =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'liquidityPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"marketCount"`
 */
export const useBasketballMatchReadMarketCount =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'marketCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"matchName"`
 */
export const useBasketballMatchReadMatchName =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'matchName',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"maxAllowedOdds"`
 */
export const useBasketballMatchReadMaxAllowedOdds =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'maxAllowedOdds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"owner"`
 */
export const useBasketballMatchReadOwner = /*#__PURE__*/ createUseReadContract({
  abi: basketballMatchAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"paused"`
 */
export const useBasketballMatchReadPaused = /*#__PURE__*/ createUseReadContract(
  { abi: basketballMatchAbi, functionName: 'paused' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useBasketballMatchReadProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"quoteNetExposure"`
 */
export const useBasketballMatchReadQuoteNetExposure =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'quoteNetExposure',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"sportType"`
 */
export const useBasketballMatchReadSportType =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'sportType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useBasketballMatchReadSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"usdcToken"`
 */
export const useBasketballMatchReadUsdcToken =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballMatchAbi,
    functionName: 'usdcToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__
 */
export const useBasketballMatchWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: basketballMatchAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const useBasketballMatchWriteAddMarketWithLine =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"addMarketWithQuarter"`
 */
export const useBasketballMatchWriteAddMarketWithQuarter =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'addMarketWithQuarter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"addMarketsBatch"`
 */
export const useBasketballMatchWriteAddMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'addMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"addMarketsBatchWithQuarter"`
 */
export const useBasketballMatchWriteAddMarketsBatchWithQuarter =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'addMarketsBatchWithQuarter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const useBasketballMatchWriteCancelMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"claim"`
 */
export const useBasketballMatchWriteClaim =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"claimAll"`
 */
export const useBasketballMatchWriteClaimAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'claimAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"claimRange"`
 */
export const useBasketballMatchWriteClaimRange =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'claimRange',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useBasketballMatchWriteClaimRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"closeMarket"`
 */
export const useBasketballMatchWriteCloseMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const useBasketballMatchWriteCloseMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useBasketballMatchWriteEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"grantRole"`
 */
export const useBasketballMatchWriteGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"initialize"`
 */
export const useBasketballMatchWriteInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"openMarket"`
 */
export const useBasketballMatchWriteOpenMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const useBasketballMatchWriteOpenMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const useBasketballMatchWritePlaceBetUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const useBasketballMatchWritePlaceBetUsdcFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useBasketballMatchWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useBasketballMatchWriteRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const useBasketballMatchWriteResolveMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const useBasketballMatchWriteResolveMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useBasketballMatchWriteRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"setLiquidityPool"`
 */
export const useBasketballMatchWriteSetLiquidityPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'setLiquidityPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"setMarketOdds"`
 */
export const useBasketballMatchWriteSetMarketOdds =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'setMarketOdds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"setMaxAllowedOdds"`
 */
export const useBasketballMatchWriteSetMaxAllowedOdds =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'setMaxAllowedOdds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useBasketballMatchWriteSetUsdcToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const useBasketballMatchWriteSuspendMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useBasketballMatchWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"unpause"`
 */
export const useBasketballMatchWriteUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useBasketballMatchWriteUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballMatchAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__
 */
export const useBasketballMatchSimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: basketballMatchAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const useBasketballMatchSimulateAddMarketWithLine =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"addMarketWithQuarter"`
 */
export const useBasketballMatchSimulateAddMarketWithQuarter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'addMarketWithQuarter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"addMarketsBatch"`
 */
export const useBasketballMatchSimulateAddMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'addMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"addMarketsBatchWithQuarter"`
 */
export const useBasketballMatchSimulateAddMarketsBatchWithQuarter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'addMarketsBatchWithQuarter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const useBasketballMatchSimulateCancelMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"claim"`
 */
export const useBasketballMatchSimulateClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"claimAll"`
 */
export const useBasketballMatchSimulateClaimAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'claimAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"claimRange"`
 */
export const useBasketballMatchSimulateClaimRange =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'claimRange',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useBasketballMatchSimulateClaimRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"closeMarket"`
 */
export const useBasketballMatchSimulateCloseMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const useBasketballMatchSimulateCloseMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useBasketballMatchSimulateEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"grantRole"`
 */
export const useBasketballMatchSimulateGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"initialize"`
 */
export const useBasketballMatchSimulateInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"openMarket"`
 */
export const useBasketballMatchSimulateOpenMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const useBasketballMatchSimulateOpenMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const useBasketballMatchSimulatePlaceBetUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const useBasketballMatchSimulatePlaceBetUsdcFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useBasketballMatchSimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useBasketballMatchSimulateRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const useBasketballMatchSimulateResolveMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const useBasketballMatchSimulateResolveMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useBasketballMatchSimulateRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"setLiquidityPool"`
 */
export const useBasketballMatchSimulateSetLiquidityPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'setLiquidityPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"setMarketOdds"`
 */
export const useBasketballMatchSimulateSetMarketOdds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'setMarketOdds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"setMaxAllowedOdds"`
 */
export const useBasketballMatchSimulateSetMaxAllowedOdds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'setMaxAllowedOdds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useBasketballMatchSimulateSetUsdcToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const useBasketballMatchSimulateSuspendMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useBasketballMatchSimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"unpause"`
 */
export const useBasketballMatchSimulateUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballMatchAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useBasketballMatchSimulateUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballMatchAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__
 */
export const useBasketballMatchWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: basketballMatchAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"BetPlaced"`
 */
export const useBasketballMatchWatchBetPlaced =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'BetPlaced',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"Initialized"`
 */
export const useBasketballMatchWatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"LiquidityPoolSet"`
 */
export const useBasketballMatchWatchLiquidityPoolSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'LiquidityPoolSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"MarketCancelled"`
 */
export const useBasketballMatchWatchMarketCancelled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'MarketCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"MarketCreated"`
 */
export const useBasketballMatchWatchMarketCreated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'MarketCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"MarketResolved"`
 */
export const useBasketballMatchWatchMarketResolved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'MarketResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"MarketStateChanged"`
 */
export const useBasketballMatchWatchMarketStateChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'MarketStateChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"MatchInitialized"`
 */
export const useBasketballMatchWatchMatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'MatchInitialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"MaxAllowedOddsSet"`
 */
export const useBasketballMatchWatchMaxAllowedOddsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'MaxAllowedOddsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"OddsUpdated"`
 */
export const useBasketballMatchWatchOddsUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'OddsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useBasketballMatchWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"Paused"`
 */
export const useBasketballMatchWatchPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"Payout"`
 */
export const useBasketballMatchWatchPayout =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'Payout',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"Refund"`
 */
export const useBasketballMatchWatchRefund =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'Refund',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useBasketballMatchWatchRoleAdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useBasketballMatchWatchRoleGranted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useBasketballMatchWatchRoleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"USDCTokenSet"`
 */
export const useBasketballMatchWatchUsdcTokenSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'USDCTokenSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useBasketballMatchWatchUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballMatchAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useBasketballMatchWatchUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballMatchAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__
 */
export const useBettingMatchReadundefined = /*#__PURE__*/ createUseReadContract(
  { abi: bettingMatchAbi },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useBettingMatchReadAdminRole = /*#__PURE__*/ createUseReadContract(
  { abi: bettingMatchAbi, functionName: 'ADMIN_ROLE' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useBettingMatchReadDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"MAX_ODDS"`
 */
export const useBettingMatchReadMaxOdds = /*#__PURE__*/ createUseReadContract({
  abi: bettingMatchAbi,
  functionName: 'MAX_ODDS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"MIN_NET_STAKE"`
 */
export const useBettingMatchReadMinNetStake =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'MIN_NET_STAKE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"MIN_ODDS"`
 */
export const useBettingMatchReadMinOdds = /*#__PURE__*/ createUseReadContract({
  abi: bettingMatchAbi,
  functionName: 'MIN_ODDS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"ODDS_PRECISION"`
 */
export const useBettingMatchReadOddsPrecision =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'ODDS_PRECISION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"ODDS_SETTER_ROLE"`
 */
export const useBettingMatchReadOddsSetterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'ODDS_SETTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useBettingMatchReadPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"RESOLVER_ROLE"`
 */
export const useBettingMatchReadResolverRole =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'RESOLVER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"SWAP_ROUTER_ROLE"`
 */
export const useBettingMatchReadSwapRouterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'SWAP_ROUTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useBettingMatchReadUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"getBetDetails"`
 */
export const useBettingMatchReadGetBetDetails =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'getBetDetails',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"getCurrentOdds"`
 */
export const useBettingMatchReadGetCurrentOdds =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'getCurrentOdds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"getMarketCore"`
 */
export const useBettingMatchReadGetMarketCore =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'getMarketCore',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"getMarketInfo"`
 */
export const useBettingMatchReadGetMarketInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'getMarketInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"getMarketLiability"`
 */
export const useBettingMatchReadGetMarketLiability =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'getMarketLiability',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"getOddsHistory"`
 */
export const useBettingMatchReadGetOddsHistory =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'getOddsHistory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useBettingMatchReadGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"getUserBets"`
 */
export const useBettingMatchReadGetUserBets =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'getUserBets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"hasRole"`
 */
export const useBettingMatchReadHasRole = /*#__PURE__*/ createUseReadContract({
  abi: bettingMatchAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"liquidityPool"`
 */
export const useBettingMatchReadLiquidityPool =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'liquidityPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"marketCount"`
 */
export const useBettingMatchReadMarketCount =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'marketCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"matchName"`
 */
export const useBettingMatchReadMatchName = /*#__PURE__*/ createUseReadContract(
  { abi: bettingMatchAbi, functionName: 'matchName' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"maxAllowedOdds"`
 */
export const useBettingMatchReadMaxAllowedOdds =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'maxAllowedOdds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"owner"`
 */
export const useBettingMatchReadOwner = /*#__PURE__*/ createUseReadContract({
  abi: bettingMatchAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"paused"`
 */
export const useBettingMatchReadPaused = /*#__PURE__*/ createUseReadContract({
  abi: bettingMatchAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useBettingMatchReadProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"quoteNetExposure"`
 */
export const useBettingMatchReadQuoteNetExposure =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'quoteNetExposure',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"sportType"`
 */
export const useBettingMatchReadSportType = /*#__PURE__*/ createUseReadContract(
  { abi: bettingMatchAbi, functionName: 'sportType' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useBettingMatchReadSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"usdcToken"`
 */
export const useBettingMatchReadUsdcToken = /*#__PURE__*/ createUseReadContract(
  { abi: bettingMatchAbi, functionName: 'usdcToken' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__
 */
export const useBettingMatchWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: bettingMatchAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const useBettingMatchWriteAddMarketWithLine =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const useBettingMatchWriteCancelMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"claim"`
 */
export const useBettingMatchWriteClaim = /*#__PURE__*/ createUseWriteContract({
  abi: bettingMatchAbi,
  functionName: 'claim',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"claimAll"`
 */
export const useBettingMatchWriteClaimAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'claimAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"claimRange"`
 */
export const useBettingMatchWriteClaimRange =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'claimRange',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useBettingMatchWriteClaimRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"closeMarket"`
 */
export const useBettingMatchWriteCloseMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const useBettingMatchWriteCloseMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useBettingMatchWriteEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"grantRole"`
 */
export const useBettingMatchWriteGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"openMarket"`
 */
export const useBettingMatchWriteOpenMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const useBettingMatchWriteOpenMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const useBettingMatchWritePlaceBetUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const useBettingMatchWritePlaceBetUsdcFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useBettingMatchWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useBettingMatchWriteRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const useBettingMatchWriteResolveMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const useBettingMatchWriteResolveMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useBettingMatchWriteRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"setLiquidityPool"`
 */
export const useBettingMatchWriteSetLiquidityPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'setLiquidityPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"setMarketOdds"`
 */
export const useBettingMatchWriteSetMarketOdds =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'setMarketOdds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"setMaxAllowedOdds"`
 */
export const useBettingMatchWriteSetMaxAllowedOdds =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'setMaxAllowedOdds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useBettingMatchWriteSetUsdcToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const useBettingMatchWriteSuspendMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useBettingMatchWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"unpause"`
 */
export const useBettingMatchWriteUnpause = /*#__PURE__*/ createUseWriteContract(
  { abi: bettingMatchAbi, functionName: 'unpause' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useBettingMatchWriteUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__
 */
export const useBettingMatchSimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: bettingMatchAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const useBettingMatchSimulateAddMarketWithLine =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const useBettingMatchSimulateCancelMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"claim"`
 */
export const useBettingMatchSimulateClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"claimAll"`
 */
export const useBettingMatchSimulateClaimAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'claimAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"claimRange"`
 */
export const useBettingMatchSimulateClaimRange =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'claimRange',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useBettingMatchSimulateClaimRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"closeMarket"`
 */
export const useBettingMatchSimulateCloseMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const useBettingMatchSimulateCloseMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useBettingMatchSimulateEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"grantRole"`
 */
export const useBettingMatchSimulateGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"openMarket"`
 */
export const useBettingMatchSimulateOpenMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const useBettingMatchSimulateOpenMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const useBettingMatchSimulatePlaceBetUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const useBettingMatchSimulatePlaceBetUsdcFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useBettingMatchSimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useBettingMatchSimulateRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const useBettingMatchSimulateResolveMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const useBettingMatchSimulateResolveMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useBettingMatchSimulateRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"setLiquidityPool"`
 */
export const useBettingMatchSimulateSetLiquidityPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'setLiquidityPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"setMarketOdds"`
 */
export const useBettingMatchSimulateSetMarketOdds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'setMarketOdds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"setMaxAllowedOdds"`
 */
export const useBettingMatchSimulateSetMaxAllowedOdds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'setMaxAllowedOdds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useBettingMatchSimulateSetUsdcToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const useBettingMatchSimulateSuspendMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useBettingMatchSimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"unpause"`
 */
export const useBettingMatchSimulateUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useBettingMatchSimulateUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__
 */
export const useBettingMatchWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: bettingMatchAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"BetPlaced"`
 */
export const useBettingMatchWatchBetPlaced =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'BetPlaced',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"Initialized"`
 */
export const useBettingMatchWatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"LiquidityPoolSet"`
 */
export const useBettingMatchWatchLiquidityPoolSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'LiquidityPoolSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"MarketCancelled"`
 */
export const useBettingMatchWatchMarketCancelled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'MarketCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"MarketCreated"`
 */
export const useBettingMatchWatchMarketCreated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'MarketCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"MarketResolved"`
 */
export const useBettingMatchWatchMarketResolved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'MarketResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"MarketStateChanged"`
 */
export const useBettingMatchWatchMarketStateChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'MarketStateChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"MatchInitialized"`
 */
export const useBettingMatchWatchMatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'MatchInitialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"MaxAllowedOddsSet"`
 */
export const useBettingMatchWatchMaxAllowedOddsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'MaxAllowedOddsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"OddsUpdated"`
 */
export const useBettingMatchWatchOddsUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'OddsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useBettingMatchWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"Paused"`
 */
export const useBettingMatchWatchPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"Payout"`
 */
export const useBettingMatchWatchPayout =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'Payout',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"Refund"`
 */
export const useBettingMatchWatchRefund =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'Refund',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useBettingMatchWatchRoleAdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useBettingMatchWatchRoleGranted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useBettingMatchWatchRoleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"USDCTokenSet"`
 */
export const useBettingMatchWatchUsdcTokenSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'USDCTokenSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useBettingMatchWatchUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useBettingMatchWatchUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__
 */
export const useBettingMatchFactoryReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: bettingMatchFactoryAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"BASKETBALL"`
 */
export const useBettingMatchFactoryReadBasketball =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'BASKETBALL',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"FOOTBALL"`
 */
export const useBettingMatchFactoryReadFootball =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'FOOTBALL',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"allMatches"`
 */
export const useBettingMatchFactoryReadAllMatches =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'allMatches',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"basketballImplementation"`
 */
export const useBettingMatchFactoryReadBasketballImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'basketballImplementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"footballImplementation"`
 */
export const useBettingMatchFactoryReadFootballImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'footballImplementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"getAllMatches"`
 */
export const useBettingMatchFactoryReadGetAllMatches =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'getAllMatches',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"getSportType"`
 */
export const useBettingMatchFactoryReadGetSportType =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'getSportType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"implementations"`
 */
export const useBettingMatchFactoryReadImplementations =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'implementations',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"isMatch"`
 */
export const useBettingMatchFactoryReadIsMatch =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'isMatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"liquidityPool"`
 */
export const useBettingMatchFactoryReadLiquidityPool =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'liquidityPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"matchSportType"`
 */
export const useBettingMatchFactoryReadMatchSportType =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'matchSportType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const useBettingMatchFactoryReadOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"swapRouter"`
 */
export const useBettingMatchFactoryReadSwapRouter =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'swapRouter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"usdcToken"`
 */
export const useBettingMatchFactoryReadUsdcToken =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'usdcToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__
 */
export const useBettingMatchFactoryWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: bettingMatchFactoryAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"createBasketballMatch"`
 */
export const useBettingMatchFactoryWriteCreateBasketballMatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'createBasketballMatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"createFootballMatch"`
 */
export const useBettingMatchFactoryWriteCreateFootballMatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'createFootballMatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useBettingMatchFactoryWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"setBasketballImplementation"`
 */
export const useBettingMatchFactoryWriteSetBasketballImplementation =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'setBasketballImplementation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"setFootballImplementation"`
 */
export const useBettingMatchFactoryWriteSetFootballImplementation =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'setFootballImplementation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"setWiring"`
 */
export const useBettingMatchFactoryWriteSetWiring =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'setWiring',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useBettingMatchFactoryWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__
 */
export const useBettingMatchFactorySimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: bettingMatchFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"createBasketballMatch"`
 */
export const useBettingMatchFactorySimulateCreateBasketballMatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'createBasketballMatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"createFootballMatch"`
 */
export const useBettingMatchFactorySimulateCreateFootballMatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'createFootballMatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useBettingMatchFactorySimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"setBasketballImplementation"`
 */
export const useBettingMatchFactorySimulateSetBasketballImplementation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'setBasketballImplementation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"setFootballImplementation"`
 */
export const useBettingMatchFactorySimulateSetFootballImplementation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'setFootballImplementation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"setWiring"`
 */
export const useBettingMatchFactorySimulateSetWiring =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'setWiring',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useBettingMatchFactorySimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchFactoryAbi}__
 */
export const useBettingMatchFactoryWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: bettingMatchFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `eventName` set to `"BasketballImplementationUpdated"`
 */
export const useBettingMatchFactoryWatchBasketballImplementationUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchFactoryAbi,
    eventName: 'BasketballImplementationUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `eventName` set to `"FootballImplementationUpdated"`
 */
export const useBettingMatchFactoryWatchFootballImplementationUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchFactoryAbi,
    eventName: 'FootballImplementationUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `eventName` set to `"MatchCreated"`
 */
export const useBettingMatchFactoryWatchMatchCreated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchFactoryAbi,
    eventName: 'MatchCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useBettingMatchFactoryWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchFactoryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `eventName` set to `"WiringSet"`
 */
export const useBettingMatchFactoryWatchWiringSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bettingMatchFactoryAbi,
    eventName: 'WiringSet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__
 */
export const useChilizSwapRouterReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: chilizSwapRouterAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"bettingMatchFactory"`
 */
export const useChilizSwapRouterReadBettingMatchFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: chilizSwapRouterAbi,
    functionName: 'bettingMatchFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"liquidityPool"`
 */
export const useChilizSwapRouterReadLiquidityPool =
  /*#__PURE__*/ createUseReadContract({
    abi: chilizSwapRouterAbi,
    functionName: 'liquidityPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"masterRouter"`
 */
export const useChilizSwapRouterReadMasterRouter =
  /*#__PURE__*/ createUseReadContract({
    abi: chilizSwapRouterAbi,
    functionName: 'masterRouter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"owner"`
 */
export const useChilizSwapRouterReadOwner = /*#__PURE__*/ createUseReadContract(
  { abi: chilizSwapRouterAbi, functionName: 'owner' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"platformFeeBps"`
 */
export const useChilizSwapRouterReadPlatformFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: chilizSwapRouterAbi,
    functionName: 'platformFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"streamWalletFactory"`
 */
export const useChilizSwapRouterReadStreamWalletFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: chilizSwapRouterAbi,
    functionName: 'streamWalletFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"tokenRouter"`
 */
export const useChilizSwapRouterReadTokenRouter =
  /*#__PURE__*/ createUseReadContract({
    abi: chilizSwapRouterAbi,
    functionName: 'tokenRouter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"treasury"`
 */
export const useChilizSwapRouterReadTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: chilizSwapRouterAbi,
    functionName: 'treasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"usdc"`
 */
export const useChilizSwapRouterReadUsdc = /*#__PURE__*/ createUseReadContract({
  abi: chilizSwapRouterAbi,
  functionName: 'usdc',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"wchz"`
 */
export const useChilizSwapRouterReadWchz = /*#__PURE__*/ createUseReadContract({
  abi: chilizSwapRouterAbi,
  functionName: 'wchz',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__
 */
export const useChilizSwapRouterWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: chilizSwapRouterAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"depositLiquidityWithCHZ"`
 */
export const useChilizSwapRouterWriteDepositLiquidityWithChz =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'depositLiquidityWithCHZ',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"depositLiquidityWithToken"`
 */
export const useChilizSwapRouterWriteDepositLiquidityWithToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'depositLiquidityWithToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"depositLiquidityWithUSDC"`
 */
export const useChilizSwapRouterWriteDepositLiquidityWithUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'depositLiquidityWithUSDC',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"donateWithCHZ"`
 */
export const useChilizSwapRouterWriteDonateWithChz =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'donateWithCHZ',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"donateWithToken"`
 */
export const useChilizSwapRouterWriteDonateWithToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'donateWithToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"donateWithUSDC"`
 */
export const useChilizSwapRouterWriteDonateWithUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'donateWithUSDC',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"placeBetWithCHZ"`
 */
export const useChilizSwapRouterWritePlaceBetWithChz =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'placeBetWithCHZ',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"placeBetWithToken"`
 */
export const useChilizSwapRouterWritePlaceBetWithToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'placeBetWithToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"placeBetWithUSDC"`
 */
export const useChilizSwapRouterWritePlaceBetWithUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'placeBetWithUSDC',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useChilizSwapRouterWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"setLiquidityPool"`
 */
export const useChilizSwapRouterWriteSetLiquidityPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'setLiquidityPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"setMatchFactory"`
 */
export const useChilizSwapRouterWriteSetMatchFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'setMatchFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"setPlatformFeeBps"`
 */
export const useChilizSwapRouterWriteSetPlatformFeeBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'setPlatformFeeBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"setStreamWalletFactory"`
 */
export const useChilizSwapRouterWriteSetStreamWalletFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'setStreamWalletFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useChilizSwapRouterWriteSetTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"subscribeWithCHZ"`
 */
export const useChilizSwapRouterWriteSubscribeWithChz =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'subscribeWithCHZ',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"subscribeWithToken"`
 */
export const useChilizSwapRouterWriteSubscribeWithToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'subscribeWithToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"subscribeWithUSDC"`
 */
export const useChilizSwapRouterWriteSubscribeWithUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'subscribeWithUSDC',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useChilizSwapRouterWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: chilizSwapRouterAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__
 */
export const useChilizSwapRouterSimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: chilizSwapRouterAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"depositLiquidityWithCHZ"`
 */
export const useChilizSwapRouterSimulateDepositLiquidityWithChz =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'depositLiquidityWithCHZ',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"depositLiquidityWithToken"`
 */
export const useChilizSwapRouterSimulateDepositLiquidityWithToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'depositLiquidityWithToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"depositLiquidityWithUSDC"`
 */
export const useChilizSwapRouterSimulateDepositLiquidityWithUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'depositLiquidityWithUSDC',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"donateWithCHZ"`
 */
export const useChilizSwapRouterSimulateDonateWithChz =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'donateWithCHZ',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"donateWithToken"`
 */
export const useChilizSwapRouterSimulateDonateWithToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'donateWithToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"donateWithUSDC"`
 */
export const useChilizSwapRouterSimulateDonateWithUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'donateWithUSDC',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"placeBetWithCHZ"`
 */
export const useChilizSwapRouterSimulatePlaceBetWithChz =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'placeBetWithCHZ',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"placeBetWithToken"`
 */
export const useChilizSwapRouterSimulatePlaceBetWithToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'placeBetWithToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"placeBetWithUSDC"`
 */
export const useChilizSwapRouterSimulatePlaceBetWithUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'placeBetWithUSDC',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useChilizSwapRouterSimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"setLiquidityPool"`
 */
export const useChilizSwapRouterSimulateSetLiquidityPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'setLiquidityPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"setMatchFactory"`
 */
export const useChilizSwapRouterSimulateSetMatchFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'setMatchFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"setPlatformFeeBps"`
 */
export const useChilizSwapRouterSimulateSetPlatformFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'setPlatformFeeBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"setStreamWalletFactory"`
 */
export const useChilizSwapRouterSimulateSetStreamWalletFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'setStreamWalletFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useChilizSwapRouterSimulateSetTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"subscribeWithCHZ"`
 */
export const useChilizSwapRouterSimulateSubscribeWithChz =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'subscribeWithCHZ',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"subscribeWithToken"`
 */
export const useChilizSwapRouterSimulateSubscribeWithToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'subscribeWithToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"subscribeWithUSDC"`
 */
export const useChilizSwapRouterSimulateSubscribeWithUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'subscribeWithUSDC',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useChilizSwapRouterSimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: chilizSwapRouterAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__
 */
export const useChilizSwapRouterWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: chilizSwapRouterAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"BetPlacedViaCHZ"`
 */
export const useChilizSwapRouterWatchBetPlacedViaChz =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'BetPlacedViaCHZ',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"BetPlacedViaToken"`
 */
export const useChilizSwapRouterWatchBetPlacedViaToken =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'BetPlacedViaToken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"BetPlacedWithUSDC"`
 */
export const useChilizSwapRouterWatchBetPlacedWithUsdc =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'BetPlacedWithUSDC',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"DonationWithCHZ"`
 */
export const useChilizSwapRouterWatchDonationWithChz =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'DonationWithCHZ',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"DonationWithToken"`
 */
export const useChilizSwapRouterWatchDonationWithToken =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'DonationWithToken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"DonationWithUSDCEvent"`
 */
export const useChilizSwapRouterWatchDonationWithUsdcEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'DonationWithUSDCEvent',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"LiquidityDepositedWithCHZ"`
 */
export const useChilizSwapRouterWatchLiquidityDepositedWithChz =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'LiquidityDepositedWithCHZ',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"LiquidityDepositedWithToken"`
 */
export const useChilizSwapRouterWatchLiquidityDepositedWithToken =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'LiquidityDepositedWithToken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"LiquidityDepositedWithUSDC"`
 */
export const useChilizSwapRouterWatchLiquidityDepositedWithUsdc =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'LiquidityDepositedWithUSDC',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"LiquidityPoolSet"`
 */
export const useChilizSwapRouterWatchLiquidityPoolSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'LiquidityPoolSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"MatchFactorySet"`
 */
export const useChilizSwapRouterWatchMatchFactorySet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'MatchFactorySet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useChilizSwapRouterWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"PlatformFeeBpsSet"`
 */
export const useChilizSwapRouterWatchPlatformFeeBpsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'PlatformFeeBpsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"StreamWalletFactorySet"`
 */
export const useChilizSwapRouterWatchStreamWalletFactorySet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'StreamWalletFactorySet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"SubscriptionWithCHZ"`
 */
export const useChilizSwapRouterWatchSubscriptionWithChz =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'SubscriptionWithCHZ',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"SubscriptionWithToken"`
 */
export const useChilizSwapRouterWatchSubscriptionWithToken =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'SubscriptionWithToken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"SubscriptionWithUSDCEvent"`
 */
export const useChilizSwapRouterWatchSubscriptionWithUsdcEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'SubscriptionWithUSDCEvent',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link chilizSwapRouterAbi}__ and `eventName` set to `"TreasurySet"`
 */
export const useChilizSwapRouterWatchTreasurySet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: chilizSwapRouterAbi,
    eventName: 'TreasurySet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__
 */
export const useFootballMatchReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: footballMatchAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useFootballMatchReadAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useFootballMatchReadDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"MARKET_BOTH_SCORE"`
 */
export const useFootballMatchReadMarketBothScore =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'MARKET_BOTH_SCORE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"MARKET_CORRECT_SCORE"`
 */
export const useFootballMatchReadMarketCorrectScore =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'MARKET_CORRECT_SCORE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"MARKET_FIRST_SCORER"`
 */
export const useFootballMatchReadMarketFirstScorer =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'MARKET_FIRST_SCORER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"MARKET_GOALS_TOTAL"`
 */
export const useFootballMatchReadMarketGoalsTotal =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'MARKET_GOALS_TOTAL',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"MARKET_HALFTIME"`
 */
export const useFootballMatchReadMarketHalftime =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'MARKET_HALFTIME',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"MARKET_WINNER"`
 */
export const useFootballMatchReadMarketWinner =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'MARKET_WINNER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"MAX_ODDS"`
 */
export const useFootballMatchReadMaxOdds = /*#__PURE__*/ createUseReadContract({
  abi: footballMatchAbi,
  functionName: 'MAX_ODDS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"MIN_NET_STAKE"`
 */
export const useFootballMatchReadMinNetStake =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'MIN_NET_STAKE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"MIN_ODDS"`
 */
export const useFootballMatchReadMinOdds = /*#__PURE__*/ createUseReadContract({
  abi: footballMatchAbi,
  functionName: 'MIN_ODDS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"ODDS_PRECISION"`
 */
export const useFootballMatchReadOddsPrecision =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'ODDS_PRECISION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"ODDS_SETTER_ROLE"`
 */
export const useFootballMatchReadOddsSetterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'ODDS_SETTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useFootballMatchReadPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"RESOLVER_ROLE"`
 */
export const useFootballMatchReadResolverRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'RESOLVER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"SWAP_ROUTER_ROLE"`
 */
export const useFootballMatchReadSwapRouterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'SWAP_ROUTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useFootballMatchReadUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"footballMarkets"`
 */
export const useFootballMatchReadFootballMarkets =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'footballMarkets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"getBetDetails"`
 */
export const useFootballMatchReadGetBetDetails =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'getBetDetails',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"getCurrentOdds"`
 */
export const useFootballMatchReadGetCurrentOdds =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'getCurrentOdds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"getFootballMarket"`
 */
export const useFootballMatchReadGetFootballMarket =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'getFootballMarket',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"getMarketCore"`
 */
export const useFootballMatchReadGetMarketCore =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'getMarketCore',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"getMarketInfo"`
 */
export const useFootballMatchReadGetMarketInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'getMarketInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"getMarketLiability"`
 */
export const useFootballMatchReadGetMarketLiability =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'getMarketLiability',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"getOddsHistory"`
 */
export const useFootballMatchReadGetOddsHistory =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'getOddsHistory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useFootballMatchReadGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"getUserBets"`
 */
export const useFootballMatchReadGetUserBets =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'getUserBets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"hasRole"`
 */
export const useFootballMatchReadHasRole = /*#__PURE__*/ createUseReadContract({
  abi: footballMatchAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"liquidityPool"`
 */
export const useFootballMatchReadLiquidityPool =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'liquidityPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"marketCount"`
 */
export const useFootballMatchReadMarketCount =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'marketCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"matchName"`
 */
export const useFootballMatchReadMatchName =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'matchName',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"maxAllowedOdds"`
 */
export const useFootballMatchReadMaxAllowedOdds =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'maxAllowedOdds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"owner"`
 */
export const useFootballMatchReadOwner = /*#__PURE__*/ createUseReadContract({
  abi: footballMatchAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"paused"`
 */
export const useFootballMatchReadPaused = /*#__PURE__*/ createUseReadContract({
  abi: footballMatchAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useFootballMatchReadProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"quoteNetExposure"`
 */
export const useFootballMatchReadQuoteNetExposure =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'quoteNetExposure',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"sportType"`
 */
export const useFootballMatchReadSportType =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'sportType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useFootballMatchReadSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"usdcToken"`
 */
export const useFootballMatchReadUsdcToken =
  /*#__PURE__*/ createUseReadContract({
    abi: footballMatchAbi,
    functionName: 'usdcToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__
 */
export const useFootballMatchWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: footballMatchAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const useFootballMatchWriteAddMarketWithLine =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"addMarketsBatch"`
 */
export const useFootballMatchWriteAddMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'addMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const useFootballMatchWriteCancelMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"claim"`
 */
export const useFootballMatchWriteClaim = /*#__PURE__*/ createUseWriteContract({
  abi: footballMatchAbi,
  functionName: 'claim',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"claimAll"`
 */
export const useFootballMatchWriteClaimAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'claimAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"claimRange"`
 */
export const useFootballMatchWriteClaimRange =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'claimRange',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useFootballMatchWriteClaimRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"closeMarket"`
 */
export const useFootballMatchWriteCloseMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const useFootballMatchWriteCloseMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useFootballMatchWriteEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"grantRole"`
 */
export const useFootballMatchWriteGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"initialize"`
 */
export const useFootballMatchWriteInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"openMarket"`
 */
export const useFootballMatchWriteOpenMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const useFootballMatchWriteOpenMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const useFootballMatchWritePlaceBetUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const useFootballMatchWritePlaceBetUsdcFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useFootballMatchWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useFootballMatchWriteRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const useFootballMatchWriteResolveMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const useFootballMatchWriteResolveMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useFootballMatchWriteRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"setLiquidityPool"`
 */
export const useFootballMatchWriteSetLiquidityPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'setLiquidityPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"setMarketOdds"`
 */
export const useFootballMatchWriteSetMarketOdds =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'setMarketOdds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"setMaxAllowedOdds"`
 */
export const useFootballMatchWriteSetMaxAllowedOdds =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'setMaxAllowedOdds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useFootballMatchWriteSetUsdcToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const useFootballMatchWriteSuspendMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useFootballMatchWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"unpause"`
 */
export const useFootballMatchWriteUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useFootballMatchWriteUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballMatchAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__
 */
export const useFootballMatchSimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: footballMatchAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const useFootballMatchSimulateAddMarketWithLine =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"addMarketsBatch"`
 */
export const useFootballMatchSimulateAddMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'addMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const useFootballMatchSimulateCancelMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"claim"`
 */
export const useFootballMatchSimulateClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"claimAll"`
 */
export const useFootballMatchSimulateClaimAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'claimAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"claimRange"`
 */
export const useFootballMatchSimulateClaimRange =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'claimRange',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useFootballMatchSimulateClaimRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"closeMarket"`
 */
export const useFootballMatchSimulateCloseMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const useFootballMatchSimulateCloseMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useFootballMatchSimulateEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"grantRole"`
 */
export const useFootballMatchSimulateGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"initialize"`
 */
export const useFootballMatchSimulateInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"openMarket"`
 */
export const useFootballMatchSimulateOpenMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const useFootballMatchSimulateOpenMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const useFootballMatchSimulatePlaceBetUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const useFootballMatchSimulatePlaceBetUsdcFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useFootballMatchSimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useFootballMatchSimulateRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const useFootballMatchSimulateResolveMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const useFootballMatchSimulateResolveMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useFootballMatchSimulateRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"setLiquidityPool"`
 */
export const useFootballMatchSimulateSetLiquidityPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'setLiquidityPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"setMarketOdds"`
 */
export const useFootballMatchSimulateSetMarketOdds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'setMarketOdds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"setMaxAllowedOdds"`
 */
export const useFootballMatchSimulateSetMaxAllowedOdds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'setMaxAllowedOdds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useFootballMatchSimulateSetUsdcToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const useFootballMatchSimulateSuspendMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useFootballMatchSimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"unpause"`
 */
export const useFootballMatchSimulateUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballMatchAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useFootballMatchSimulateUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballMatchAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__
 */
export const useFootballMatchWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: footballMatchAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"BetPlaced"`
 */
export const useFootballMatchWatchBetPlaced =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'BetPlaced',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"Initialized"`
 */
export const useFootballMatchWatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"LiquidityPoolSet"`
 */
export const useFootballMatchWatchLiquidityPoolSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'LiquidityPoolSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"MarketCancelled"`
 */
export const useFootballMatchWatchMarketCancelled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'MarketCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"MarketCreated"`
 */
export const useFootballMatchWatchMarketCreated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'MarketCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"MarketResolved"`
 */
export const useFootballMatchWatchMarketResolved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'MarketResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"MarketStateChanged"`
 */
export const useFootballMatchWatchMarketStateChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'MarketStateChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"MatchInitialized"`
 */
export const useFootballMatchWatchMatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'MatchInitialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"MaxAllowedOddsSet"`
 */
export const useFootballMatchWatchMaxAllowedOddsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'MaxAllowedOddsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"OddsUpdated"`
 */
export const useFootballMatchWatchOddsUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'OddsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useFootballMatchWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"Paused"`
 */
export const useFootballMatchWatchPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"Payout"`
 */
export const useFootballMatchWatchPayout =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'Payout',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"Refund"`
 */
export const useFootballMatchWatchRefund =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'Refund',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useFootballMatchWatchRoleAdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useFootballMatchWatchRoleGranted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useFootballMatchWatchRoleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"USDCTokenSet"`
 */
export const useFootballMatchWatchUsdcTokenSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'USDCTokenSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useFootballMatchWatchUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballMatchAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useFootballMatchWatchUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballMatchAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__
 */
export const useLiquidityPoolReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: liquidityPoolAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"BPS_DENOMINATOR"`
 */
export const useLiquidityPoolReadBpsDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'BPS_DENOMINATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useLiquidityPoolReadDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"LP_WITHDRAWAL_FEE_BPS_MAX"`
 */
export const useLiquidityPoolReadLpWithdrawalFeeBpsMax =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'LP_WITHDRAWAL_FEE_BPS_MAX',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"MATCH_AUTHORIZER_ROLE"`
 */
export const useLiquidityPoolReadMatchAuthorizerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'MATCH_AUTHORIZER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"MATCH_ROLE"`
 */
export const useLiquidityPoolReadMatchRole =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'MATCH_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"MAX_BPS_SETTABLE"`
 */
export const useLiquidityPoolReadMaxBpsSettable =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'MAX_BPS_SETTABLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useLiquidityPoolReadPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"ROUTER_ROLE"`
 */
export const useLiquidityPoolReadRouterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'ROUTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"TREASURY_SHARE_BPS_MAX"`
 */
export const useLiquidityPoolReadTreasuryShareBpsMax =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'TREASURY_SHARE_BPS_MAX',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useLiquidityPoolReadUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"accruedTreasury"`
 */
export const useLiquidityPoolReadAccruedTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'accruedTreasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"allowance"`
 */
export const useLiquidityPoolReadAllowance =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'allowance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"asset"`
 */
export const useLiquidityPoolReadAsset = /*#__PURE__*/ createUseReadContract({
  abi: liquidityPoolAbi,
  functionName: 'asset',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useLiquidityPoolReadBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"convertToAssets"`
 */
export const useLiquidityPoolReadConvertToAssets =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'convertToAssets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"convertToShares"`
 */
export const useLiquidityPoolReadConvertToShares =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'convertToShares',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"costBasis"`
 */
export const useLiquidityPoolReadCostBasis =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'costBasis',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"decimals"`
 */
export const useLiquidityPoolReadDecimals = /*#__PURE__*/ createUseReadContract(
  { abi: liquidityPoolAbi, functionName: 'decimals' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"depositCooldownSeconds"`
 */
export const useLiquidityPoolReadDepositCooldownSeconds =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'depositCooldownSeconds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"freeBalance"`
 */
export const useLiquidityPoolReadFreeBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'freeBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useLiquidityPoolReadGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"hasRole"`
 */
export const useLiquidityPoolReadHasRole = /*#__PURE__*/ createUseReadContract({
  abi: liquidityPoolAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"lastDepositAt"`
 */
export const useLiquidityPoolReadLastDepositAt =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'lastDepositAt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"lpWithdrawalFeeBps"`
 */
export const useLiquidityPoolReadLpWithdrawalFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'lpWithdrawalFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"marketLiability"`
 */
export const useLiquidityPoolReadMarketLiability =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'marketLiability',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"matchLiability"`
 */
export const useLiquidityPoolReadMatchLiability =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'matchLiability',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"maxBetAmount"`
 */
export const useLiquidityPoolReadMaxBetAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'maxBetAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"maxDeposit"`
 */
export const useLiquidityPoolReadMaxDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'maxDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"maxLiabilityPerMarketBps"`
 */
export const useLiquidityPoolReadMaxLiabilityPerMarketBps =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'maxLiabilityPerMarketBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"maxLiabilityPerMatchBps"`
 */
export const useLiquidityPoolReadMaxLiabilityPerMatchBps =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'maxLiabilityPerMatchBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"maxMint"`
 */
export const useLiquidityPoolReadMaxMint = /*#__PURE__*/ createUseReadContract({
  abi: liquidityPoolAbi,
  functionName: 'maxMint',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"maxRedeem"`
 */
export const useLiquidityPoolReadMaxRedeem =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'maxRedeem',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"maxWithdraw"`
 */
export const useLiquidityPoolReadMaxWithdraw =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'maxWithdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"name"`
 */
export const useLiquidityPoolReadName = /*#__PURE__*/ createUseReadContract({
  abi: liquidityPoolAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"paused"`
 */
export const useLiquidityPoolReadPaused = /*#__PURE__*/ createUseReadContract({
  abi: liquidityPoolAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"pendingTreasury"`
 */
export const useLiquidityPoolReadPendingTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'pendingTreasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"previewDeposit"`
 */
export const useLiquidityPoolReadPreviewDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'previewDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"previewMint"`
 */
export const useLiquidityPoolReadPreviewMint =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'previewMint',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"previewRedeem"`
 */
export const useLiquidityPoolReadPreviewRedeem =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'previewRedeem',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"previewWithdraw"`
 */
export const useLiquidityPoolReadPreviewWithdraw =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'previewWithdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"protocolFeeBps"`
 */
export const useLiquidityPoolReadProtocolFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'protocolFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useLiquidityPoolReadProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useLiquidityPoolReadSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"symbol"`
 */
export const useLiquidityPoolReadSymbol = /*#__PURE__*/ createUseReadContract({
  abi: liquidityPoolAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"totalAssets"`
 */
export const useLiquidityPoolReadTotalAssets =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'totalAssets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"totalLiabilities"`
 */
export const useLiquidityPoolReadTotalLiabilities =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'totalLiabilities',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useLiquidityPoolReadTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"treasury"`
 */
export const useLiquidityPoolReadTreasury = /*#__PURE__*/ createUseReadContract(
  { abi: liquidityPoolAbi, functionName: 'treasury' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"treasuryShareBps"`
 */
export const useLiquidityPoolReadTreasuryShareBps =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'treasuryShareBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"treasuryWithdrawable"`
 */
export const useLiquidityPoolReadTreasuryWithdrawable =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'treasuryWithdrawable',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"utilization"`
 */
export const useLiquidityPoolReadUtilization =
  /*#__PURE__*/ createUseReadContract({
    abi: liquidityPoolAbi,
    functionName: 'utilization',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__
 */
export const useLiquidityPoolWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: liquidityPoolAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"acceptTreasury"`
 */
export const useLiquidityPoolWriteAcceptTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'acceptTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"approve"`
 */
export const useLiquidityPoolWriteApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"authorizeMatch"`
 */
export const useLiquidityPoolWriteAuthorizeMatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'authorizeMatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"cancelTreasuryProposal"`
 */
export const useLiquidityPoolWriteCancelTreasuryProposal =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'cancelTreasuryProposal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"deposit"`
 */
export const useLiquidityPoolWriteDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"grantRole"`
 */
export const useLiquidityPoolWriteGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const useLiquidityPoolWriteInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"mint"`
 */
export const useLiquidityPoolWriteMint = /*#__PURE__*/ createUseWriteContract({
  abi: liquidityPoolAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"pause"`
 */
export const useLiquidityPoolWritePause = /*#__PURE__*/ createUseWriteContract({
  abi: liquidityPoolAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"payRefund"`
 */
export const useLiquidityPoolWritePayRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'payRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"payWinner"`
 */
export const useLiquidityPoolWritePayWinner =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'payWinner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"proposeTreasury"`
 */
export const useLiquidityPoolWriteProposeTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'proposeTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"recordBet"`
 */
export const useLiquidityPoolWriteRecordBet =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'recordBet',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"redeem"`
 */
export const useLiquidityPoolWriteRedeem = /*#__PURE__*/ createUseWriteContract(
  { abi: liquidityPoolAbi, functionName: 'redeem' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useLiquidityPoolWriteRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"revokeMatch"`
 */
export const useLiquidityPoolWriteRevokeMatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'revokeMatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useLiquidityPoolWriteRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setDepositCooldownSeconds"`
 */
export const useLiquidityPoolWriteSetDepositCooldownSeconds =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'setDepositCooldownSeconds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setLpWithdrawalFeeBps"`
 */
export const useLiquidityPoolWriteSetLpWithdrawalFeeBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'setLpWithdrawalFeeBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setMaxBetAmount"`
 */
export const useLiquidityPoolWriteSetMaxBetAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'setMaxBetAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setMaxLiabilityPerMarketBps"`
 */
export const useLiquidityPoolWriteSetMaxLiabilityPerMarketBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'setMaxLiabilityPerMarketBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setMaxLiabilityPerMatchBps"`
 */
export const useLiquidityPoolWriteSetMaxLiabilityPerMatchBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'setMaxLiabilityPerMatchBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setProtocolFeeBps"`
 */
export const useLiquidityPoolWriteSetProtocolFeeBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'setProtocolFeeBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setTreasuryShareBps"`
 */
export const useLiquidityPoolWriteSetTreasuryShareBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'setTreasuryShareBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"settleMarket"`
 */
export const useLiquidityPoolWriteSettleMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'settleMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"transfer"`
 */
export const useLiquidityPoolWriteTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useLiquidityPoolWriteTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"unpause"`
 */
export const useLiquidityPoolWriteUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useLiquidityPoolWriteUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"withdraw"`
 */
export const useLiquidityPoolWriteWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"withdrawTreasury"`
 */
export const useLiquidityPoolWriteWithdrawTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: liquidityPoolAbi,
    functionName: 'withdrawTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__
 */
export const useLiquidityPoolSimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: liquidityPoolAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"acceptTreasury"`
 */
export const useLiquidityPoolSimulateAcceptTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'acceptTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"approve"`
 */
export const useLiquidityPoolSimulateApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"authorizeMatch"`
 */
export const useLiquidityPoolSimulateAuthorizeMatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'authorizeMatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"cancelTreasuryProposal"`
 */
export const useLiquidityPoolSimulateCancelTreasuryProposal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'cancelTreasuryProposal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"deposit"`
 */
export const useLiquidityPoolSimulateDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"grantRole"`
 */
export const useLiquidityPoolSimulateGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const useLiquidityPoolSimulateInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"mint"`
 */
export const useLiquidityPoolSimulateMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"pause"`
 */
export const useLiquidityPoolSimulatePause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"payRefund"`
 */
export const useLiquidityPoolSimulatePayRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'payRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"payWinner"`
 */
export const useLiquidityPoolSimulatePayWinner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'payWinner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"proposeTreasury"`
 */
export const useLiquidityPoolSimulateProposeTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'proposeTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"recordBet"`
 */
export const useLiquidityPoolSimulateRecordBet =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'recordBet',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"redeem"`
 */
export const useLiquidityPoolSimulateRedeem =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'redeem',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useLiquidityPoolSimulateRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"revokeMatch"`
 */
export const useLiquidityPoolSimulateRevokeMatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'revokeMatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useLiquidityPoolSimulateRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setDepositCooldownSeconds"`
 */
export const useLiquidityPoolSimulateSetDepositCooldownSeconds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'setDepositCooldownSeconds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setLpWithdrawalFeeBps"`
 */
export const useLiquidityPoolSimulateSetLpWithdrawalFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'setLpWithdrawalFeeBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setMaxBetAmount"`
 */
export const useLiquidityPoolSimulateSetMaxBetAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'setMaxBetAmount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setMaxLiabilityPerMarketBps"`
 */
export const useLiquidityPoolSimulateSetMaxLiabilityPerMarketBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'setMaxLiabilityPerMarketBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setMaxLiabilityPerMatchBps"`
 */
export const useLiquidityPoolSimulateSetMaxLiabilityPerMatchBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'setMaxLiabilityPerMatchBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setProtocolFeeBps"`
 */
export const useLiquidityPoolSimulateSetProtocolFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'setProtocolFeeBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"setTreasuryShareBps"`
 */
export const useLiquidityPoolSimulateSetTreasuryShareBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'setTreasuryShareBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"settleMarket"`
 */
export const useLiquidityPoolSimulateSettleMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'settleMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"transfer"`
 */
export const useLiquidityPoolSimulateTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useLiquidityPoolSimulateTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"unpause"`
 */
export const useLiquidityPoolSimulateUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useLiquidityPoolSimulateUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"withdraw"`
 */
export const useLiquidityPoolSimulateWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link liquidityPoolAbi}__ and `functionName` set to `"withdrawTreasury"`
 */
export const useLiquidityPoolSimulateWithdrawTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: liquidityPoolAbi,
    functionName: 'withdrawTreasury',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__
 */
export const useLiquidityPoolWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: liquidityPoolAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"Approval"`
 */
export const useLiquidityPoolWatchApproval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"BetRecorded"`
 */
export const useLiquidityPoolWatchBetRecorded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'BetRecorded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"Deposit"`
 */
export const useLiquidityPoolWatchDeposit =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"DepositCooldownSet"`
 */
export const useLiquidityPoolWatchDepositCooldownSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'DepositCooldownSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"Initialized"`
 */
export const useLiquidityPoolWatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"LpWithdrawalFeeAccrued"`
 */
export const useLiquidityPoolWatchLpWithdrawalFeeAccrued =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'LpWithdrawalFeeAccrued',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"LpWithdrawalFeeBpsSet"`
 */
export const useLiquidityPoolWatchLpWithdrawalFeeBpsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'LpWithdrawalFeeBpsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"MarketSettled"`
 */
export const useLiquidityPoolWatchMarketSettled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'MarketSettled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"MatchAuthorized"`
 */
export const useLiquidityPoolWatchMatchAuthorized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'MatchAuthorized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"MatchRevoked"`
 */
export const useLiquidityPoolWatchMatchRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'MatchRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"MaxBetAmountSet"`
 */
export const useLiquidityPoolWatchMaxBetAmountSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'MaxBetAmountSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"MaxLiabilityPerMarketSet"`
 */
export const useLiquidityPoolWatchMaxLiabilityPerMarketSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'MaxLiabilityPerMarketSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"MaxLiabilityPerMatchSet"`
 */
export const useLiquidityPoolWatchMaxLiabilityPerMatchSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'MaxLiabilityPerMatchSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"Paused"`
 */
export const useLiquidityPoolWatchPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"ProtocolFeeSet"`
 */
export const useLiquidityPoolWatchProtocolFeeSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'ProtocolFeeSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"RefundPaid"`
 */
export const useLiquidityPoolWatchRefundPaid =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'RefundPaid',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useLiquidityPoolWatchRoleAdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useLiquidityPoolWatchRoleGranted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useLiquidityPoolWatchRoleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"Transfer"`
 */
export const useLiquidityPoolWatchTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"TreasuryAccepted"`
 */
export const useLiquidityPoolWatchTreasuryAccepted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'TreasuryAccepted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"TreasuryAccrued"`
 */
export const useLiquidityPoolWatchTreasuryAccrued =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'TreasuryAccrued',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"TreasuryProposalCancelled"`
 */
export const useLiquidityPoolWatchTreasuryProposalCancelled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'TreasuryProposalCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"TreasuryProposed"`
 */
export const useLiquidityPoolWatchTreasuryProposed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'TreasuryProposed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"TreasuryShareBpsSet"`
 */
export const useLiquidityPoolWatchTreasuryShareBpsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'TreasuryShareBpsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"TreasuryWithdrawn"`
 */
export const useLiquidityPoolWatchTreasuryWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'TreasuryWithdrawn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useLiquidityPoolWatchUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useLiquidityPoolWatchUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"WinnerPaid"`
 */
export const useLiquidityPoolWatchWinnerPaid =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'WinnerPaid',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link liquidityPoolAbi}__ and `eventName` set to `"Withdraw"`
 */
export const useLiquidityPoolWatchWithdraw =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: liquidityPoolAbi,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__
 */
export const useStreamWalletReadundefined = /*#__PURE__*/ createUseReadContract(
  { abi: streamWalletAbi },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useStreamWalletReadUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"availableBalance"`
 */
export const useStreamWalletReadAvailableBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'availableBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"factory"`
 */
export const useStreamWalletReadFactory = /*#__PURE__*/ createUseReadContract({
  abi: streamWalletAbi,
  functionName: 'factory',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"getDonationAmount"`
 */
export const useStreamWalletReadGetDonationAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'getDonationAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"getSubscription"`
 */
export const useStreamWalletReadGetSubscription =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'getSubscription',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"isSubscribed"`
 */
export const useStreamWalletReadIsSubscribed =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'isSubscribed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"kayenRouter"`
 */
export const useStreamWalletReadKayenRouter =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'kayenRouter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"lifetimeDonations"`
 */
export const useStreamWalletReadLifetimeDonations =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'lifetimeDonations',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"owner"`
 */
export const useStreamWalletReadOwner = /*#__PURE__*/ createUseReadContract({
  abi: streamWalletAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"platformFeeBps"`
 */
export const useStreamWalletReadPlatformFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'platformFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useStreamWalletReadProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"streamer"`
 */
export const useStreamWalletReadStreamer = /*#__PURE__*/ createUseReadContract({
  abi: streamWalletAbi,
  functionName: 'streamer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"subscriptions"`
 */
export const useStreamWalletReadSubscriptions =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'subscriptions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"swapRouter"`
 */
export const useStreamWalletReadSwapRouter =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'swapRouter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"totalRevenue"`
 */
export const useStreamWalletReadTotalRevenue =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'totalRevenue',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"totalSubscribers"`
 */
export const useStreamWalletReadTotalSubscribers =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'totalSubscribers',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"totalWithdrawn"`
 */
export const useStreamWalletReadTotalWithdrawn =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletAbi,
    functionName: 'totalWithdrawn',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"treasury"`
 */
export const useStreamWalletReadTreasury = /*#__PURE__*/ createUseReadContract({
  abi: streamWalletAbi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"usdc"`
 */
export const useStreamWalletReadUsdc = /*#__PURE__*/ createUseReadContract({
  abi: streamWalletAbi,
  functionName: 'usdc',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__
 */
export const useStreamWalletWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: streamWalletAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"donate"`
 */
export const useStreamWalletWriteDonate = /*#__PURE__*/ createUseWriteContract({
  abi: streamWalletAbi,
  functionName: 'donate',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"donateFor"`
 */
export const useStreamWalletWriteDonateFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'donateFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"initialize"`
 */
export const useStreamWalletWriteInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"recordDonationByRouter"`
 */
export const useStreamWalletWriteRecordDonationByRouter =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'recordDonationByRouter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"recordSubscription"`
 */
export const useStreamWalletWriteRecordSubscription =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'recordSubscription',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"recordSubscriptionByRouter"`
 */
export const useStreamWalletWriteRecordSubscriptionByRouter =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'recordSubscriptionByRouter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useStreamWalletWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"setSwapRouter"`
 */
export const useStreamWalletWriteSetSwapRouter =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'setSwapRouter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useStreamWalletWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useStreamWalletWriteUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"withdrawRevenue"`
 */
export const useStreamWalletWriteWithdrawRevenue =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'withdrawRevenue',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__
 */
export const useStreamWalletSimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: streamWalletAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"donate"`
 */
export const useStreamWalletSimulateDonate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'donate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"donateFor"`
 */
export const useStreamWalletSimulateDonateFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'donateFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"initialize"`
 */
export const useStreamWalletSimulateInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"recordDonationByRouter"`
 */
export const useStreamWalletSimulateRecordDonationByRouter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'recordDonationByRouter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"recordSubscription"`
 */
export const useStreamWalletSimulateRecordSubscription =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'recordSubscription',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"recordSubscriptionByRouter"`
 */
export const useStreamWalletSimulateRecordSubscriptionByRouter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'recordSubscriptionByRouter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useStreamWalletSimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"setSwapRouter"`
 */
export const useStreamWalletSimulateSetSwapRouter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'setSwapRouter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useStreamWalletSimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useStreamWalletSimulateUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"withdrawRevenue"`
 */
export const useStreamWalletSimulateWithdrawRevenue =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'withdrawRevenue',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletAbi}__
 */
export const useStreamWalletWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: streamWalletAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletAbi}__ and `eventName` set to `"DonationReceived"`
 */
export const useStreamWalletWatchDonationReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletAbi,
    eventName: 'DonationReceived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletAbi}__ and `eventName` set to `"Initialized"`
 */
export const useStreamWalletWatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useStreamWalletWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletAbi}__ and `eventName` set to `"PlatformFeeCollected"`
 */
export const useStreamWalletWatchPlatformFeeCollected =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletAbi,
    eventName: 'PlatformFeeCollected',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletAbi}__ and `eventName` set to `"RevenueWithdrawn"`
 */
export const useStreamWalletWatchRevenueWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletAbi,
    eventName: 'RevenueWithdrawn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletAbi}__ and `eventName` set to `"SubscriptionRecorded"`
 */
export const useStreamWalletWatchSubscriptionRecorded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletAbi,
    eventName: 'SubscriptionRecorded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletAbi}__ and `eventName` set to `"SwapRouterUpdated"`
 */
export const useStreamWalletWatchSwapRouterUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletAbi,
    eventName: 'SwapRouterUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useStreamWalletWatchUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__
 */
export const useStreamWalletFactoryReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: streamWalletFactoryAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"defaultPlatformFeeBps"`
 */
export const useStreamWalletFactoryReadDefaultPlatformFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'defaultPlatformFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"getWallet"`
 */
export const useStreamWalletFactoryReadGetWallet =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'getWallet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"hasWallet"`
 */
export const useStreamWalletFactoryReadHasWallet =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'hasWallet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"implementation"`
 */
export const useStreamWalletFactoryReadImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'implementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"kayenRouter"`
 */
export const useStreamWalletFactoryReadKayenRouter =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'kayenRouter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const useStreamWalletFactoryReadOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"streamWalletImplementation"`
 */
export const useStreamWalletFactoryReadStreamWalletImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'streamWalletImplementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"streamerWallets"`
 */
export const useStreamWalletFactoryReadStreamerWallets =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'streamerWallets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"swapRouter"`
 */
export const useStreamWalletFactoryReadSwapRouter =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'swapRouter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"treasury"`
 */
export const useStreamWalletFactoryReadTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'treasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"usdc"`
 */
export const useStreamWalletFactoryReadUsdc =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'usdc',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__
 */
export const useStreamWalletFactoryWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: streamWalletFactoryAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"deployWalletFor"`
 */
export const useStreamWalletFactoryWriteDeployWalletFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'deployWalletFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"donateToStream"`
 */
export const useStreamWalletFactoryWriteDonateToStream =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'donateToStream',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"getOrCreateWallet"`
 */
export const useStreamWalletFactoryWriteGetOrCreateWallet =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'getOrCreateWallet',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useStreamWalletFactoryWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setImplementation"`
 */
export const useStreamWalletFactoryWriteSetImplementation =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setImplementation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setKayenRouter"`
 */
export const useStreamWalletFactoryWriteSetKayenRouter =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setKayenRouter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setPlatformFee"`
 */
export const useStreamWalletFactoryWriteSetPlatformFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setPlatformFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setSwapRouter"`
 */
export const useStreamWalletFactoryWriteSetSwapRouter =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setSwapRouter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useStreamWalletFactoryWriteSetTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setUsdc"`
 */
export const useStreamWalletFactoryWriteSetUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setUsdc',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"subscribeToStream"`
 */
export const useStreamWalletFactoryWriteSubscribeToStream =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'subscribeToStream',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useStreamWalletFactoryWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"upgradeWallet"`
 */
export const useStreamWalletFactoryWriteUpgradeWallet =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'upgradeWallet',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__
 */
export const useStreamWalletFactorySimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: streamWalletFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"deployWalletFor"`
 */
export const useStreamWalletFactorySimulateDeployWalletFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'deployWalletFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"donateToStream"`
 */
export const useStreamWalletFactorySimulateDonateToStream =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'donateToStream',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"getOrCreateWallet"`
 */
export const useStreamWalletFactorySimulateGetOrCreateWallet =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'getOrCreateWallet',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useStreamWalletFactorySimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setImplementation"`
 */
export const useStreamWalletFactorySimulateSetImplementation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setImplementation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setKayenRouter"`
 */
export const useStreamWalletFactorySimulateSetKayenRouter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setKayenRouter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setPlatformFee"`
 */
export const useStreamWalletFactorySimulateSetPlatformFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setPlatformFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setSwapRouter"`
 */
export const useStreamWalletFactorySimulateSetSwapRouter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setSwapRouter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useStreamWalletFactorySimulateSetTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setUsdc"`
 */
export const useStreamWalletFactorySimulateSetUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setUsdc',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"subscribeToStream"`
 */
export const useStreamWalletFactorySimulateSubscribeToStream =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'subscribeToStream',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useStreamWalletFactorySimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"upgradeWallet"`
 */
export const useStreamWalletFactorySimulateUpgradeWallet =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'upgradeWallet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__
 */
export const useStreamWalletFactoryWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: streamWalletFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"DonationProcessed"`
 */
export const useStreamWalletFactoryWatchDonationProcessed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'DonationProcessed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"ImplementationUpdated"`
 */
export const useStreamWalletFactoryWatchImplementationUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'ImplementationUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"KayenRouterUpdated"`
 */
export const useStreamWalletFactoryWatchKayenRouterUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'KayenRouterUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useStreamWalletFactoryWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"PlatformFeeUpdated"`
 */
export const useStreamWalletFactoryWatchPlatformFeeUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'PlatformFeeUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"StreamWalletCreated"`
 */
export const useStreamWalletFactoryWatchStreamWalletCreated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'StreamWalletCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"SubscriptionProcessed"`
 */
export const useStreamWalletFactoryWatchSubscriptionProcessed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'SubscriptionProcessed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"SwapRouterUpdated"`
 */
export const useStreamWalletFactoryWatchSwapRouterUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'SwapRouterUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"TreasuryUpdated"`
 */
export const useStreamWalletFactoryWatchTreasuryUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'TreasuryUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"UsdcUpdated"`
 */
export const useStreamWalletFactoryWatchUsdcUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'UsdcUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"WalletUpgraded"`
 */
export const useStreamWalletFactoryWatchWalletUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'WalletUpgraded',
  })
