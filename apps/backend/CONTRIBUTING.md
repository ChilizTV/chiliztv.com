# Contributing to Betcast Backend

Thank you for your interest in contributing! This guide will help you set up the project locally using Docker.

## Prerequisites

- [Docker](https://www.docker.com/get-started) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Git](https://git-scm.com/)
- Supabase account (cloud or local)
- API-Football API key

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ChilizTV/back-end.git
cd back-end

# 2. Copy environment configuration
cp .env.example .env

# 3. Start services with Docker
docker-compose up -d
```

That's it! The API will be available at `http://localhost:3001`.

## Environment Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# API Football (get your key from https://www.api-football.com/)
API_FOOTBALL_KEY=your_api_football_key

# Supabase (get your credentials from https://supabase.com/)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Authentication
JWT_SECRET=your_jwt_secret_min_32_characters_here
JWT_ISSUER=chiliz-football-api
JWT_EXPIRY=24h

# Blockchain (Chiliz/Base Sepolia)
NETWORK=testnet
ADMIN_PRIVATE_KEY=0xyour_private_key_without_0x_prefix
STREAM_WALLET_FACTORY_ADDRESS=0x...
BETTING_MATCH_FACTORY_ADDRESS=0x...

# Logging
LOG_LEVEL=info
```

### 2. Supabase Setup

The docker-compose includes PostgreSQL with the Supabase schema. Choose one:

#### Option A: Docker Compose (Included - Recommended)

```bash
# Database schemas are auto-loaded on first start
docker-compose up -d db

# Wait for db to be ready, then start the app
docker-compose up -d app
```

This runs PostgreSQL with Supabase schema on port `5432`.

#### Option B: Supabase CLI (Full features - auth, realtime, storage)

```bash
# Install and start Supabase locally (runs in Docker)
npx supabase start

# Update .env with local Supabase credentials:
# SUPABASE_URL=http://127.0.0.1:54321
# (keys are displayed after `supabase start`)

# Stop when done
npx supabase stop
```

Local Supabase ports:
- PostgreSQL: `54322`
- API: `54321`
- Studio: `54323`

#### Option C: Supabase Cloud

1. Create a project at [supabase.com](https://supabase.com)
2. Get your credentials from Project Settings > API
3. Update `.env` with your Supabase URL and keys

## Docker Development

### Starting Services

```bash
# Start all services in detached mode
docker-compose up -d

# Start with logs visible
docker-compose up

# Rebuild containers (after dependency changes)
docker-compose up --build
```

### Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:3001 | Main API |
| Mediamtx API | http://localhost:9997 | Streaming API |
| RTMP (OBS) | rtmp://localhost:1935 | Stream ingest |
| HLS Playback | http://localhost:8888 | HLS video |
| WebRTC | http://localhost:8889 | WebRTC playback |

### Common Commands

```bash
# View logs
docker-compose logs -f          # All services
docker-compose logs -f app      # Backend only
docker-compose logs -f mediamtx # Streaming only

# Stop services
docker-compose down

# Stop and remove volumes (clean start)
docker-compose down -v

# Restart a specific service
docker-compose restart app
```

### Testing Streaming

To test the streaming functionality:

1. Configure OBS to stream to: `rtmp://localhost:1935/live/streamkey`
2. View the stream at: `http://localhost:8888/live/streamkey.m3u8`

## Development Workflow

### Making Changes

```bash
# The development container uses volume mounting
# Changes to source files will be reflected immediately

# To rebuild after adding dependencies:
docker-compose build app
docker-compose up -d app
```

### Running CLI Commands

```bash
# Deploy contracts
docker-compose exec app pnpm run deploy:missing-contracts

# Setup markets
docker-compose exec app pnpm run setup:markets

# Run migrations
docker-compose exec app ts-node src/presentation/cli/run-migration.ts
```

### Database Migrations

```bash
# Access Supabase CLI (if using local Supabase)
docker-compose exec supabase psql -U postgres
```

## Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker-compose logs app

# Verify .env file exists and has all required variables
cat .env
```

### Supabase Connection Issues

1. Verify `SUPABASE_URL` and keys are correct in `.env`
2. Check that your Supabase project is running
3. Ensure your IP is allowed in Supabase dashboard (Settings > Database)

### Port Conflicts

If ports are already in use:

```bash
# Check what's using the port
lsof -i :3001

# Override ports in docker-compose.yml if needed
```

### Rebuilding from Scratch

```bash
# Stop everything and remove volumes
docker-compose down -v

# Remove node_modules and rebuild
rm -rf node_modules
docker-compose up --build
```

## Project Structure

```
back-end/
├── docker-compose.yml      # Docker services configuration
├── Dockerfile             # App container definition
├── mediamtx.yml           # Streaming server config
├── .env.example           # Environment template
├── src/
│   ├── domain/            # Business entities
│   ├── application/       # Use cases
│   ├── infrastructure/   # External services
│   └── presentation/     # API routes & controllers
└── package.json
```

## Additional Resources

- [API Documentation](./README.md)
- [Database Schema](./src/infrastructure/database/README.md)
- [Postman Collection](./postman_collection.json)

## Questions?

Open an issue on GitHub if you need help with setup or have questions about contributing.
