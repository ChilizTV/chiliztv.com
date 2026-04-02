# Chiliz Football Betting & Streaming Platform

Node.js backend with Clean Architecture for live football match streaming, real-time chat, blockchain-based betting, and fan engagement on Chiliz network.

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

### ⚡ Blockchain Integration (Chiliz/Base Sepolia)
- ✅ **Smart Contract Deployment**: Automated deployment of betting contracts
- ✅ **Event Indexing**: Real-time indexing of on-chain events (bets, donations, subscriptions)
- ✅ **Market Resolution**: Automatic settlement of betting markets
- ✅ **Stream Monetization**: Donations and subscriptions with platform fees
- ✅ **Multi-network Support**: Chiliz mainnet and Base Sepolia testnet

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
- Chiliz/Base Sepolia RPC access (for blockchain features)
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

## 🎛️ Blockchain Event Indexers

Two indexers run continuously to listen to blockchain events:

### StreamWalletIndexer
- **Events**: DonationProcessed, SubscriptionProcessed, StreamWalletCreated
- **Polling**: Every 6 seconds
- **Features**: Platform fee calculation, chat notifications, subscription expiry checks

### BettingEventIndexer
- **Events**: BetPlaced
- **Polling**: Every 6 seconds
- **Features**: Prediction creation, odds tracking, chat bet messages

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
1. Check RPC URL is accessible
2. Verify contract addresses are correct for your network
3. Check logs for event indexing status

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
