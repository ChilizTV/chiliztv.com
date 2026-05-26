# Chiliz Football Betting & Streaming Platform

Node.js backend with Clean Architecture for live football match streaming, real-time chat, blockchain-based betting, and fan engagement on Chiliz network.

## Local development

### Pre-requirements

- Docker Desktop or OrbStack.
- pnpm 10.28.1 (`corepack enable && corepack prepare pnpm@10.28.1 --activate`).
- Node 22 LTS.
- Supabase CLI 2.x (`brew install supabase/tap/supabase`).
- Windows only: `git config --global core.symlinks=true` (the `supabase/migrations` symlink points at the canonical migrations dir under `src/`).

### First-time setup

From the repo root:

```bash
pnpm install
cp apps/backend/.env.local.example apps/backend/.env.local
pnpm dev:supabase:start         # downloads ~2 GB of Docker images on first run
pnpm dev:supabase:env           # prints SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY
                                # copy those three values into apps/backend/.env.local
pnpm dev:supabase:reset         # applies the 20 migrations from src/...
```

Generate a `JWT_SECRET` (min 32 chars) and an `ACCESS_CODE_COOKIE_SECRET` (min 32 chars):

```bash
openssl rand -base64 48         # paste into JWT_SECRET
openssl rand -base64 32         # paste into ACCESS_CODE_COOKIE_SECRET
```

### Daily workflow

```bash
pnpm dev:local                  # chains: Supabase start, Redis start, doctor, backend
```

`Ctrl+C` only stops the backend Node process; Redis and Supabase keep running in the background so the next `pnpm dev:local` boots in seconds. To stop everything: `pnpm dev:stop`.

### Inspection and debugging

- Redis interactive CLI: `pnpm dev:redis:cli`
- Stream Redis commands: `pnpm dev:redis:cli MONITOR`
- Health probe (TCP-level): `pnpm dev:doctor`
- Supabase Studio UI: **disabled by default** — Studio mounts `apps/backend/supabase/snippets/` and Docker Desktop on macOS rejects the mount when `~/Documents` is not in File Sharing. To enable: open Docker Desktop → Settings → Resources → File sharing → add `~/Documents` (or the absolute repo path), then flip `[studio] enabled = true` in `apps/backend/supabase/config.toml` and re-run `pnpm dev:supabase:start`. Once on, Studio is at http://127.0.0.1:54323.

### Reset

```bash
pnpm dev:reset                  # stop + wipe Supabase DB + flush Redis
```

Migrations are re-applied on the next `pnpm dev:supabase:reset` (or via `pnpm dev:local` if you reset before re-launching).

### Troubleshooting

- **Backend logs say `NoopCacheService`** — Redis is down. `pnpm dev:redis:start`, then check `pnpm dev:doctor`.
- **Port conflict on 54321 / 54322 / 54323 / 6379** — stop the conflicting process, or change the ports in `apps/backend/supabase/config.toml` and `compose.local.yml` and re-sync `.env.local` accordingly.
- **`supabase db reset` fails on a migration** — the migration is broken upstream. Fix in `src/infrastructure/database/migrations/` (the `supabase/migrations` dir is a symlink to that). CI replays the same migrations.
- **`pnpm dev:supabase:env` returns empty values** — Supabase isn't running yet. `pnpm dev:supabase:start` first.

### Two compose files coexist

`compose.yml` (root) and `apps/backend/compose.yml` ship a legacy all-Docker workflow (Node runs in a container). They are **not** used by `pnpm dev:local` — the new workflow runs Node on the host and only Redis in Docker (`compose.local.yml`). Don't mix them in the same session.

### Cloudflare Stream webhook testing

The webhook controller at `/cloudflare-stream/webhook` only runs when Cloudflare
Stream can reach the host over HTTPS. The 4s OBSSetupPanel poll is a fallback,
not a replacement — to exercise the webhook path locally the backend must be
exposed via a public tunnel. Pick one:

**Option A — Cloudflare Named Tunnel** (recommended, free, stable hostname)

```bash
brew install cloudflared
cloudflared login

# Once, create the tunnel:
cloudflared tunnel create chiliztv-local

# Then write ~/.cloudflared/config.yml with the tunnel id printed above:
# tunnel: chiliztv-local
# credentials-file: /Users/<you>/.cloudflared/<tunnel-uuid>.json
# ingress:
#   - hostname: cf-webhook-local.<your-domain>
#     service: http://localhost:3001
#   - service: http_status:404

# Add the DNS CNAME `cf-webhook-local.<your-domain>` → `<tunnel-uuid>.cfargotunnel.com`.

cloudflared tunnel run chiliztv-local
```

