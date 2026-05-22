import type { Abi } from 'viem';
import ChilizSwapRouterJson from './json/ChilizSwapRouter.json';
import StreamWalletJson from './json/StreamWallet.json';
import StreamWalletFactoryJson from './json/StreamWalletFactory.json';
import PariMatchFactoryJson from './json/PariMatchFactory.json';
import PariMatchBaseJson from './json/PariMatchBase.json';
import FootballPariMatchJson from './json/FootballPariMatch.json';
import BasketballPariMatchJson from './json/BasketballPariMatch.json';
import LeaderboardRewardsJson from './json/LeaderboardRewards.json';

// JSON imports lose `as const` literal typing, but viem's runtime calls (readContract,
// writeContract, getLogs with `event:`) accept Abi at the type level. For full literal
// inference (compile-time function-name autocompletion), the frontend uses the wagmi-
// generated hooks instead.
export const CHILIZ_SWAP_ROUTER_ABI = ChilizSwapRouterJson.abi as Abi;
export const STREAM_WALLET_ABI = StreamWalletJson.abi as Abi;
export const STREAM_WALLET_FACTORY_ABI = StreamWalletFactoryJson.abi as Abi;
export const PARI_MATCH_FACTORY_ABI = PariMatchFactoryJson.abi as Abi;
export const PARI_MATCH_BASE_ABI = PariMatchBaseJson.abi as Abi;
export const FOOTBALL_PARI_MATCH_ABI = FootballPariMatchJson.abi as Abi;
export const BASKETBALL_PARI_MATCH_ABI = BasketballPariMatchJson.abi as Abi;
export const LEADERBOARD_REWARDS_ABI = LeaderboardRewardsJson.abi as Abi;
