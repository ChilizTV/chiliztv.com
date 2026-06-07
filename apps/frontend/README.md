# Betcast — Frontend

Next.js 15 / React 19 / wagmi v2 / Dynamic Labs / Tailwind. Talks to the
Betcast smart contracts on Chiliz Spicy testnet (88882) by default,
mainnet (88888) when `NEXT_PUBLIC_NETWORK=mainnet`.

---

## Quick start

```bash
pnpm install
cp .env.example .env.local      # then fill in addresses + Dynamic env id
pnpm dev                        # http://localhost:3000
```

Type-check only (no emit, fast):

```bash
pnpm tsc --noEmit
```

---

## Smart contracts

The frontend integrates with five contracts:

| Contract                  | Address (Spicy testnet)                                 | Purpose                                              |
| ------------------------- | ------------------------------------------------------- | ---------------------------------------------------- |
| `BettingMatchFactory`     | `0x881ae75ec8cb5280e5227453241dfe2c18ddee54`            | Deploys `BettingMatch` proxies, one per match        |
| `BettingMatch` (proxy)    | per match (look up via factory)                         | Holds markets, takes bets, pays out winners          |
| `LiquidityPool` (proxy)   | `0x75fa6ab55d9301229ba907239203acff85b83c3a`            | ERC-4626 USDC pool that backs all bets               |
| `ChilizSwapRouter`        | `0xca7cb6a79cb9c93534c54ba3769a286153f0a55e`            | Single entry-point for multi-token bets/donations    |
| `StreamWalletFactory`     | `0xc30b1493ef233b8e0caeff7e2d59c38cbaa0dfb8`            | Lazy-deploys per-streamer revenue wallets            |

**Source of truth** for addresses : [`apps/smart-contracts/chiliz-tv/deployments/chilizTestnet.json`](../smart-contracts/chiliz-tv/deployments/chilizTestnet.json).
The backend's `.env` mirrors the same values (without the `NEXT_PUBLIC_` prefix).

### Required `.env.local`

Everything `NEXT_PUBLIC_*` is bundled into the client JS — never put
admin keys there.

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_NETWORK=testnet                                  # or 'mainnet'

NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=                          # required
NEXT_PUBLIC_STAGING_DYNAMIC_ENVIRONMENT_ID=                  # optional fallback
NEXT_PUBLIC_STAGING=                                         # 'true' to use staging id

# Spicy testnet (88882) — populated by default in .env.example
NEXT_PUBLIC_BETTING_MATCH_FACTORY_ADDRESS=0x881ae75ec8cb5280e5227453241dfe2c18ddee54
NEXT_PUBLIC_STREAM_WALLET_FACTORY_ADDRESS=0xc30b1493ef233b8e0caeff7e2d59c38cbaa0dfb8
NEXT_PUBLIC_CHILIZ_SWAP_ROUTER_ADDRESS=0xca7cb6a79cb9c93534c54ba3769a286153f0a55e
NEXT_PUBLIC_LIQUIDITY_POOL_PROXY=0x75fa6ab55d9301229ba907239203acff85b83c3a
NEXT_PUBLIC_USDC_ADDRESS=0x66f3ee96a0185216f8cb427d2bc4e53947cef60c
NEXT_PUBLIC_WCHZ_ADDRESS=0x678c34581db0a7808d0ac669d7025f1408c9a3c6

# Mainnet (88888) variants — populate when contracts ship
NEXT_PUBLIC_BETTING_MATCH_FACTORY_ADDRESS_MAINNET=
NEXT_PUBLIC_STREAM_WALLET_FACTORY_ADDRESS_MAINNET=
NEXT_PUBLIC_CHILIZ_SWAP_ROUTER_ADDRESS_MAINNET=
NEXT_PUBLIC_LIQUIDITY_POOL_PROXY_MAINNET=
NEXT_PUBLIC_USDC_ADDRESS_MAINNET=
NEXT_PUBLIC_WCHZ_ADDRESS_MAINNET=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Contract reads / writes