Set the CF Stream dashboard webhook URL to `https://cf-webhook-local.<your-domain>/cloudflare-stream/webhook`. Stable across restarts — fits daily dev.

**Option B — ngrok** (free 1 URL + 1 GB/month, $8/mo for a stable URL)

```bash
brew install ngrok
ngrok http 3001
# prints e.g. https://abc-123-456.ngrok-free.app
```

Copy the HTTPS URL into the CF Stream dashboard webhook URL. The free plan
rotates the URL on every restart — Pro for stability.

**Option C — Cloudflare Quick Tunnel** (one-liner, URL rotates per run)

```bash
cloudflared tunnel --url http://localhost:3001
# prints e.g. https://random-words-123.trycloudflare.com
```

Best for an ad-hoc 5-minute probe; useless for the daily dev loop.

**In every option**, set `CLOUDFLARE_STREAM_WEBHOOK_SECRET` in `.env.local` to a
**dev-only secret** that matches the dashboard's webhook secret. The HMAC
verification is timing-safe (`webhook-signature` header) — a mismatch returns
401 silently and burns rate-limit budget without any log clue. Use a secret
distinct from staging and prod.

## Live betting policy — disabled

Aucun pari ne peut être posé pendant qu'un match est in-play (`1H`, `HT`,
`2H`, `ET`, `BT`, `P`, `LIVE`, `SUSP`, `INT`) ni dans les 120 secondes
précédant le coup d'envoi. Defense-in-depth à 4 couches : job back qui
ferme les markets on-chain, garde-fou front, `require` contrat, indexer
qui alerte en cas de leak. Source de vérité : [`BettablePolicy`](../../packages/domain/src/matches/policies/BettablePolicy.ts).

Détails et procédure d'incident : [`docs/runbook-no-live-betting.md`](../../docs/runbook-no-live-betting.md).
Smoke test : [`SMOKE_no_live_betting.md`](./SMOKE_no_live_betting.md).

## Token prices cache

Endpoint public `/prices` (et `/prices/:symbol`) servi depuis la table
`token_prices` mise à jour toutes les 5 min par `RefreshTokenPricesJob`.
Pyth Hermes prioritaire pour CHZ, CoinGecko pour les 25 fan tokens (1 call
batché). Catalogue canonical : [`packages/shared/src/tokens/priceCatalog.ts`](../../packages/shared/src/tokens/priceCatalog.ts).
Variables d'env :

- `PRICE_FEED_JOB_INTERVAL_MS` — refresh interval en ms (default 300000, min 60000).
- `PYTH_CHZ_PRICE_FEED_ID` — feed ID Pyth Hermes pour CHZ/USD. Si absent ou
  invalide, CHZ retombe silencieusement sur CoinGecko au tick suivant.

Smoke test : [`SMOKE_token_prices.md`](./SMOKE_token_prices.md).
Migration à appliquer manuellement sur Supabase : [`migrations/015_token_prices.sql`](./src/infrastructure/database/migrations/015_token_prices.sql).

## Testing matches — 4 levels

The codebase exposes four complementary layers for testing match-related
behaviour. Each layer serves a distinct workflow; none replaces the others.

- **L1 — TypeScript fixtures** (`src/testing/fixtures/match.fixtures.ts`). Pure factories returning a valid `Match` entity in every status (NS / 1H / HT / 2H / ET / BT / P / SUSP / INT / FT / AET / PEN / PST / CANC / ABD / AWD / WO). Use in unit tests via `matchFixture.halftime({ score: { home: 3, away: 2 } })`. Zero I/O.
- **L2 — CLI scenarios** (`pnpm match:scenario list` / `pnpm match:scenario run <name> [--no-deploy]`). Composable, idempotent scripts that hit the real Supabase + (optionally) deploy contracts. Index in [`SMOKE.md`](./SMOKE.md). Use `pnpm match:reset` to nuke fixture rows (IDs 999000-999999).
- **L3 — `IClock` + `MockClock`** (`src/testing/clock/MockClock.ts`). Production code calls `clock.now()` instead of `new Date()`. Tests inject a `MockClock` and `advanceBySec(120)` to walk time deterministically. An ESLint guard (`no-restricted-syntax`) forbids `new Date()` / `Date.now()` in `src/{application,infrastructure,presentation}/`.
- **L4 — Local integration suite** (`pnpm test:integration`). Spawns Anvil + uses local Supabase, applies migrations, runs the no-live-betting / resolve-finished / cancel-flow checks against real txs. Runbook: [`SMOKE_integration.md`](./SMOKE_integration.md). Skipped automatically when Foundry or Supabase CLI is missing.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with four distinct layers:

