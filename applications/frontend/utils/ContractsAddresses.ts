import { chilizConfig } from '../config/chiliz.config';

export const CONTRACTS_ADDRESSES = {
    betting: chilizConfig.bettingContract, // Legacy betting contract (deprecated)
    bettingMatchFactory: chilizConfig.bettingMatchFactory,
    streamWalletFactory: chilizConfig.streamWalletFactory,
} as const;

export type ContractAddress = keyof typeof CONTRACTS_ADDRESSES;