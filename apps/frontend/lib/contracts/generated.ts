import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BasketballPariMatch
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const basketballPariMatchAbi = [
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
    name: 'BPS_DENOM',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    name: 'MARKET_POINTS_EXACT',
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
    name: 'MAX_FEE_BPS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_STAKE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'line', internalType: 'int16', type: 'int16' },
      { name: 'extra', internalType: 'uint8', type: 'uint8' },
      { name: 'groupId', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addMarketAdvanced',
    outputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
    ],
    name: 'addMarketWithLine',
    outputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketTypes', internalType: 'bytes32[]', type: 'bytes32[]' },
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
      { name: 'lines', internalType: 'int16[]', type: 'int16[]' },
      { name: 'extras', internalType: 'uint8[]', type: 'uint8[]' },
      { name: 'groupIds', internalType: 'uint16[]', type: 'uint16[]' },
    ],
    name: 'addMarketsBatchAdvanced',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'line', internalType: 'int16', type: 'int16' },
      { name: 'step', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'addPointsExactMarket',
    outputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
      { name: 'quarter', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'addQuarterMarket',
    outputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'claimBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'claimRefundBatch',
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
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      {
        name: 's',
        internalType: 'struct BasketballPariMatch.BasketballScore',
        type: 'tuple',
        components: [
          { name: 'homeQ1', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ1', internalType: 'uint8', type: 'uint8' },
          { name: 'homeQ2', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ2', internalType: 'uint8', type: 'uint8' },
          { name: 'homeQ3', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ3', internalType: 'uint8', type: 'uint8' },
          { name: 'homeQ4', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ4', internalType: 'uint8', type: 'uint8' },
          { name: 'firstToScore', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    name: 'computeOutcome',
    outputs: [
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
      { name: 'resolvable', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
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
    inputs: [],
    name: 'feeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'getImpliedProbabilityBps',
    outputs: [{ name: 'bps', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketCore',
    outputs: [
      {
        name: '',
        internalType: 'struct PariMatchBase.MarketCore',
        type: 'tuple',
        components: [
          {
            name: 'state',
            internalType: 'enum PariMatchBase.MarketState',
            type: 'uint8',
          },
          { name: 'result', internalType: 'uint64', type: 'uint64' },
          { name: 'createdAt', internalType: 'uint40', type: 'uint40' },
          { name: 'resolvedAt', internalType: 'uint40', type: 'uint40' },
          { name: 'resolvedNetPool', internalType: 'uint256', type: 'uint256' },
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
        internalType: 'enum PariMatchBase.MarketState',
        type: 'uint8',
      },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
      { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
      { name: 'outcomeCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketSpec',
    outputs: [
      {
        name: '',
        internalType: 'struct PariMatchBase.MarketSpec',
        type: 'tuple',
        components: [
          { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
          { name: 'line', internalType: 'int16', type: 'int16' },
          { name: 'maxOutcome', internalType: 'uint8', type: 'uint8' },
          { name: 'extra', internalType: 'uint8', type: 'uint8' },
          { name: 'groupId', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'getOutcomePool',
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
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTotalPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'getUserStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'getUserTotalStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'hasClaimed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
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
    name: 'leaderboardFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'leaderboardRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
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
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
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
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 's',
        internalType: 'struct BasketballPariMatch.BasketballScore',
        type: 'tuple',
        components: [
          { name: 'homeQ1', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ1', internalType: 'uint8', type: 'uint8' },
          { name: 'homeQ2', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ2', internalType: 'uint8', type: 'uint8' },
          { name: 'homeQ3', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ3', internalType: 'uint8', type: 'uint8' },
          { name: 'homeQ4', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ4', internalType: 'uint8', type: 'uint8' },
          { name: 'firstToScore', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    name: 'resolveBatchByScore',
    outputs: [
      { name: 'marketsResolved', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 's',
        internalType: 'struct BasketballPariMatch.BasketballScore',
        type: 'tuple',
        components: [
          { name: 'homeQ1', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ1', internalType: 'uint8', type: 'uint8' },
          { name: 'homeQ2', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ2', internalType: 'uint8', type: 'uint8' },
          { name: 'homeQ3', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ3', internalType: 'uint8', type: 'uint8' },
          { name: 'homeQ4', internalType: 'uint8', type: 'uint8' },
          { name: 'awayQ4', internalType: 'uint8', type: 'uint8' },
          { name: 'firstToScore', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    name: 'resolveByScore',
    outputs: [
      { name: 'marketsResolved', internalType: 'uint256', type: 'uint256' },
    ],
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
    inputs: [{ name: '_feeBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_recipient', internalType: 'address', type: 'address' }],
    name: 'setFeeRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_bps', internalType: 'uint16', type: 'uint16' }],
    name: 'setLeaderboardFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_recipient', internalType: 'address', type: 'address' }],
    name: 'setLeaderboardRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_usdc', internalType: 'address', type: 'address' }],
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
    name: 'FeeBpsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'FeeRecipientSet',
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
    name: 'LeaderboardFeeBpsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'LeaderboardRecipientSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'leaderboard',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'payout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LeaderboardRecordFailed',
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
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'line', internalType: 'int16', type: 'int16', indexed: false },
      {
        name: 'maxOutcome',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'groupId',
        internalType: 'uint16',
        type: 'uint16',
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
        name: 'totalPool',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'fee', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'resolvedNetPool',
        internalType: 'uint256',
        type: 'uint256',
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
        internalType: 'enum PariMatchBase.MarketState',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newState',
        internalType: 'enum PariMatchBase.MarketState',
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
        name: 'homeTotal',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'awayTotal',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'firstToScore',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'marketsResolved',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MatchScoreResolved',
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
        name: 'stake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'payout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PositionClaimed',
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
        name: 'outcome',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'stake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newOutcomePool',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newTotalPool',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PositionTaken',
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
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeRefunded',
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
    ],
    name: 'AlreadyClaimed',
  },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
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
  {
    type: 'error',
    inputs: [
      { name: 'provided', internalType: 'uint16', type: 'uint16' },
      { name: 'max', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'FeeBpsExceedsMax',
  },
  { type: 'error', inputs: [], name: 'FeeRecipientNotConfigured' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
    ],
    name: 'InvalidLine',
  },
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
        internalType: 'enum PariMatchBase.MarketState',
        type: 'uint8',
      },
      {
        name: 'required',
        internalType: 'enum PariMatchBase.MarketState',
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
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'InvalidOutcome',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
      { name: 'maxAllowed', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'InvalidOutcomeValue',
  },
  {
    type: 'error',
    inputs: [{ name: 'quarter', internalType: 'uint8', type: 'uint8' }],
    name: 'InvalidQuarter',
  },
  {
    type: 'error',
    inputs: [
      { name: 'leaderboardBps', internalType: 'uint16', type: 'uint16' },
      { name: 'totalBps', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'LeaderboardFeeExceedsTotal',
  },
  { type: 'error', inputs: [], name: 'LeaderboardRecipientNotConfigured' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'NothingToClaim',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'NothingToRefund',
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
      { name: 'stake', internalType: 'uint256', type: 'uint256' },
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
  { type: 'error', inputs: [], name: 'ZeroStake' },
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
      { name: '', internalType: 'contract PariMatchFactory', type: 'address' },
    ],
    stateMutability: 'view',
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
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
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
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
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
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
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
        name: 'outcome',
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
        name: 'outcome',
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
        name: 'outcome',
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
  { type: 'error', inputs: [], name: 'BettingMatchFactoryNotSet' },
  { type: 'error', inputs: [], name: 'DeadlinePassed' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
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
// FootballPariMatch
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const footballPariMatchAbi = [
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
    name: 'BPS_DENOM',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    name: 'MARKET_GOALS_EXACT',
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
    name: 'MAX_FEE_BPS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_STAKE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'line', internalType: 'int16', type: 'int16' },
      { name: 'extra', internalType: 'uint8', type: 'uint8' },
      { name: 'groupId', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addMarketAdvanced',
    outputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
    ],
    name: 'addMarketWithLine',
    outputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketTypes', internalType: 'bytes32[]', type: 'bytes32[]' },
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
      { name: 'lines', internalType: 'int16[]', type: 'int16[]' },
      { name: 'extras', internalType: 'uint8[]', type: 'uint8[]' },
      { name: 'groupIds', internalType: 'uint16[]', type: 'uint16[]' },
    ],
    name: 'addMarketsBatchAdvanced',
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
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'claimBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'claimRefundBatch',
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
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      {
        name: 's',
        internalType: 'struct FootballPariMatch.FootballScore',
        type: 'tuple',
        components: [
          { name: 'homeGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'awayGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'htHomeGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'htAwayGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'firstScorerId', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    name: 'computeOutcome',
    outputs: [
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
      { name: 'resolvable', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
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
    inputs: [],
    name: 'feeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'getImpliedProbabilityBps',
    outputs: [{ name: 'bps', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketCore',
    outputs: [
      {
        name: '',
        internalType: 'struct PariMatchBase.MarketCore',
        type: 'tuple',
        components: [
          {
            name: 'state',
            internalType: 'enum PariMatchBase.MarketState',
            type: 'uint8',
          },
          { name: 'result', internalType: 'uint64', type: 'uint64' },
          { name: 'createdAt', internalType: 'uint40', type: 'uint40' },
          { name: 'resolvedAt', internalType: 'uint40', type: 'uint40' },
          { name: 'resolvedNetPool', internalType: 'uint256', type: 'uint256' },
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
        internalType: 'enum PariMatchBase.MarketState',
        type: 'uint8',
      },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
      { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
      { name: 'outcomeCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketSpec',
    outputs: [
      {
        name: '',
        internalType: 'struct PariMatchBase.MarketSpec',
        type: 'tuple',
        components: [
          { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
          { name: 'line', internalType: 'int16', type: 'int16' },
          { name: 'maxOutcome', internalType: 'uint8', type: 'uint8' },
          { name: 'extra', internalType: 'uint8', type: 'uint8' },
          { name: 'groupId', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'getOutcomePool',
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
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTotalPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'getUserStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'getUserTotalStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'hasClaimed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
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
    name: 'leaderboardFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'leaderboardRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
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
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
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
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 's',
        internalType: 'struct FootballPariMatch.FootballScore',
        type: 'tuple',
        components: [
          { name: 'homeGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'awayGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'htHomeGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'htAwayGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'firstScorerId', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    name: 'resolveBatchByScore',
    outputs: [
      { name: 'marketsResolved', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 's',
        internalType: 'struct FootballPariMatch.FootballScore',
        type: 'tuple',
        components: [
          { name: 'homeGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'awayGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'htHomeGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'htAwayGoals', internalType: 'uint8', type: 'uint8' },
          { name: 'firstScorerId', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    name: 'resolveByScore',
    outputs: [
      { name: 'marketsResolved', internalType: 'uint256', type: 'uint256' },
    ],
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
    inputs: [{ name: '_feeBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_recipient', internalType: 'address', type: 'address' }],
    name: 'setFeeRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_bps', internalType: 'uint16', type: 'uint16' }],
    name: 'setLeaderboardFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_recipient', internalType: 'address', type: 'address' }],
    name: 'setLeaderboardRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_usdc', internalType: 'address', type: 'address' }],
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
    name: 'FeeBpsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'FeeRecipientSet',
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
    name: 'LeaderboardFeeBpsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'LeaderboardRecipientSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'leaderboard',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'payout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LeaderboardRecordFailed',
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
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'line', internalType: 'int16', type: 'int16', indexed: false },
      {
        name: 'maxOutcome',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'groupId',
        internalType: 'uint16',
        type: 'uint16',
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
        name: 'totalPool',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'fee', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'resolvedNetPool',
        internalType: 'uint256',
        type: 'uint256',
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
        internalType: 'enum PariMatchBase.MarketState',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newState',
        internalType: 'enum PariMatchBase.MarketState',
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
        name: 'homeGoals',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'awayGoals',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'htHomeGoals',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'htAwayGoals',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'firstScorerId',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'marketsResolved',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MatchScoreResolved',
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
        name: 'stake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'payout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PositionClaimed',
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
        name: 'outcome',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'stake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newOutcomePool',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newTotalPool',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PositionTaken',
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
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeRefunded',
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
    ],
    name: 'AlreadyClaimed',
  },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
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
  {
    type: 'error',
    inputs: [
      { name: 'provided', internalType: 'uint16', type: 'uint16' },
      { name: 'max', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'FeeBpsExceedsMax',
  },
  { type: 'error', inputs: [], name: 'FeeRecipientNotConfigured' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
    ],
    name: 'InvalidLine',
  },
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
        internalType: 'enum PariMatchBase.MarketState',
        type: 'uint8',
      },
      {
        name: 'required',
        internalType: 'enum PariMatchBase.MarketState',
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
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'InvalidOutcome',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
      { name: 'maxAllowed', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'InvalidOutcomeValue',
  },
  {
    type: 'error',
    inputs: [
      { name: 'leaderboardBps', internalType: 'uint16', type: 'uint16' },
      { name: 'totalBps', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'LeaderboardFeeExceedsTotal',
  },
  { type: 'error', inputs: [], name: 'LeaderboardRecipientNotConfigured' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'NothingToClaim',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'NothingToRefund',
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
      { name: 'stake', internalType: 'uint256', type: 'uint256' },
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
  { type: 'error', inputs: [], name: 'ZeroStake' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LeaderboardRewards
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const leaderboardRewardsAbi = [
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
    name: 'MAX_CLAIM_DURATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ORACLE_ROLE',
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
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epochId', internalType: 'uint256', type: 'uint256' },
      { name: 'prizeAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'proof', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'merkleRoot', internalType: 'bytes32', type: 'bytes32' },
      { name: 'claimDuration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'closeEpoch',
    outputs: [{ name: 'closedId', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [{ name: 'epochId', internalType: 'uint256', type: 'uint256' }],
    name: 'epoch',
    outputs: [
      {
        name: '',
        internalType: 'struct LeaderboardRewards.Epoch',
        type: 'tuple',
        components: [
          { name: 'startTime', internalType: 'uint64', type: 'uint64' },
          { name: 'closedAt', internalType: 'uint64', type: 'uint64' },
          { name: 'claimExpiry', internalType: 'uint64', type: 'uint64' },
          { name: 'closed', internalType: 'bool', type: 'bool' },
          { name: 'prizePool', internalType: 'uint256', type: 'uint256' },
          { name: 'totalClaimed', internalType: 'uint256', type: 'uint256' },
          { name: 'merkleRoot', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochIndex',
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
      { name: 'epochId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'hasClaimed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
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
      { name: '_usdc', internalType: 'address', type: 'address' },
      { name: '_admin', internalType: 'address', type: 'address' },
      { name: '_oracle', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lockedInClosedEpochs',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'matchFactory',
    outputs: [
      {
        name: '',
        internalType: 'contract IPariMatchFactoryView',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'openPrizePool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'payout', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordWin',
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
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'epochId', internalType: 'uint256', type: 'uint256' }],
    name: 'rolloverEpoch',
    outputs: [{ name: 'rolledOver', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'score',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
    inputs: [{ name: '_usdc', internalType: 'address', type: 'address' }],
    name: 'setUSDCToken',
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
        name: 'epochId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'merkleRoot',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'prizePool',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'claimExpiry',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EpochClosed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epochId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'rolledOver',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EpochRolledOver',
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
      { name: 'usdc', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Initialized',
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
        name: 'epochId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PrizeClaimed',
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
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'match_',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'delta',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newScore',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WinRecorded',
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
      { name: 'epochId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'AlreadyClaimed',
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
  {
    type: 'error',
    inputs: [{ name: 'epochId', internalType: 'uint256', type: 'uint256' }],
    name: 'EpochAlreadyClosed',
  },
  {
    type: 'error',
    inputs: [
      { name: 'epochId', internalType: 'uint256', type: 'uint256' },
      { name: 'claimExpiry', internalType: 'uint64', type: 'uint64' },
      { name: 'nowTs', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'EpochClaimWindowExpired',
  },
  {
    type: 'error',
    inputs: [
      { name: 'epochId', internalType: 'uint256', type: 'uint256' },
      { name: 'claimExpiry', internalType: 'uint64', type: 'uint64' },
      { name: 'nowTs', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'EpochClaimWindowNotExpired',
  },
  {
    type: 'error',
    inputs: [{ name: 'epochId', internalType: 'uint256', type: 'uint256' }],
    name: 'EpochNotClosed',
  },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  {
    type: 'error',
    inputs: [
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
      { name: 'available', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientContractBalance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'provided', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidClaimDuration',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidMerkleProof' },
  { type: 'error', inputs: [], name: 'MatchFactoryNotSet' },
  {
    type: 'error',
    inputs: [{ name: 'epochId', internalType: 'uint256', type: 'uint256' }],
    name: 'MerkleRootNotSet',
  },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'PrizeAmountZero' },
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
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'UnauthorizedMatch',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PariMatchBase
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pariMatchBaseAbi = [
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
    name: 'BPS_DENOM',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    name: 'MAX_FEE_BPS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_STAKE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'line', internalType: 'int16', type: 'int16' },
      { name: 'extra', internalType: 'uint8', type: 'uint8' },
      { name: 'groupId', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addMarketAdvanced',
    outputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
    ],
    name: 'addMarketWithLine',
    outputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketTypes', internalType: 'bytes32[]', type: 'bytes32[]' },
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
      { name: 'lines', internalType: 'int16[]', type: 'int16[]' },
      { name: 'extras', internalType: 'uint8[]', type: 'uint8[]' },
      { name: 'groupIds', internalType: 'uint16[]', type: 'uint16[]' },
    ],
    name: 'addMarketsBatchAdvanced',
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
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'claimBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'claimRefundBatch',
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
    inputs: [],
    name: 'feeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'getImpliedProbabilityBps',
    outputs: [{ name: 'bps', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketCore',
    outputs: [
      {
        name: '',
        internalType: 'struct PariMatchBase.MarketCore',
        type: 'tuple',
        components: [
          {
            name: 'state',
            internalType: 'enum PariMatchBase.MarketState',
            type: 'uint8',
          },
          { name: 'result', internalType: 'uint64', type: 'uint64' },
          { name: 'createdAt', internalType: 'uint40', type: 'uint40' },
          { name: 'resolvedAt', internalType: 'uint40', type: 'uint40' },
          { name: 'resolvedNetPool', internalType: 'uint256', type: 'uint256' },
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
        internalType: 'enum PariMatchBase.MarketState',
        type: 'uint8',
      },
      { name: 'result', internalType: 'uint64', type: 'uint64' },
      { name: 'totalPool', internalType: 'uint256', type: 'uint256' },
      { name: 'outcomeCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarketSpec',
    outputs: [
      {
        name: '',
        internalType: 'struct PariMatchBase.MarketSpec',
        type: 'tuple',
        components: [
          { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
          { name: 'line', internalType: 'int16', type: 'int16' },
          { name: 'maxOutcome', internalType: 'uint8', type: 'uint8' },
          { name: 'extra', internalType: 'uint8', type: 'uint8' },
          { name: 'groupId', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'getOutcomePool',
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
    inputs: [{ name: 'marketId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTotalPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'getUserStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'getUserTotalStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'hasClaimed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
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
    name: 'leaderboardFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'leaderboardRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
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
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
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
    inputs: [{ name: '_feeBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_recipient', internalType: 'address', type: 'address' }],
    name: 'setFeeRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_bps', internalType: 'uint16', type: 'uint16' }],
    name: 'setLeaderboardFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_recipient', internalType: 'address', type: 'address' }],
    name: 'setLeaderboardRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_usdc', internalType: 'address', type: 'address' }],
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
    name: 'FeeBpsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'FeeRecipientSet',
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
    name: 'LeaderboardFeeBpsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'LeaderboardRecipientSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'leaderboard',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'payout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LeaderboardRecordFailed',
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
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'line', internalType: 'int16', type: 'int16', indexed: false },
      {
        name: 'maxOutcome',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'groupId',
        internalType: 'uint16',
        type: 'uint16',
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
        name: 'totalPool',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'fee', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'resolvedNetPool',
        internalType: 'uint256',
        type: 'uint256',
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
        internalType: 'enum PariMatchBase.MarketState',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newState',
        internalType: 'enum PariMatchBase.MarketState',
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
        name: 'stake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'payout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PositionClaimed',
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
        name: 'outcome',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'stake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newOutcomePool',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newTotalPool',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PositionTaken',
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
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeRefunded',
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
    ],
    name: 'AlreadyClaimed',
  },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
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
  {
    type: 'error',
    inputs: [
      { name: 'provided', internalType: 'uint16', type: 'uint16' },
      { name: 'max', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'FeeBpsExceedsMax',
  },
  { type: 'error', inputs: [], name: 'FeeRecipientNotConfigured' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [
      { name: 'marketType', internalType: 'bytes32', type: 'bytes32' },
      { name: 'line', internalType: 'int16', type: 'int16' },
    ],
    name: 'InvalidLine',
  },
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
        internalType: 'enum PariMatchBase.MarketState',
        type: 'uint8',
      },
      {
        name: 'required',
        internalType: 'enum PariMatchBase.MarketState',
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
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'InvalidOutcome',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'outcome', internalType: 'uint64', type: 'uint64' },
      { name: 'maxAllowed', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'InvalidOutcomeValue',
  },
  {
    type: 'error',
    inputs: [
      { name: 'leaderboardBps', internalType: 'uint16', type: 'uint16' },
      { name: 'totalBps', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'LeaderboardFeeExceedsTotal',
  },
  { type: 'error', inputs: [], name: 'LeaderboardRecipientNotConfigured' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'NothingToClaim',
  },
  {
    type: 'error',
    inputs: [
      { name: 'marketId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'NothingToRefund',
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
      { name: 'stake', internalType: 'uint256', type: 'uint256' },
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
  { type: 'error', inputs: [], name: 'ZeroStake' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PariMatchFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pariMatchFactoryAbi = [
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
    name: 'feeRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
        internalType: 'enum PariMatchFactory.SportType',
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
    name: 'leaderboardFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'leaderboardRewards',
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
        internalType: 'enum PariMatchFactory.SportType',
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
      { name: '_leaderboard', internalType: 'address', type: 'address' },
      { name: '_bps', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'setLeaderboardWiring',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_usdcToken', internalType: 'address', type: 'address' },
      { name: '_feeRecipient', internalType: 'address', type: 'address' },
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
        name: 'leaderboard',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'leaderboardFeeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'LeaderboardWiringSet',
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
        internalType: 'enum PariMatchFactory.SportType',
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
        name: 'usdcToken',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'feeRecipient',
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
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'AddressInsufficientBalance',
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
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
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
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__
 */
export const useBasketballPariMatchReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: basketballPariMatchAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useBasketballPariMatchReadAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"BPS_DENOM"`
 */
export const useBasketballPariMatchReadBpsDenom =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'BPS_DENOM',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useBasketballPariMatchReadDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"MARKET_FIRST_TO_SCORE"`
 */
export const useBasketballPariMatchReadMarketFirstToScore =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'MARKET_FIRST_TO_SCORE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"MARKET_HIGHEST_QUARTER"`
 */
export const useBasketballPariMatchReadMarketHighestQuarter =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'MARKET_HIGHEST_QUARTER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"MARKET_POINTS_EXACT"`
 */
export const useBasketballPariMatchReadMarketPointsExact =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'MARKET_POINTS_EXACT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"MARKET_QUARTER_WINNER"`
 */
export const useBasketballPariMatchReadMarketQuarterWinner =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'MARKET_QUARTER_WINNER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"MARKET_SPREAD"`
 */
export const useBasketballPariMatchReadMarketSpread =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'MARKET_SPREAD',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"MARKET_TOTAL_POINTS"`
 */
export const useBasketballPariMatchReadMarketTotalPoints =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'MARKET_TOTAL_POINTS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"MARKET_WINNER"`
 */
export const useBasketballPariMatchReadMarketWinner =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'MARKET_WINNER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"MAX_FEE_BPS"`
 */
export const useBasketballPariMatchReadMaxFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'MAX_FEE_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"MIN_STAKE"`
 */
export const useBasketballPariMatchReadMinStake =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'MIN_STAKE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useBasketballPariMatchReadPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"RESOLVER_ROLE"`
 */
export const useBasketballPariMatchReadResolverRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'RESOLVER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"SWAP_ROUTER_ROLE"`
 */
export const useBasketballPariMatchReadSwapRouterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'SWAP_ROUTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useBasketballPariMatchReadUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"computeOutcome"`
 */
export const useBasketballPariMatchReadComputeOutcome =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'computeOutcome',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"feeBps"`
 */
export const useBasketballPariMatchReadFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'feeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"feeRecipient"`
 */
export const useBasketballPariMatchReadFeeRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'feeRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"getImpliedProbabilityBps"`
 */
export const useBasketballPariMatchReadGetImpliedProbabilityBps =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'getImpliedProbabilityBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"getMarketCore"`
 */
export const useBasketballPariMatchReadGetMarketCore =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'getMarketCore',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"getMarketInfo"`
 */
export const useBasketballPariMatchReadGetMarketInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'getMarketInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"getMarketSpec"`
 */
export const useBasketballPariMatchReadGetMarketSpec =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'getMarketSpec',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"getOutcomePool"`
 */
export const useBasketballPariMatchReadGetOutcomePool =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'getOutcomePool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useBasketballPariMatchReadGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"getTotalPool"`
 */
export const useBasketballPariMatchReadGetTotalPool =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'getTotalPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"getUserStake"`
 */
export const useBasketballPariMatchReadGetUserStake =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'getUserStake',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"getUserTotalStake"`
 */
export const useBasketballPariMatchReadGetUserTotalStake =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'getUserTotalStake',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"hasClaimed"`
 */
export const useBasketballPariMatchReadHasClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'hasClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"hasRole"`
 */
export const useBasketballPariMatchReadHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"leaderboardFeeBps"`
 */
export const useBasketballPariMatchReadLeaderboardFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'leaderboardFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"leaderboardRecipient"`
 */
export const useBasketballPariMatchReadLeaderboardRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'leaderboardRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"marketCount"`
 */
export const useBasketballPariMatchReadMarketCount =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'marketCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"matchName"`
 */
export const useBasketballPariMatchReadMatchName =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'matchName',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"owner"`
 */
export const useBasketballPariMatchReadOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"paused"`
 */
export const useBasketballPariMatchReadPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useBasketballPariMatchReadProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"sportType"`
 */
export const useBasketballPariMatchReadSportType =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'sportType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useBasketballPariMatchReadSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"usdcToken"`
 */
export const useBasketballPariMatchReadUsdcToken =
  /*#__PURE__*/ createUseReadContract({
    abi: basketballPariMatchAbi,
    functionName: 'usdcToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__
 */
export const useBasketballPariMatchWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: basketballPariMatchAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addMarketAdvanced"`
 */
export const useBasketballPariMatchWriteAddMarketAdvanced =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'addMarketAdvanced',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const useBasketballPariMatchWriteAddMarketWithLine =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addMarketsBatch"`
 */
export const useBasketballPariMatchWriteAddMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'addMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addMarketsBatchAdvanced"`
 */
export const useBasketballPariMatchWriteAddMarketsBatchAdvanced =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'addMarketsBatchAdvanced',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addPointsExactMarket"`
 */
export const useBasketballPariMatchWriteAddPointsExactMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'addPointsExactMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addQuarterMarket"`
 */
export const useBasketballPariMatchWriteAddQuarterMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'addQuarterMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const useBasketballPariMatchWriteCancelMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"claim"`
 */
export const useBasketballPariMatchWriteClaim =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"claimBatch"`
 */
export const useBasketballPariMatchWriteClaimBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'claimBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useBasketballPariMatchWriteClaimRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"claimRefundBatch"`
 */
export const useBasketballPariMatchWriteClaimRefundBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'claimRefundBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"closeMarket"`
 */
export const useBasketballPariMatchWriteCloseMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const useBasketballPariMatchWriteCloseMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useBasketballPariMatchWriteEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"grantRole"`
 */
export const useBasketballPariMatchWriteGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"initialize"`
 */
export const useBasketballPariMatchWriteInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"openMarket"`
 */
export const useBasketballPariMatchWriteOpenMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const useBasketballPariMatchWriteOpenMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const useBasketballPariMatchWritePlaceBetUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const useBasketballPariMatchWritePlaceBetUsdcFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useBasketballPariMatchWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useBasketballPariMatchWriteRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"resolveBatchByScore"`
 */
export const useBasketballPariMatchWriteResolveBatchByScore =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'resolveBatchByScore',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"resolveByScore"`
 */
export const useBasketballPariMatchWriteResolveByScore =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'resolveByScore',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const useBasketballPariMatchWriteResolveMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const useBasketballPariMatchWriteResolveMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useBasketballPariMatchWriteRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"setFeeBps"`
 */
export const useBasketballPariMatchWriteSetFeeBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'setFeeBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"setFeeRecipient"`
 */
export const useBasketballPariMatchWriteSetFeeRecipient =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'setFeeRecipient',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"setLeaderboardFeeBps"`
 */
export const useBasketballPariMatchWriteSetLeaderboardFeeBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'setLeaderboardFeeBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"setLeaderboardRecipient"`
 */
export const useBasketballPariMatchWriteSetLeaderboardRecipient =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'setLeaderboardRecipient',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useBasketballPariMatchWriteSetUsdcToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const useBasketballPariMatchWriteSuspendMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useBasketballPariMatchWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"unpause"`
 */
export const useBasketballPariMatchWriteUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useBasketballPariMatchWriteUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: basketballPariMatchAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__
 */
export const useBasketballPariMatchSimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: basketballPariMatchAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addMarketAdvanced"`
 */
export const useBasketballPariMatchSimulateAddMarketAdvanced =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'addMarketAdvanced',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const useBasketballPariMatchSimulateAddMarketWithLine =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addMarketsBatch"`
 */
export const useBasketballPariMatchSimulateAddMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'addMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addMarketsBatchAdvanced"`
 */
export const useBasketballPariMatchSimulateAddMarketsBatchAdvanced =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'addMarketsBatchAdvanced',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addPointsExactMarket"`
 */
export const useBasketballPariMatchSimulateAddPointsExactMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'addPointsExactMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"addQuarterMarket"`
 */
export const useBasketballPariMatchSimulateAddQuarterMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'addQuarterMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const useBasketballPariMatchSimulateCancelMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"claim"`
 */
export const useBasketballPariMatchSimulateClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"claimBatch"`
 */
export const useBasketballPariMatchSimulateClaimBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'claimBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useBasketballPariMatchSimulateClaimRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"claimRefundBatch"`
 */
export const useBasketballPariMatchSimulateClaimRefundBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'claimRefundBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"closeMarket"`
 */
export const useBasketballPariMatchSimulateCloseMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const useBasketballPariMatchSimulateCloseMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useBasketballPariMatchSimulateEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"grantRole"`
 */
export const useBasketballPariMatchSimulateGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"initialize"`
 */
export const useBasketballPariMatchSimulateInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"openMarket"`
 */
export const useBasketballPariMatchSimulateOpenMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const useBasketballPariMatchSimulateOpenMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const useBasketballPariMatchSimulatePlaceBetUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const useBasketballPariMatchSimulatePlaceBetUsdcFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useBasketballPariMatchSimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useBasketballPariMatchSimulateRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"resolveBatchByScore"`
 */
export const useBasketballPariMatchSimulateResolveBatchByScore =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'resolveBatchByScore',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"resolveByScore"`
 */
export const useBasketballPariMatchSimulateResolveByScore =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'resolveByScore',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const useBasketballPariMatchSimulateResolveMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const useBasketballPariMatchSimulateResolveMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useBasketballPariMatchSimulateRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"setFeeBps"`
 */
export const useBasketballPariMatchSimulateSetFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'setFeeBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"setFeeRecipient"`
 */
export const useBasketballPariMatchSimulateSetFeeRecipient =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'setFeeRecipient',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"setLeaderboardFeeBps"`
 */
export const useBasketballPariMatchSimulateSetLeaderboardFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'setLeaderboardFeeBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"setLeaderboardRecipient"`
 */
export const useBasketballPariMatchSimulateSetLeaderboardRecipient =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'setLeaderboardRecipient',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useBasketballPariMatchSimulateSetUsdcToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const useBasketballPariMatchSimulateSuspendMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useBasketballPariMatchSimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"unpause"`
 */
export const useBasketballPariMatchSimulateUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useBasketballPariMatchSimulateUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: basketballPariMatchAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__
 */
export const useBasketballPariMatchWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: basketballPariMatchAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"FeeBpsSet"`
 */
export const useBasketballPariMatchWatchFeeBpsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'FeeBpsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"FeeRecipientSet"`
 */
export const useBasketballPariMatchWatchFeeRecipientSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'FeeRecipientSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"Initialized"`
 */
export const useBasketballPariMatchWatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"LeaderboardFeeBpsSet"`
 */
export const useBasketballPariMatchWatchLeaderboardFeeBpsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'LeaderboardFeeBpsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"LeaderboardRecipientSet"`
 */
export const useBasketballPariMatchWatchLeaderboardRecipientSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'LeaderboardRecipientSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"LeaderboardRecordFailed"`
 */
export const useBasketballPariMatchWatchLeaderboardRecordFailed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'LeaderboardRecordFailed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"MarketCancelled"`
 */
export const useBasketballPariMatchWatchMarketCancelled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'MarketCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"MarketCreated"`
 */
export const useBasketballPariMatchWatchMarketCreated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'MarketCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"MarketResolved"`
 */
export const useBasketballPariMatchWatchMarketResolved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'MarketResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"MarketStateChanged"`
 */
export const useBasketballPariMatchWatchMarketStateChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'MarketStateChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"MatchInitialized"`
 */
export const useBasketballPariMatchWatchMatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'MatchInitialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"MatchScoreResolved"`
 */
export const useBasketballPariMatchWatchMatchScoreResolved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'MatchScoreResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useBasketballPariMatchWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"Paused"`
 */
export const useBasketballPariMatchWatchPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"PositionClaimed"`
 */
export const useBasketballPariMatchWatchPositionClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'PositionClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"PositionTaken"`
 */
export const useBasketballPariMatchWatchPositionTaken =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'PositionTaken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useBasketballPariMatchWatchRoleAdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useBasketballPariMatchWatchRoleGranted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useBasketballPariMatchWatchRoleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"StakeRefunded"`
 */
export const useBasketballPariMatchWatchStakeRefunded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'StakeRefunded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"USDCTokenSet"`
 */
export const useBasketballPariMatchWatchUsdcTokenSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'USDCTokenSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useBasketballPariMatchWatchUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link basketballPariMatchAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useBasketballPariMatchWatchUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: basketballPariMatchAbi,
    eventName: 'Upgraded',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__
 */
export const useFootballPariMatchReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: footballPariMatchAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useFootballPariMatchReadAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"BPS_DENOM"`
 */
export const useFootballPariMatchReadBpsDenom =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'BPS_DENOM',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useFootballPariMatchReadDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"MARKET_BOTH_SCORE"`
 */
export const useFootballPariMatchReadMarketBothScore =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'MARKET_BOTH_SCORE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"MARKET_CORRECT_SCORE"`
 */
export const useFootballPariMatchReadMarketCorrectScore =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'MARKET_CORRECT_SCORE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"MARKET_FIRST_SCORER"`
 */
export const useFootballPariMatchReadMarketFirstScorer =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'MARKET_FIRST_SCORER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"MARKET_GOALS_EXACT"`
 */
export const useFootballPariMatchReadMarketGoalsExact =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'MARKET_GOALS_EXACT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"MARKET_GOALS_TOTAL"`
 */
export const useFootballPariMatchReadMarketGoalsTotal =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'MARKET_GOALS_TOTAL',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"MARKET_HALFTIME"`
 */
export const useFootballPariMatchReadMarketHalftime =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'MARKET_HALFTIME',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"MARKET_WINNER"`
 */
export const useFootballPariMatchReadMarketWinner =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'MARKET_WINNER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"MAX_FEE_BPS"`
 */
export const useFootballPariMatchReadMaxFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'MAX_FEE_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"MIN_STAKE"`
 */
export const useFootballPariMatchReadMinStake =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'MIN_STAKE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useFootballPariMatchReadPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"RESOLVER_ROLE"`
 */
export const useFootballPariMatchReadResolverRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'RESOLVER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"SWAP_ROUTER_ROLE"`
 */
export const useFootballPariMatchReadSwapRouterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'SWAP_ROUTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useFootballPariMatchReadUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"computeOutcome"`
 */
export const useFootballPariMatchReadComputeOutcome =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'computeOutcome',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"feeBps"`
 */
export const useFootballPariMatchReadFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'feeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"feeRecipient"`
 */
export const useFootballPariMatchReadFeeRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'feeRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"getImpliedProbabilityBps"`
 */
export const useFootballPariMatchReadGetImpliedProbabilityBps =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'getImpliedProbabilityBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"getMarketCore"`
 */
export const useFootballPariMatchReadGetMarketCore =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'getMarketCore',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"getMarketInfo"`
 */
export const useFootballPariMatchReadGetMarketInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'getMarketInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"getMarketSpec"`
 */
export const useFootballPariMatchReadGetMarketSpec =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'getMarketSpec',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"getOutcomePool"`
 */
export const useFootballPariMatchReadGetOutcomePool =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'getOutcomePool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useFootballPariMatchReadGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"getTotalPool"`
 */
export const useFootballPariMatchReadGetTotalPool =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'getTotalPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"getUserStake"`
 */
export const useFootballPariMatchReadGetUserStake =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'getUserStake',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"getUserTotalStake"`
 */
export const useFootballPariMatchReadGetUserTotalStake =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'getUserTotalStake',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"hasClaimed"`
 */
export const useFootballPariMatchReadHasClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'hasClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"hasRole"`
 */
export const useFootballPariMatchReadHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"leaderboardFeeBps"`
 */
export const useFootballPariMatchReadLeaderboardFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'leaderboardFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"leaderboardRecipient"`
 */
export const useFootballPariMatchReadLeaderboardRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'leaderboardRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"marketCount"`
 */
export const useFootballPariMatchReadMarketCount =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'marketCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"matchName"`
 */
export const useFootballPariMatchReadMatchName =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'matchName',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"owner"`
 */
export const useFootballPariMatchReadOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"paused"`
 */
export const useFootballPariMatchReadPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useFootballPariMatchReadProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"sportType"`
 */
export const useFootballPariMatchReadSportType =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'sportType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useFootballPariMatchReadSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"usdcToken"`
 */
export const useFootballPariMatchReadUsdcToken =
  /*#__PURE__*/ createUseReadContract({
    abi: footballPariMatchAbi,
    functionName: 'usdcToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__
 */
export const useFootballPariMatchWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: footballPariMatchAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"addMarketAdvanced"`
 */
export const useFootballPariMatchWriteAddMarketAdvanced =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'addMarketAdvanced',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const useFootballPariMatchWriteAddMarketWithLine =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"addMarketsBatch"`
 */
export const useFootballPariMatchWriteAddMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'addMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"addMarketsBatchAdvanced"`
 */
export const useFootballPariMatchWriteAddMarketsBatchAdvanced =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'addMarketsBatchAdvanced',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const useFootballPariMatchWriteCancelMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"claim"`
 */
export const useFootballPariMatchWriteClaim =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"claimBatch"`
 */
export const useFootballPariMatchWriteClaimBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'claimBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useFootballPariMatchWriteClaimRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"claimRefundBatch"`
 */
export const useFootballPariMatchWriteClaimRefundBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'claimRefundBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"closeMarket"`
 */
export const useFootballPariMatchWriteCloseMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const useFootballPariMatchWriteCloseMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useFootballPariMatchWriteEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"grantRole"`
 */
export const useFootballPariMatchWriteGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"initialize"`
 */
export const useFootballPariMatchWriteInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"openMarket"`
 */
export const useFootballPariMatchWriteOpenMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const useFootballPariMatchWriteOpenMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const useFootballPariMatchWritePlaceBetUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const useFootballPariMatchWritePlaceBetUsdcFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useFootballPariMatchWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useFootballPariMatchWriteRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"resolveBatchByScore"`
 */
export const useFootballPariMatchWriteResolveBatchByScore =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'resolveBatchByScore',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"resolveByScore"`
 */
export const useFootballPariMatchWriteResolveByScore =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'resolveByScore',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const useFootballPariMatchWriteResolveMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const useFootballPariMatchWriteResolveMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useFootballPariMatchWriteRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"setFeeBps"`
 */
export const useFootballPariMatchWriteSetFeeBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'setFeeBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"setFeeRecipient"`
 */
export const useFootballPariMatchWriteSetFeeRecipient =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'setFeeRecipient',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"setLeaderboardFeeBps"`
 */
export const useFootballPariMatchWriteSetLeaderboardFeeBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'setLeaderboardFeeBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"setLeaderboardRecipient"`
 */
export const useFootballPariMatchWriteSetLeaderboardRecipient =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'setLeaderboardRecipient',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useFootballPariMatchWriteSetUsdcToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const useFootballPariMatchWriteSuspendMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useFootballPariMatchWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"unpause"`
 */
export const useFootballPariMatchWriteUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useFootballPariMatchWriteUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: footballPariMatchAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__
 */
export const useFootballPariMatchSimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: footballPariMatchAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"addMarketAdvanced"`
 */
export const useFootballPariMatchSimulateAddMarketAdvanced =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'addMarketAdvanced',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const useFootballPariMatchSimulateAddMarketWithLine =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"addMarketsBatch"`
 */
export const useFootballPariMatchSimulateAddMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'addMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"addMarketsBatchAdvanced"`
 */
export const useFootballPariMatchSimulateAddMarketsBatchAdvanced =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'addMarketsBatchAdvanced',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const useFootballPariMatchSimulateCancelMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"claim"`
 */
export const useFootballPariMatchSimulateClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"claimBatch"`
 */
export const useFootballPariMatchSimulateClaimBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'claimBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useFootballPariMatchSimulateClaimRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"claimRefundBatch"`
 */
export const useFootballPariMatchSimulateClaimRefundBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'claimRefundBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"closeMarket"`
 */
export const useFootballPariMatchSimulateCloseMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const useFootballPariMatchSimulateCloseMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useFootballPariMatchSimulateEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"grantRole"`
 */
export const useFootballPariMatchSimulateGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"initialize"`
 */
export const useFootballPariMatchSimulateInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"openMarket"`
 */
export const useFootballPariMatchSimulateOpenMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const useFootballPariMatchSimulateOpenMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const useFootballPariMatchSimulatePlaceBetUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const useFootballPariMatchSimulatePlaceBetUsdcFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useFootballPariMatchSimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useFootballPariMatchSimulateRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"resolveBatchByScore"`
 */
export const useFootballPariMatchSimulateResolveBatchByScore =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'resolveBatchByScore',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"resolveByScore"`
 */
export const useFootballPariMatchSimulateResolveByScore =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'resolveByScore',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const useFootballPariMatchSimulateResolveMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const useFootballPariMatchSimulateResolveMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useFootballPariMatchSimulateRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"setFeeBps"`
 */
export const useFootballPariMatchSimulateSetFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'setFeeBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"setFeeRecipient"`
 */
export const useFootballPariMatchSimulateSetFeeRecipient =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'setFeeRecipient',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"setLeaderboardFeeBps"`
 */
export const useFootballPariMatchSimulateSetLeaderboardFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'setLeaderboardFeeBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"setLeaderboardRecipient"`
 */
export const useFootballPariMatchSimulateSetLeaderboardRecipient =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'setLeaderboardRecipient',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useFootballPariMatchSimulateSetUsdcToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const useFootballPariMatchSimulateSuspendMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useFootballPariMatchSimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"unpause"`
 */
export const useFootballPariMatchSimulateUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link footballPariMatchAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useFootballPariMatchSimulateUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: footballPariMatchAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__
 */
export const useFootballPariMatchWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: footballPariMatchAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"FeeBpsSet"`
 */
export const useFootballPariMatchWatchFeeBpsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'FeeBpsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"FeeRecipientSet"`
 */
export const useFootballPariMatchWatchFeeRecipientSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'FeeRecipientSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"Initialized"`
 */
export const useFootballPariMatchWatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"LeaderboardFeeBpsSet"`
 */
export const useFootballPariMatchWatchLeaderboardFeeBpsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'LeaderboardFeeBpsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"LeaderboardRecipientSet"`
 */
export const useFootballPariMatchWatchLeaderboardRecipientSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'LeaderboardRecipientSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"LeaderboardRecordFailed"`
 */
export const useFootballPariMatchWatchLeaderboardRecordFailed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'LeaderboardRecordFailed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"MarketCancelled"`
 */
export const useFootballPariMatchWatchMarketCancelled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'MarketCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"MarketCreated"`
 */
export const useFootballPariMatchWatchMarketCreated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'MarketCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"MarketResolved"`
 */
export const useFootballPariMatchWatchMarketResolved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'MarketResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"MarketStateChanged"`
 */
export const useFootballPariMatchWatchMarketStateChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'MarketStateChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"MatchInitialized"`
 */
export const useFootballPariMatchWatchMatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'MatchInitialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"MatchScoreResolved"`
 */
export const useFootballPariMatchWatchMatchScoreResolved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'MatchScoreResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useFootballPariMatchWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"Paused"`
 */
export const useFootballPariMatchWatchPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"PositionClaimed"`
 */
export const useFootballPariMatchWatchPositionClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'PositionClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"PositionTaken"`
 */
export const useFootballPariMatchWatchPositionTaken =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'PositionTaken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useFootballPariMatchWatchRoleAdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useFootballPariMatchWatchRoleGranted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useFootballPariMatchWatchRoleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"StakeRefunded"`
 */
export const useFootballPariMatchWatchStakeRefunded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'StakeRefunded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"USDCTokenSet"`
 */
export const useFootballPariMatchWatchUsdcTokenSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'USDCTokenSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useFootballPariMatchWatchUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link footballPariMatchAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useFootballPariMatchWatchUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: footballPariMatchAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__
 */
export const useLeaderboardRewardsReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: leaderboardRewardsAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useLeaderboardRewardsReadAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useLeaderboardRewardsReadDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"MAX_CLAIM_DURATION"`
 */
export const useLeaderboardRewardsReadMaxClaimDuration =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'MAX_CLAIM_DURATION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"ORACLE_ROLE"`
 */
export const useLeaderboardRewardsReadOracleRole =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'ORACLE_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useLeaderboardRewardsReadPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useLeaderboardRewardsReadUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"epoch"`
 */
export const useLeaderboardRewardsReadEpoch =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'epoch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"epochIndex"`
 */
export const useLeaderboardRewardsReadEpochIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'epochIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useLeaderboardRewardsReadGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"hasClaimed"`
 */
export const useLeaderboardRewardsReadHasClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'hasClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"hasRole"`
 */
export const useLeaderboardRewardsReadHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"lockedInClosedEpochs"`
 */
export const useLeaderboardRewardsReadLockedInClosedEpochs =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'lockedInClosedEpochs',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"matchFactory"`
 */
export const useLeaderboardRewardsReadMatchFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'matchFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"openPrizePool"`
 */
export const useLeaderboardRewardsReadOpenPrizePool =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'openPrizePool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"paused"`
 */
export const useLeaderboardRewardsReadPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useLeaderboardRewardsReadProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"score"`
 */
export const useLeaderboardRewardsReadScore =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'score',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useLeaderboardRewardsReadSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"usdcToken"`
 */
export const useLeaderboardRewardsReadUsdcToken =
  /*#__PURE__*/ createUseReadContract({
    abi: leaderboardRewardsAbi,
    functionName: 'usdcToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__
 */
export const useLeaderboardRewardsWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: leaderboardRewardsAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"claim"`
 */
export const useLeaderboardRewardsWriteClaim =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"closeEpoch"`
 */
export const useLeaderboardRewardsWriteCloseEpoch =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'closeEpoch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useLeaderboardRewardsWriteEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"grantRole"`
 */
export const useLeaderboardRewardsWriteGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"initialize"`
 */
export const useLeaderboardRewardsWriteInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"recordWin"`
 */
export const useLeaderboardRewardsWriteRecordWin =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'recordWin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useLeaderboardRewardsWriteRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useLeaderboardRewardsWriteRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"rolloverEpoch"`
 */
export const useLeaderboardRewardsWriteRolloverEpoch =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'rolloverEpoch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"setMatchFactory"`
 */
export const useLeaderboardRewardsWriteSetMatchFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'setMatchFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useLeaderboardRewardsWriteSetUsdcToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"unpause"`
 */
export const useLeaderboardRewardsWriteUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useLeaderboardRewardsWriteUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: leaderboardRewardsAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__
 */
export const useLeaderboardRewardsSimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: leaderboardRewardsAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"claim"`
 */
export const useLeaderboardRewardsSimulateClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"closeEpoch"`
 */
export const useLeaderboardRewardsSimulateCloseEpoch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'closeEpoch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useLeaderboardRewardsSimulateEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"grantRole"`
 */
export const useLeaderboardRewardsSimulateGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"initialize"`
 */
export const useLeaderboardRewardsSimulateInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"recordWin"`
 */
export const useLeaderboardRewardsSimulateRecordWin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'recordWin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useLeaderboardRewardsSimulateRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useLeaderboardRewardsSimulateRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"rolloverEpoch"`
 */
export const useLeaderboardRewardsSimulateRolloverEpoch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'rolloverEpoch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"setMatchFactory"`
 */
export const useLeaderboardRewardsSimulateSetMatchFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'setMatchFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const useLeaderboardRewardsSimulateSetUsdcToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"unpause"`
 */
export const useLeaderboardRewardsSimulateUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useLeaderboardRewardsSimulateUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: leaderboardRewardsAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__
 */
export const useLeaderboardRewardsWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: leaderboardRewardsAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"EpochClosed"`
 */
export const useLeaderboardRewardsWatchEpochClosed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'EpochClosed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"EpochRolledOver"`
 */
export const useLeaderboardRewardsWatchEpochRolledOver =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'EpochRolledOver',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"Initialized"`
 */
export const useLeaderboardRewardsWatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"MatchFactorySet"`
 */
export const useLeaderboardRewardsWatchMatchFactorySet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'MatchFactorySet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"Paused"`
 */
export const useLeaderboardRewardsWatchPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"PrizeClaimed"`
 */
export const useLeaderboardRewardsWatchPrizeClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'PrizeClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useLeaderboardRewardsWatchRoleAdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useLeaderboardRewardsWatchRoleGranted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useLeaderboardRewardsWatchRoleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"USDCTokenSet"`
 */
export const useLeaderboardRewardsWatchUsdcTokenSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'USDCTokenSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useLeaderboardRewardsWatchUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useLeaderboardRewardsWatchUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link leaderboardRewardsAbi}__ and `eventName` set to `"WinRecorded"`
 */
export const useLeaderboardRewardsWatchWinRecorded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: leaderboardRewardsAbi,
    eventName: 'WinRecorded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__
 */
export const usePariMatchBaseReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: pariMatchBaseAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const usePariMatchBaseReadAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"BPS_DENOM"`
 */
export const usePariMatchBaseReadBpsDenom = /*#__PURE__*/ createUseReadContract(
  { abi: pariMatchBaseAbi, functionName: 'BPS_DENOM' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const usePariMatchBaseReadDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"MAX_FEE_BPS"`
 */
export const usePariMatchBaseReadMaxFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'MAX_FEE_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"MIN_STAKE"`
 */
export const usePariMatchBaseReadMinStake = /*#__PURE__*/ createUseReadContract(
  { abi: pariMatchBaseAbi, functionName: 'MIN_STAKE' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const usePariMatchBaseReadPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"RESOLVER_ROLE"`
 */
export const usePariMatchBaseReadResolverRole =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'RESOLVER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"SWAP_ROUTER_ROLE"`
 */
export const usePariMatchBaseReadSwapRouterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'SWAP_ROUTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const usePariMatchBaseReadUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"feeBps"`
 */
export const usePariMatchBaseReadFeeBps = /*#__PURE__*/ createUseReadContract({
  abi: pariMatchBaseAbi,
  functionName: 'feeBps',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"feeRecipient"`
 */
export const usePariMatchBaseReadFeeRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'feeRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"getImpliedProbabilityBps"`
 */
export const usePariMatchBaseReadGetImpliedProbabilityBps =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'getImpliedProbabilityBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"getMarketCore"`
 */
export const usePariMatchBaseReadGetMarketCore =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'getMarketCore',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"getMarketInfo"`
 */
export const usePariMatchBaseReadGetMarketInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'getMarketInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"getMarketSpec"`
 */
export const usePariMatchBaseReadGetMarketSpec =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'getMarketSpec',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"getOutcomePool"`
 */
export const usePariMatchBaseReadGetOutcomePool =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'getOutcomePool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const usePariMatchBaseReadGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"getTotalPool"`
 */
export const usePariMatchBaseReadGetTotalPool =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'getTotalPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"getUserStake"`
 */
export const usePariMatchBaseReadGetUserStake =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'getUserStake',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"getUserTotalStake"`
 */
export const usePariMatchBaseReadGetUserTotalStake =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'getUserTotalStake',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"hasClaimed"`
 */
export const usePariMatchBaseReadHasClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'hasClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"hasRole"`
 */
export const usePariMatchBaseReadHasRole = /*#__PURE__*/ createUseReadContract({
  abi: pariMatchBaseAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"leaderboardFeeBps"`
 */
export const usePariMatchBaseReadLeaderboardFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'leaderboardFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"leaderboardRecipient"`
 */
export const usePariMatchBaseReadLeaderboardRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'leaderboardRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"marketCount"`
 */
export const usePariMatchBaseReadMarketCount =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'marketCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"matchName"`
 */
export const usePariMatchBaseReadMatchName =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'matchName',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"owner"`
 */
export const usePariMatchBaseReadOwner = /*#__PURE__*/ createUseReadContract({
  abi: pariMatchBaseAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"paused"`
 */
export const usePariMatchBaseReadPaused = /*#__PURE__*/ createUseReadContract({
  abi: pariMatchBaseAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const usePariMatchBaseReadProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"sportType"`
 */
export const usePariMatchBaseReadSportType =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'sportType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const usePariMatchBaseReadSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"usdcToken"`
 */
export const usePariMatchBaseReadUsdcToken =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchBaseAbi,
    functionName: 'usdcToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__
 */
export const usePariMatchBaseWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: pariMatchBaseAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"addMarketAdvanced"`
 */
export const usePariMatchBaseWriteAddMarketAdvanced =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'addMarketAdvanced',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const usePariMatchBaseWriteAddMarketWithLine =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"addMarketsBatch"`
 */
export const usePariMatchBaseWriteAddMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'addMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"addMarketsBatchAdvanced"`
 */
export const usePariMatchBaseWriteAddMarketsBatchAdvanced =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'addMarketsBatchAdvanced',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const usePariMatchBaseWriteCancelMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"claim"`
 */
export const usePariMatchBaseWriteClaim = /*#__PURE__*/ createUseWriteContract({
  abi: pariMatchBaseAbi,
  functionName: 'claim',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"claimBatch"`
 */
export const usePariMatchBaseWriteClaimBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'claimBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"claimRefund"`
 */
export const usePariMatchBaseWriteClaimRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"claimRefundBatch"`
 */
export const usePariMatchBaseWriteClaimRefundBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'claimRefundBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"closeMarket"`
 */
export const usePariMatchBaseWriteCloseMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const usePariMatchBaseWriteCloseMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const usePariMatchBaseWriteEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"grantRole"`
 */
export const usePariMatchBaseWriteGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"openMarket"`
 */
export const usePariMatchBaseWriteOpenMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const usePariMatchBaseWriteOpenMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const usePariMatchBaseWritePlaceBetUsdc =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const usePariMatchBaseWritePlaceBetUsdcFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const usePariMatchBaseWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"renounceRole"`
 */
export const usePariMatchBaseWriteRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const usePariMatchBaseWriteResolveMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const usePariMatchBaseWriteResolveMarketsBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"revokeRole"`
 */
export const usePariMatchBaseWriteRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"setFeeBps"`
 */
export const usePariMatchBaseWriteSetFeeBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'setFeeBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"setFeeRecipient"`
 */
export const usePariMatchBaseWriteSetFeeRecipient =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'setFeeRecipient',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"setLeaderboardFeeBps"`
 */
export const usePariMatchBaseWriteSetLeaderboardFeeBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'setLeaderboardFeeBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"setLeaderboardRecipient"`
 */
export const usePariMatchBaseWriteSetLeaderboardRecipient =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'setLeaderboardRecipient',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const usePariMatchBaseWriteSetUsdcToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const usePariMatchBaseWriteSuspendMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const usePariMatchBaseWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"unpause"`
 */
export const usePariMatchBaseWriteUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const usePariMatchBaseWriteUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchBaseAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__
 */
export const usePariMatchBaseSimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: pariMatchBaseAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"addMarketAdvanced"`
 */
export const usePariMatchBaseSimulateAddMarketAdvanced =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'addMarketAdvanced',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"addMarketWithLine"`
 */
export const usePariMatchBaseSimulateAddMarketWithLine =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'addMarketWithLine',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"addMarketsBatch"`
 */
export const usePariMatchBaseSimulateAddMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'addMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"addMarketsBatchAdvanced"`
 */
export const usePariMatchBaseSimulateAddMarketsBatchAdvanced =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'addMarketsBatchAdvanced',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"cancelMarket"`
 */
export const usePariMatchBaseSimulateCancelMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'cancelMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"claim"`
 */
export const usePariMatchBaseSimulateClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"claimBatch"`
 */
export const usePariMatchBaseSimulateClaimBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'claimBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"claimRefund"`
 */
export const usePariMatchBaseSimulateClaimRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"claimRefundBatch"`
 */
export const usePariMatchBaseSimulateClaimRefundBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'claimRefundBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"closeMarket"`
 */
export const usePariMatchBaseSimulateCloseMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'closeMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"closeMarketsBatch"`
 */
export const usePariMatchBaseSimulateCloseMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'closeMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const usePariMatchBaseSimulateEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"grantRole"`
 */
export const usePariMatchBaseSimulateGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"openMarket"`
 */
export const usePariMatchBaseSimulateOpenMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"openMarketsBatch"`
 */
export const usePariMatchBaseSimulateOpenMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'openMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"placeBetUSDC"`
 */
export const usePariMatchBaseSimulatePlaceBetUsdc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'placeBetUSDC',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"placeBetUSDCFor"`
 */
export const usePariMatchBaseSimulatePlaceBetUsdcFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'placeBetUSDCFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const usePariMatchBaseSimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"renounceRole"`
 */
export const usePariMatchBaseSimulateRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"resolveMarket"`
 */
export const usePariMatchBaseSimulateResolveMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'resolveMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"resolveMarketsBatch"`
 */
export const usePariMatchBaseSimulateResolveMarketsBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'resolveMarketsBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"revokeRole"`
 */
export const usePariMatchBaseSimulateRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"setFeeBps"`
 */
export const usePariMatchBaseSimulateSetFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'setFeeBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"setFeeRecipient"`
 */
export const usePariMatchBaseSimulateSetFeeRecipient =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'setFeeRecipient',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"setLeaderboardFeeBps"`
 */
export const usePariMatchBaseSimulateSetLeaderboardFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'setLeaderboardFeeBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"setLeaderboardRecipient"`
 */
export const usePariMatchBaseSimulateSetLeaderboardRecipient =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'setLeaderboardRecipient',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"setUSDCToken"`
 */
export const usePariMatchBaseSimulateSetUsdcToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'setUSDCToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"suspendMarket"`
 */
export const usePariMatchBaseSimulateSuspendMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'suspendMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const usePariMatchBaseSimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"unpause"`
 */
export const usePariMatchBaseSimulateUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const usePariMatchBaseSimulateUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchBaseAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__
 */
export const usePariMatchBaseWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: pariMatchBaseAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"FeeBpsSet"`
 */
export const usePariMatchBaseWatchFeeBpsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'FeeBpsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"FeeRecipientSet"`
 */
export const usePariMatchBaseWatchFeeRecipientSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'FeeRecipientSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"Initialized"`
 */
export const usePariMatchBaseWatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"LeaderboardFeeBpsSet"`
 */
export const usePariMatchBaseWatchLeaderboardFeeBpsSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'LeaderboardFeeBpsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"LeaderboardRecipientSet"`
 */
export const usePariMatchBaseWatchLeaderboardRecipientSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'LeaderboardRecipientSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"LeaderboardRecordFailed"`
 */
export const usePariMatchBaseWatchLeaderboardRecordFailed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'LeaderboardRecordFailed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"MarketCancelled"`
 */
export const usePariMatchBaseWatchMarketCancelled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'MarketCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"MarketCreated"`
 */
export const usePariMatchBaseWatchMarketCreated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'MarketCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"MarketResolved"`
 */
export const usePariMatchBaseWatchMarketResolved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'MarketResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"MarketStateChanged"`
 */
export const usePariMatchBaseWatchMarketStateChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'MarketStateChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"MatchInitialized"`
 */
export const usePariMatchBaseWatchMatchInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'MatchInitialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const usePariMatchBaseWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"Paused"`
 */
export const usePariMatchBaseWatchPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"PositionClaimed"`
 */
export const usePariMatchBaseWatchPositionClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'PositionClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"PositionTaken"`
 */
export const usePariMatchBaseWatchPositionTaken =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'PositionTaken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const usePariMatchBaseWatchRoleAdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const usePariMatchBaseWatchRoleGranted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const usePariMatchBaseWatchRoleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"StakeRefunded"`
 */
export const usePariMatchBaseWatchStakeRefunded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'StakeRefunded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"USDCTokenSet"`
 */
export const usePariMatchBaseWatchUsdcTokenSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'USDCTokenSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"Unpaused"`
 */
export const usePariMatchBaseWatchUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchBaseAbi}__ and `eventName` set to `"Upgraded"`
 */
export const usePariMatchBaseWatchUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchBaseAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__
 */
export const usePariMatchFactoryReadundefined =
  /*#__PURE__*/ createUseReadContract({ abi: pariMatchFactoryAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"BASKETBALL"`
 */
export const usePariMatchFactoryReadBasketball =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'BASKETBALL',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"FOOTBALL"`
 */
export const usePariMatchFactoryReadFootball =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'FOOTBALL',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"allMatches"`
 */
export const usePariMatchFactoryReadAllMatches =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'allMatches',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"basketballImplementation"`
 */
export const usePariMatchFactoryReadBasketballImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'basketballImplementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"feeRecipient"`
 */
export const usePariMatchFactoryReadFeeRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'feeRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"footballImplementation"`
 */
export const usePariMatchFactoryReadFootballImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'footballImplementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"getAllMatches"`
 */
export const usePariMatchFactoryReadGetAllMatches =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'getAllMatches',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"getSportType"`
 */
export const usePariMatchFactoryReadGetSportType =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'getSportType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"implementations"`
 */
export const usePariMatchFactoryReadImplementations =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'implementations',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"isMatch"`
 */
export const usePariMatchFactoryReadIsMatch =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'isMatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"leaderboardFeeBps"`
 */
export const usePariMatchFactoryReadLeaderboardFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'leaderboardFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"leaderboardRewards"`
 */
export const usePariMatchFactoryReadLeaderboardRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'leaderboardRewards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"matchSportType"`
 */
export const usePariMatchFactoryReadMatchSportType =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'matchSportType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const usePariMatchFactoryReadOwner = /*#__PURE__*/ createUseReadContract(
  { abi: pariMatchFactoryAbi, functionName: 'owner' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"swapRouter"`
 */
export const usePariMatchFactoryReadSwapRouter =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'swapRouter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"usdcToken"`
 */
export const usePariMatchFactoryReadUsdcToken =
  /*#__PURE__*/ createUseReadContract({
    abi: pariMatchFactoryAbi,
    functionName: 'usdcToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__
 */
export const usePariMatchFactoryWriteundefined =
  /*#__PURE__*/ createUseWriteContract({ abi: pariMatchFactoryAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"createBasketballMatch"`
 */
export const usePariMatchFactoryWriteCreateBasketballMatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchFactoryAbi,
    functionName: 'createBasketballMatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"createFootballMatch"`
 */
export const usePariMatchFactoryWriteCreateFootballMatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchFactoryAbi,
    functionName: 'createFootballMatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const usePariMatchFactoryWriteRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"setBasketballImplementation"`
 */
export const usePariMatchFactoryWriteSetBasketballImplementation =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchFactoryAbi,
    functionName: 'setBasketballImplementation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"setFootballImplementation"`
 */
export const usePariMatchFactoryWriteSetFootballImplementation =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchFactoryAbi,
    functionName: 'setFootballImplementation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"setLeaderboardWiring"`
 */
export const usePariMatchFactoryWriteSetLeaderboardWiring =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchFactoryAbi,
    functionName: 'setLeaderboardWiring',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"setWiring"`
 */
export const usePariMatchFactoryWriteSetWiring =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchFactoryAbi,
    functionName: 'setWiring',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const usePariMatchFactoryWriteTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: pariMatchFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__
 */
export const usePariMatchFactorySimulateundefined =
  /*#__PURE__*/ createUseSimulateContract({ abi: pariMatchFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"createBasketballMatch"`
 */
export const usePariMatchFactorySimulateCreateBasketballMatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchFactoryAbi,
    functionName: 'createBasketballMatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"createFootballMatch"`
 */
export const usePariMatchFactorySimulateCreateFootballMatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchFactoryAbi,
    functionName: 'createFootballMatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const usePariMatchFactorySimulateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"setBasketballImplementation"`
 */
export const usePariMatchFactorySimulateSetBasketballImplementation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchFactoryAbi,
    functionName: 'setBasketballImplementation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"setFootballImplementation"`
 */
export const usePariMatchFactorySimulateSetFootballImplementation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchFactoryAbi,
    functionName: 'setFootballImplementation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"setLeaderboardWiring"`
 */
export const usePariMatchFactorySimulateSetLeaderboardWiring =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchFactoryAbi,
    functionName: 'setLeaderboardWiring',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"setWiring"`
 */
export const usePariMatchFactorySimulateSetWiring =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchFactoryAbi,
    functionName: 'setWiring',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const usePariMatchFactorySimulateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pariMatchFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchFactoryAbi}__
 */
export const usePariMatchFactoryWatchundefined =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: pariMatchFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `eventName` set to `"BasketballImplementationUpdated"`
 */
export const usePariMatchFactoryWatchBasketballImplementationUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchFactoryAbi,
    eventName: 'BasketballImplementationUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `eventName` set to `"FootballImplementationUpdated"`
 */
export const usePariMatchFactoryWatchFootballImplementationUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchFactoryAbi,
    eventName: 'FootballImplementationUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `eventName` set to `"LeaderboardWiringSet"`
 */
export const usePariMatchFactoryWatchLeaderboardWiringSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchFactoryAbi,
    eventName: 'LeaderboardWiringSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `eventName` set to `"MatchCreated"`
 */
export const usePariMatchFactoryWatchMatchCreated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchFactoryAbi,
    eventName: 'MatchCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const usePariMatchFactoryWatchOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchFactoryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pariMatchFactoryAbi}__ and `eventName` set to `"WiringSet"`
 */
export const usePariMatchFactoryWatchWiringSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pariMatchFactoryAbi,
    eventName: 'WiringSet',
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