```
src/
├── domain/              # Business entities and repository interfaces
│   ├── matches/
│   ├── predictions/
│   ├── chat/
│   ├── streams/
│   ├── stream-wallet/
│   └── waitlist/
├── application/         # Use cases (business logic orchestration)
│   ├── matches/
│   ├── predictions/
│   └── ...
├── infrastructure/      # External adapters and services
│   ├── blockchain/      # Viem, contract interactions, indexers
│   ├── database/        # Supabase repositories
│   ├── logging/         # Winston logger
│   └── scheduling/      # Cron jobs
└── presentation/        # Controllers, routes, WebSocket, CLI
    ├── http/
    ├── websocket/
    └── cli/
```

## 🚀 Features

### ⚡ Blockchain Integration (Chiliz Spicy 88882 / Chiliz Mainnet 88888)
- ✅ **Smart Contract Deployment**: Automated deployment of betting contracts
- ✅ **Event Indexing**: Real-time indexing of on-chain events via 5 dedicated indexers (factory + match + pool + router + stream wallets)
- ✅ **Market Resolution**: Automatic settlement of betting markets
- ✅ **Stream Monetization**: Donations and subscriptions with platform fees
- ✅ **APY computation**: Trailing 7d / 30d snapshots persisted by `ComputeApyJob`

### 📺 Live Streaming System
- ✅ **HLS Streaming**: HTTP Live Streaming with adaptive bitrate
- ✅ **Multiple Modes**: Screen share, camera, or combined
- ✅ **Audio Capture**: System audio + microphone with automatic fallback
- ✅ **Real-time Stats**: Viewer count tracking
- ✅ **Stream Wallet**: On-chain donations and subscriptions

### ⚽ Football Matches
- ✅ **API-Football Integration**: Real-time match data synchronization
- ✅ **Multi-league Support**: Premier League, La Liga, Serie A, Bundesliga, etc.
- ✅ **Odds Management**: Real odds with market creation
- ✅ **Temporal Filtering**: 48h window centered on current time
- ✅ **Auto-sync**: Every 10 minutes via cron jobs

### 🎯 Prediction System
- ✅ **On-chain Betting**: All bets recorded on blockchain
- ✅ **Multiple Markets**: Match winner, over/under, BTTS
- ✅ **Automatic Settlement**: Based on match results
- ✅ **User Stats**: Win rate, total bets, earnings tracking
- ✅ **Transaction History**: Full blockchain audit trail

### 💬 Real-Time Chat
- ✅ **Supabase Realtime**: WebSocket-based chat per match
- ✅ **System Messages**: Bet notifications, match events
- ✅ **User Presence**: Connected users tracking
- ✅ **Message Types**: Text, bets, system announcements
- ✅ **PostgreSQL Storage**: Full message history

### 🔐 Authentication & Access Control
- ✅ **JWT-based Auth**: Secure token generation
- ✅ **Wallet Integration**: Web3 wallet address authentication
- ✅ **Waitlist System**: Early access management
- ✅ **Rate Limiting**: Protection against abuse

## 📡 API Documentation

### Postman Collection

Import the complete API collection with all endpoints:
- **File**: `postman_collection.json`
- **Guide**: See `POSTMAN_GUIDE.md` for detailed usage instructions
- **Features**: Auto JWT token management, 35+ endpoints, example requests

### Core Endpoints

#### Authentication (Public)
- `POST /auth/token` - Generate JWT token with wallet address

#### Matches (Authenticated)
- `GET /matches` - All matches
- `GET /matches/live` - Live matches
- `GET /matches/upcoming` - Upcoming matches
- `GET /matches/stats/summary` - Statistics summary
- `GET /matches/:id` - Match details
- `GET /matches/league/:league` - Matches by league

#### Predictions (Authenticated)
- `POST /predictions` - Create prediction
- `GET /predictions/:userId` - User predictions
- `GET /predictions/stats/:userId` - User statistics

#### Chat (Authenticated)
- `POST /chat/join/:matchId` - Join chat room
- `POST /chat/leave/:matchId` - Leave chat room
- `POST /chat/message/:matchId` - Send message
- `POST /chat/bet/:matchId` - Send bet message
- `GET /chat/messages/:matchId` - Get messages
- `GET /chat/users/:matchId` - Connected users
- `GET /chat/stats` - Global statistics

