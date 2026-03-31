import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BettingMatch
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const bettingMatchAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'receive', stateMutability: 'payable' },
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
    name: 'TREASURY_ROLE',
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
    ],
    name: 'addMarket',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'emergencyPause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'emergencyWithdraw',
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
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'openMarket',
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
    ],
    name: 'placeBet',
    outputs: [],
    stateMutability: 'payable',
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
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
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
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'betIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'AlreadyClaimed',
  },
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
  { type: 'error', inputs: [], name: 'ContractNotPaused' },
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
  { type: 'error', inputs: [], name: 'FailedCall' },
  {
    type: 'error',
    inputs: [
      { name: 'required', internalType: 'uint256', type: 'uint256' },
      { name: 'available', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientContractBalance',
  },
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
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'MarketNotCancelled',
  },
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
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'TransferFailed',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'ZeroBetAmount' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BettingMatchFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const bettingMatchFactoryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'allMatches',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_matchName', internalType: 'string', type: 'string' },
      { name: '_owner', internalType: 'address', type: 'address' },
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
    ],
    name: 'createFootballMatch',
    outputs: [{ name: 'proxy', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
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
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
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
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// StreamWallet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const streamWalletAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'receive', stateMutability: 'payable' },
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
    ],
    name: 'donate',
    outputs: [
      { name: 'platformFee', internalType: 'uint256', type: 'uint256' },
      { name: 'streamerAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
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
      { name: 'subscriber', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordSubscription',
    outputs: [
      { name: 'platformFee', internalType: 'uint256', type: 'uint256' },
      { name: 'streamerAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
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
  { type: 'error', inputs: [], name: 'InvalidAmount' },
  { type: 'error', inputs: [], name: 'InvalidDuration' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
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
    ],
    name: 'donateToStream',
    outputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
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
    inputs: [{ name: 'newFeeBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setPlatformFee',
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
    ],
    name: 'subscribeToStream',
    outputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
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
  { type: 'error', inputs: [], name: 'WalletAlreadyExists' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"MARKET_BOTH_SCORE"`
 */
export const useBettingMatchReadMarketBothScore =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'MARKET_BOTH_SCORE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"MARKET_CORRECT_SCORE"`
 */
export const useBettingMatchReadMarketCorrectScore =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'MARKET_CORRECT_SCORE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"MARKET_FIRST_SCORER"`
 */
export const useBettingMatchReadMarketFirstScorer =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'MARKET_FIRST_SCORER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"MARKET_GOALS_TOTAL"`
 */
export const useBettingMatchReadMarketGoalsTotal =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'MARKET_GOALS_TOTAL',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"MARKET_HALFTIME"`
 */
export const useBettingMatchReadMarketHalftime =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'MARKET_HALFTIME',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"MARKET_WINNER"`
 */
export const useBettingMatchReadMarketWinner =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'MARKET_WINNER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"MAX_ODDS"`
 */
export const useBettingMatchReadMaxOdds = /*#__PURE__*/ createUseReadContract({
  abi: bettingMatchAbi,
  functionName: 'MAX_ODDS',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"TREASURY_ROLE"`
 */
export const useBettingMatchReadTreasuryRole =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'TREASURY_ROLE',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"footballMarkets"`
 */
export const useBettingMatchReadFootballMarkets =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'footballMarkets',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"getFootballMarket"`
 */
export const useBettingMatchReadGetFootballMarket =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchAbi,
    functionName: 'getFootballMarket',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__
 */
export const useBettingMatchWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: bettingMatchAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"addMarket"`
 */
export const useBettingMatchWriteAddMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'addMarket',
  })

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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useBettingMatchWriteEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"emergencyWithdraw"`
 */
export const useBettingMatchWriteEmergencyWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'emergencyWithdraw',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"initialize"`
 */
export const useBettingMatchWriteInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'initialize',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"placeBet"`
 */
export const useBettingMatchWritePlaceBet =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'placeBet',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useBettingMatchWriteRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: bettingMatchAbi,
    functionName: 'revokeRole',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"addMarket"`
 */
export const useBettingMatchSimulateAddMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'addMarket',
  })

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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useBettingMatchSimulateEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"emergencyWithdraw"`
 */
export const useBettingMatchSimulateEmergencyWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'emergencyWithdraw',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"initialize"`
 */
export const useBettingMatchSimulateInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'initialize',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"placeBet"`
 */
export const useBettingMatchSimulatePlaceBet =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'placeBet',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bettingMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useBettingMatchSimulateRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bettingMatchAbi,
    functionName: 'revokeRole',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bettingMatchFactoryAbi}__ and `functionName` set to `"allMatches"`
 */
export const useBettingMatchFactoryReadAllMatches =
  /*#__PURE__*/ createUseReadContract({
    abi: bettingMatchFactoryAbi,
    functionName: 'allMatches',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"initialize"`
 */
export const useStreamWalletWriteInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'initialize',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useStreamWalletWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletAbi,
    functionName: 'renounceOwnership',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"initialize"`
 */
export const useStreamWalletSimulateInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'initialize',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useStreamWalletSimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletAbi,
    functionName: 'renounceOwnership',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const useStreamWalletFactoryReadOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'owner',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"treasury"`
 */
export const useStreamWalletFactoryReadTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: streamWalletFactoryAbi,
    functionName: 'treasury',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useStreamWalletFactoryWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'renounceOwnership',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useStreamWalletFactoryWriteSetTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setTreasury',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useStreamWalletFactorySimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'renounceOwnership',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useStreamWalletFactorySimulateSetTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: streamWalletFactoryAbi,
    functionName: 'setTreasury',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link streamWalletFactoryAbi}__ and `eventName` set to `"TreasuryUpdated"`
 */
export const useStreamWalletFactoryWatchTreasuryUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: streamWalletFactoryAbi,
    eventName: 'TreasuryUpdated',
  })
