import { chilizConfig } from '../config/chiliz.config';

export const CONTRACTS_ADDRESSES = {
    pariMatchFactory: chilizConfig.pariMatchFactory,
    streamWalletFactory: chilizConfig.streamWalletFactory,
} as const;

export type ContractAddress = keyof typeof CONTRACTS_ADDRESSES;