import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { Abi } from 'viem';

// Import your contract ABIs from artifacts
import BettingMatchJSON from "./artifacts/BettingMatch.json";
import BettingMatchFactoryJSON from "./artifacts/BettingMatchFactory.json";
import StreamWalletJSON from "./artifacts/StreamWallet.json";
import StreamWalletFactoryJSON from "./artifacts/StreamWalletFactory.json";

// Counter to track function occurrences for unique naming
const hookNameCounter: Record<string, number> = {};

export default defineConfig({
  out: 'src/contracts/generatedContracts.ts',
  contracts: [
    { 
      name: 'BettingMatch', 
      abi: BettingMatchJSON.abi as Abi
    },
    { 
      name: 'BettingMatchFactory', 
      abi: BettingMatchFactoryJSON.abi as Abi
    },
    { 
      name: 'StreamWallet', 
      abi: StreamWalletJSON.abi as Abi
    },
    { 
      name: 'StreamWalletFactory', 
      abi: StreamWalletFactoryJSON.abi as Abi
    },
  ],
  plugins: [
    react({
      getHookName({ contractName, itemName, type }) {
        const typePrefix = type === 'read' ? 'Read' : 
                           type === 'write' ? 'Write' : 
                           type === 'simulate' ? 'Simulate' :
                           type === 'watch' ? 'Watch' : '';
        
        const baseName = `use${contractName}${typePrefix}${itemName}` as `use${string}`;
        
        // Track occurrences and add suffix for duplicates
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