#### Streaming (Authenticated)
- `POST /stream` - Create stream
- `GET /stream` - Active streams
- `DELETE /stream` - End stream
- `PUT /stream/:streamId/viewers` - Update viewer count

#### Stream Wallet (Authenticated)
- `GET /stream-wallet/donations/:streamerAddress` - Streamer donations
- `GET /stream-wallet/subscriptions/:streamerAddress` - Subscriptions
- `GET /stream-wallet/stats/:streamerAddress` - Streamer stats
- `GET /stream-wallet/donor/:donorAddress/donations` - Donor history
- `GET /stream-wallet/subscriber/:subscriberAddress/subscriptions` - Subscriber history

#### Waitlist (Authenticated)
- `POST /waitlist` - Join waitlist
- `GET /waitlist/check-access` - Check access
- `GET /waitlist/stats` - Waitlist statistics

#### Health & Status
- `GET /health` - Server health check
- `GET /supabase-status` - Supabase status
- `GET /` - API information

## ⚙️ Installation

### Prerequisites
- Docker v20.10+ & Docker Compose v2.0+ (recommended)
- OR Node.js v18+ with pnpm
- Supabase account (cloud or local)
- API-Football API key
- Chiliz Spicy testnet (88882) or Chiliz mainnet (88888) RPC access
- Wallet with private key for contract deployment

### Docker Setup (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/ChilizTV/back-end.git
cd back-end

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start services
docker-compose up -d
```

The server will start on `http://localhost:3001`.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed Docker setup instructions.

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd back-end
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

**Required Environment Variables:**
```env
# Server
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# API Football
API_FOOTBALL_KEY=your_api_football_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Blockchain
NETWORK=testnet
ADMIN_PRIVATE_KEY=your_private_key
BETTING_FACTORY_ADDRESS=0x...
STREAM_WALLET_FACTORY_ADDRESS=0x...
```

4. **Set up Supabase Database**
   - Navigate to your Supabase project SQL Editor
   - Run all schema files from `src/infrastructure/database/schemas/`:
     - `schema.sql`
     - `predictions-schema.sql`
     - `streams-schema.sql` (table name: `live_streams`)
     - `stream-wallet-schema.sql`
     - `waitlist-schema.sql`
   - Apply migrations from `src/infrastructure/database/migrations/`

5. **Build the project**
```bash
pnpm run build
```

6. **Start the server**
```bash
pnpm start
```

The server will start on `http://localhost:3001`

## 🛠️ CLI Commands

The project includes several CLI commands for blockchain operations:

### Deploy Missing Contracts
```bash
npm run cli:deploy-contracts
```
Deploys betting contracts for matches that don't have one yet.

### Setup Markets
```bash
npm run cli:setup-markets
```
Configures betting markets for existing contracts.

### Test Match Lifecycle
```bash
npm run cli:test-lifecycle
```
Interactive CLI to test match creation, status updates, and contract deployment.

## 🔄 Scheduled Jobs

The application runs several cron jobs automatically:

| Job | Schedule | Description |
|-----|----------|-------------|
| SyncMatches | Every 10 min | Fetch matches from API-Football |
| ResolveMarkets | Every 60 min | Resolve finished matches on-chain |
| SettlePredictions | Every 5 min | Settle user predictions |
| CleanupStreams | Every hour | Clean up old ended streams |
| StaleStreamCleanup | Every hour | Drop streams orphaned from MediaMTX |
| ViewerReconcile | Every minute | Reconcile concurrent-viewer counters |
| ComputeApy | Every 15 min | Compute LP APY snapshots (7d / 30d) |

`ComputeApyJob` reads `totalAssets()` and `totalSupply()` from the
`LiquidityPool` at the block boundaries `now`, `now - 7 days`, `now - 30 days`
(via binary search on `eth_getBlockByNumber`) and writes the result into
`pool_apy_snapshots`. The frontend reads the latest row via `GET /pool/apy`.

## 🎛️ Blockchain Event Indexers

Five indexers run in parallel under [`BlockchainEventListener`](src/infrastructure/blockchain/BlockchainEventListener.ts).
Every indexer extends [`BaseIndexer`](src/infrastructure/blockchain/indexers/BaseIndexer.ts),
which handles polling cadence, the persistent checkpoint cursor, and the
re-org safety margin (`head − INDEXER_REORG_DEPTH`, default 5 blocks).

