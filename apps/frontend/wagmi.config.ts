import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { Abi } from 'viem';

// Contract ABIs sourced from Foundry `out/` then copied into ./artifacts.
import PariMatchBaseJSON from "./artifacts/PariMatchBase.json";
import PariMatchFactoryJSON from "./artifacts/PariMatchFactory.json";
import FootballPariMatchJSON from "./artifacts/FootballPariMatch.json";
import BasketballPariMatchJSON from "./artifacts/BasketballPariMatch.json";
import LeaderboardRewardsJSON from "./artifacts/LeaderboardRewards.json";
import StreamWalletJSON from "./artifacts/StreamWallet.json";
import StreamWalletFactoryJSON from "./artifacts/StreamWalletFactory.json";
import ChilizSwapRouterJSON from "./artifacts/ChilizSwapRouter.json";

// Counter for unique hook names when wagmi sees overloads.
const hookNameCounter: Record<string, number> = {};

export default defineConfig({
  out: 'lib/contracts/generated.ts',
  contracts: [
    { name: 'PariMatchBase',        abi: PariMatchBaseJSON.abi as Abi },
    { name: 'PariMatchFactory',     abi: PariMatchFactoryJSON.abi as Abi },
    { name: 'FootballPariMatch',    abi: FootballPariMatchJSON.abi as Abi },
    { name: 'BasketballPariMatch',  abi: BasketballPariMatchJSON.abi as Abi },
    { name: 'LeaderboardRewards',   abi: LeaderboardRewardsJSON.abi as Abi },
    { name: 'StreamWallet',         abi: StreamWalletJSON.abi as Abi },
    { name: 'StreamWalletFactory',  abi: StreamWalletFactoryJSON.abi as Abi },
    { name: 'ChilizSwapRouter',     abi: ChilizSwapRouterJSON.abi as Abi },
  ],
  plugins: [
    react({
      getHookName({ contractName, itemName, type }) {
        const typePrefix = type === 'read' ? 'Read' :
                           type === 'write' ? 'Write' :
                           type === 'simulate' ? 'Simulate' :
                           type === 'watch' ? 'Watch' : '';

        const baseName = `use${contractName}${typePrefix}${itemName}` as `use${string}`;

        if (!hookNameCounter[baseName]) {
          hookNameCounter[baseName] = 0;
          return baseName;
        } else {
          hookNameCounter[baseName]++;
          return `${baseName}_${hookNameCounter[baseName]}` as `use${string}`;
        }
      }
    }),
  ],
})