- **Generated hooks** : [`lib/contracts/generated.ts`](lib/contracts/generated.ts)
  is produced by [wagmi-cli](https://wagmi.sh/cli) from the JSON ABIs in
  [`artifacts/`](artifacts/). 700+ typed `useXxxRead/Write/Watch` hooks.
- **Custom wrappers** : domain-shaped helpers live in [`hooks/`](hooks/) —
  `useLiquidityPool`, `useLpPosition`, `useChilizSwapRouter`,
  `useApyFromBackend`, `usePoolDecimals`. Prefer these over the raw
  generated hooks — they hide the `chainId` pin, refetch-on-success,
  and decimals dance.
- **Error decoding** : [`lib/contracts/errors.ts`](lib/contracts/errors.ts)
  turns viem reverts (`ContractFunctionRevertedError`) into UX-ready
  `{ title, description, severity }` messages. Every transaction-bound
  component routes failures through `decodeContractError(err)` so users
  see "Pool liquidity too low — only 1.14 USDC currently free" instead
  of `execution reverted: 0x12abcd…`.

### Refreshing ABIs after a contract upgrade

```bash
# 1. Build the contracts (from apps/smart-contracts/chiliz-tv)
forge build

# 2. Flatten Foundry's nested out/<X>.sol/<X>.json into apps/frontend/artifacts/<X>.json
#    AND mirror them into packages/blockchain/src/abis/json/ for the back-end ABIs.
pnpm artifacts:sync                   # also re-runs wagmi:gen

# 3. Rebuild the shared blockchain package so its dist/abis/json/ ships the JSON to consumers
pnpm --filter @chiliztv/blockchain build
```

Then update [`apps/smart-contracts/chiliz-tv/deployments/chilizTestnet.json`](../smart-contracts/chiliz-tv/deployments/chilizTestnet.json)
with the new addresses and patch this file's address table + the front-/back-end `.env(.example)`.

### Smoke test

```bash
pnpm smoke:contracts                                          # pool + router only
pnpm smoke:contracts -- --match 0xMATCH                       # + match info
pnpm smoke:contracts -- --match 0xMATCH --user 0xUSER         # + balances
```

The script lives at [`scripts/smoke-contracts.mjs`](scripts/smoke-contracts.mjs)
and reads addresses straight from your `.env.local` / `.env`. No `tsx`
dependency — pure ESM Node. Use it after a fresh deploy or before a
release to confirm wiring (USDC matches, router is wired to the factory,
pool isn't paused).

Sample output:

```
• Smoke check — Chiliz Spicy Testnet (chainId 88882)

LiquidityPool
  address                        0x75fa6ab55d9301229ba907239203acff85b83c3a
  asset                          0x66f3ee96…cef60c (USDC, 6 dp)
  asset matches USDC env         ✓
  share decimals                 12
  totalAssets                    1.14 USDC
  freeBalance                    1.14 USDC
  utilization                    0.00%
  paused                         false

ChilizSwapRouter
  matchFactory wired             ✓
  liquidityPool wired            ✓
  platformFeeBps                 500 bps (5.00%)
```

### Troubleshooting

- **"Pool liquidity too low"** when betting — pool's `freeBalance` is below
  the bet's net exposure. Mint test USDC (Spicy faucet), deposit, retry.
  `MarketBetDialog` runs `quoteNetExposure` before submission to surface
  this *before* the wallet popup.
- **"Match misconfigured: USDCNotConfigured"** — a freshly-deployed match
  hasn't been wired with `setUSDCToken(usdc)`. The `BettingMatchFactoryIndexer`
  will have flagged it in the `wiring_alerts` table. Fix via Foundry script
  or the back's `BettingContractDeploymentAdapter`.
- **"Withdrawals locked — Cooldown unlocks in 23m 04s"** — expected. The
  pool enforces `depositCooldownSeconds` (1 h on Spicy by default) after
  every deposit. Wait it out or check the Pool panel for the live counter.
- **"You hold 0 USDC at 0x66f3ee…"** when depositing USDC — the on-chain
  balance is 0 even though MetaMask shows tokens. Either the configured
  `NEXT_PUBLIC_USDC_ADDRESS` is wrong or you minted at a different test
  USDC. Run `pnpm smoke:contracts` and compare the `asset` line vs your
  env.
- **PoolStatusBanner stays up after the pool is unpaused** — the dismissal
  is `localStorage`-based with a 6-h TTL. Clear it via DevTools or wait
  it out.
- **Transactions hanging at "Confirming…"** — the `BetPlaced` event watcher
  has a 4 s polling interval; the dialog auto-closes 1.2 s after the event
  is observed (or 4 s after `useWaitForTransactionReceipt` confirms the tx).
  If neither fires, the RPC subscription dropped — refresh.

---

## Layout

```
app/                          # Next.js App Router
  layout.tsx                  # Mounts <PoolStatusBanner /> + <Toaster />
  my-bets/                    # /my-bets — on-chain bet feed + claim UI
  ...
components/
  features/
    discover/                 # Pool panel, deposit dialog, bento layout
    my-bets/                  # Domain types, hooks, BetCard, BetClaimButton
  live/                       # Markets list, MarketBetDialog, donate/sub buttons
  system/                     # PoolStatusBanner
  ui/                         # shadcn primitives + sonner toaster
  web3/                       # NetworkGuard
hooks/                        # Custom wrappers around generated wagmi hooks
lib/
  contracts/
    errors.ts                 # viem-revert → UX message mapper
    generated.ts              # wagmi-cli output (do not hand-edit)
scripts/
  extract-foundry-artifacts.mjs
  smoke-contracts.mjs
```

## Useful commands

| Command                        | What it does                                         |
| ------------------------------ | ---------------------------------------------------- |
| `pnpm dev`                     | Next dev server with Turbopack                       |
| `pnpm tsc --noEmit`            | Type check only (CI-friendly)                        |
| `pnpm lint`                    | next lint                                            |
| `pnpm wagmi:gen`               | Regenerate `lib/contracts/generated.ts`              |
| `pnpm artifacts:sync`          | `forge build` is upstream — flattens + regen         |
| `pnpm smoke:contracts`         | Read TVL / wiring / optional match + user balances   |
| `pnpm build`                   | Production Next build                                |