| Indexer | Watches | Writes to |
|---|---|---|
| `BettingMatchFactoryIndexer` | factory `MatchCreated` + post-deploy wiring read-back | `wiring_alerts` (read-only flagging — never auto-fixes) |
| `BettingMatchEventIndexer` | every `BettingMatch` proxy: `BetPlaced`, `Payout`, `Refund`, `MarketCreated`, `MarketStateChanged`, `OddsUpdated`, `MarketResolved`, `MarketCancelled` | `bets` (status PENDING → WON/LOST/REFUNDED), `market_events`, `predictions` (legacy mirror), `chat_messages` (system messages) |
| `LiquidityPoolIndexer` | pool `Deposit`, `Withdraw`, `BetRecorded`, `MarketSettled`, `WinnerPaid`, `RefundPaid`, `TreasuryAccrued`, `LpWithdrawalFeeAccrued`, `Paused`/`Unpaused`, `*Set` | `pool_events`, `lp_positions` (cost-basis tracking) |
| `ChilizSwapRouterIndexer` | router `BetPlacedVia*`, `DonationWith*`, `SubscriptionWith*`, `LiquidityDepositedWith*` | `pool_events` (audit only — pool-side accounting comes from `LiquidityPoolIndexer`) |
| `StreamWalletIndexer` | factory `StreamWalletCreated` (discovery) + each wallet's `DonationReceived`, `SubscriptionRecorded`, `RevenueWithdrawn`, `PlatformFeeCollected` | `stream_wallets`, `donations`, `subscriptions`, `chat_messages` |

### Persistence

Six indexer-owned tables, all idempotent on `(tx_hash, log_index)` :

- `indexer_checkpoints` — one row per indexer, holds the last successfully indexed block
- `bets` — per-bet on-chain bookkeeping (joins `matches` via `contract_address`)
- `pool_events` — generic audit log for `LiquidityPool` + `ChilizSwapRouter`
- `market_events` — per-market state-change audit
- `lp_positions` — denormalised holder view (shares + cost basis + last deposit)
- `wiring_alerts` — unresolved post-deploy wiring problems

Migrations live in [`src/infrastructure/database/migrations/`](src/infrastructure/database/migrations/) :

```bash
# Apply against your Supabase via psql or the SQL editor
psql "$SUPABASE_URL" -f src/infrastructure/database/migrations/011_indexer_tables.sql
psql "$SUPABASE_URL" -f src/infrastructure/database/migrations/012_pool_apy_snapshots.sql
```

### Operations

**Restart from scratch** (full backfill from `head − INDEXER_DEFAULT_LOOKBACK`,
default 1000 blocks) :

```sql
TRUNCATE TABLE indexer_checkpoints;
-- optionally also truncate the indexed tables for a clean slate:
TRUNCATE TABLE bets, pool_events, market_events, lp_positions, wiring_alerts;
```

The next start of the back will pick up from `head − INDEXER_DEFAULT_LOOKBACK`
on every indexer. Use `INDEXER_DEFAULT_LOOKBACK=200000 pnpm dev` for a
deeper backfill.

**Restart a single indexer** :

```sql
DELETE FROM indexer_checkpoints WHERE indexer_name = 'LiquidityPool';
```

Indexer names: `BettingMatchFactory`, `BettingMatchEvent`, `LiquidityPool`,
`ChilizSwapRouter`, `StreamWallet`.

**Tuning knobs** (env vars, all optional) :

| Var | Default | What it does |
|---|---|---|
| `INDEXER_REORG_DEPTH` | `5` | Blocks left under `head` untouched. Chiliz IBFT finalises in ~2 s, so 5 is plenty. |
| `INDEXER_DEFAULT_LOOKBACK` | `1000` | Where to start when no checkpoint row exists. Bump for backfills. |
| `CHILIZ_RPC_URL` | chain default | Override the public RPC with a private endpoint if you hit rate limits. |

**Debugging a missed event** :

1. Check `indexer_checkpoints` — is `last_block` advancing?
   ```sql
   SELECT indexer_name, last_block, updated_at FROM indexer_checkpoints ORDER BY indexer_name;
   ```
2. Compare with `eth_blockNumber` on the chain (same explorer link as the
   contract address). A growing gap means the indexer is choking on a
   batch — check the backend logs for `getLogs` errors.
3. Confirm the event is actually emitted on-chain via the explorer's
   "Events" tab on the contract address.
4. If the event is on-chain but missing from your DB, re-run the indexer
   over the affected range :
   ```sql
   UPDATE indexer_checkpoints SET last_block = <block_before_the_event> WHERE indexer_name = 'BettingMatchEvent';
   ```
   Restart the back. The `(tx_hash, log_index)` PK guarantees idempotency,
   so re-running is safe.

## 📊 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Architecture**: Clean Architecture with DI (tsyringe)
- **Web Framework**: Express.js
- **Database**: PostgreSQL via Supabase
- **Real-time**: Supabase Realtime + Socket.IO
- **Blockchain**: Viem (Ethereum interactions)
- **Logging**: Winston (structured logging)
- **Validation**: Zod
- **Testing**: Jest
- **Streaming**: FFmpeg + HLS

## 🔧 Development

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after dependency changes
docker-compose up --build
```

### Local Development (without Docker)

### Build
```bash
pnpm run build
```

### Watch mode
```bash
pnpm run dev
```

### Run tests
```bash
pnpm test
```

### Linting
```bash
pnpm run lint
```

## 🐛 Troubleshooting

### DI Container Issues
If you encounter dependency injection errors:
1. Verify all repositories are registered in `src/infrastructure/config/di-container.ts`
2. Ensure `setupDependencyInjection()` is called before importing routes
3. Check that interfaces match implementation class names

### Supabase Connection Issues
1. Verify environment variables are set correctly
2. Check that SERVICE_ROLE_KEY is used (bypasses RLS)
3. Ensure all tables exist with correct names (`live_streams`, not `streams`)

### Blockchain Indexer Issues
1. **Backend won't start with Zod errors mentioning `BETTING_MATCH_FACTORY_ADDRESS`/etc.** — env vars are unconditionally required (no silent `0x000…` fallback). Copy the testnet block from `.env.example` and restart.
2. **`indexer_checkpoints.last_block` not advancing** — check the backend logs for `getLogs` errors. Public Spicy RPC sometimes throttles wide ranges; lower the lookback (`INDEXER_DEFAULT_LOOKBACK=200`) or set `CHILIZ_RPC_URL` to a private endpoint.
3. **Events on-chain but missing from DB** — re-run the indexer over the affected range by rewinding `indexer_checkpoints.last_block`. The `(tx_hash, log_index)` PK makes the replay idempotent.
4. **`wiring_alerts` rows present after a deploy** — the matching `BettingMatch` proxy is missing one of `setUSDCToken` / `setLiquidityPool` / `pool.authorizeMatch` / `grantRole(SWAP_ROUTER_ROLE, …)`. Inspect `missing_steps` JSONB and fix via Foundry script. Mark resolved with `UPDATE wiring_alerts SET resolved_at = now() WHERE match_address = '0x…'`.
5. **APY endpoint returns `null` even after 7+ days** — `ComputeApyJob` needs `totalSupply()` > 0 at both block boundaries. Empty pool → `pps` undefined → snapshot skipped. Deposit a few USDC and wait one cycle.

### Streaming Not Working
1. Verify FFmpeg is installed: `ffmpeg -version`
2. Check write permissions in `public/streams/`
3. Ensure port 3001 is accessible
4. Check CORS configuration in `ALLOWED_ORIGINS`

## 📝 Project Structure

```
server/
├── src/
│   ├── domain/                 # Business logic layer
│   ├── application/            # Use cases
│   ├── infrastructure/         # External services
│   └── presentation/           # API, WebSocket, CLI
├── public/
│   └── streams/               # HLS stream files
├── postman_collection.json    # API testing collection
├── POSTMAN_GUIDE.md          # Postman usage guide
└── README.md                 # This file
```

## 🔐 Security

- **JWT Authentication**: All protected routes require valid JWT
- **Rate Limiting**: Global, auth, predictions, and chat rate limits
- **CORS**: Whitelist-based CORS configuration
- **Input Validation**: Zod schemas for all requests
- **RLS Bypass**: Service role key for Supabase operations

## 📚 Additional Resources

- **Postman Guide**: See `POSTMAN_GUIDE.md` for API testing
- **Database Guide**: See `src/infrastructure/database/README.md` for schema management
- **Architecture**: Clean Architecture with dependency injection
- **Logging**: Winston with structured JSON logs for production

## 📄 License

AGPL-3.0 License

---

✅ **Server ready** - Clean Architecture migration complete with 35+ endpoints, blockchain integration, and real-time features!
