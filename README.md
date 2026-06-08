# PredCast

Source code for PredCast (formerly chiliztv.com) — a pnpm + turbo monorepo
with a Next.js frontend, an Express/TypeScript backend, Foundry smart
contracts, and shared packages.

## Layout

```
apps/
  frontend/         Next.js 15 — public site, /admin console, /live, /browse
  backend/          Express + Supabase — match sync, betting indexer, oracle resolver
  smart-contracts/  Foundry — BettingMatch, LiquidityPool, ChilizSwapRouter, StreamWallet
packages/
  blockchain/       Shared ABIs + chain config
  domain/           Domain entities + ports (clean architecture)
  shared/           Shared DTOs + zod schemas
```

## Requirements

- [Docker](https://www.docker.com/) ≥ 20.10
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.0

## Development

The root `compose.yml` runs a single `node` container with the repo
bind-mounted at `/home/node`. Source edits on the host are picked up live;
dependencies install once into the host's `node_modules` (so they survive
container rebuilds).

```bash
# 1. Start the dev container.
docker compose up -d

# 2. First-time setup: install all workspace deps via pnpm.
docker compose exec node pnpm install
```

### Run only the frontend (against deployed testnet contracts)

```bash
# Copy the env example and fill in the deployed addresses if they're not
# already populated. Default values target Chiliz Spicy testnet.
cp apps/frontend/.env.example apps/frontend/.env

docker compose exec node pnpm -F @chiliztv.com/frontend dev
```

The dev server listens on port 3000. Open [http://localhost:3000](http://localhost:3000).
Contract addresses live in `apps/frontend/.env` (see
`apps/smart-contracts/chiliz-tv/deployments/chilizTestnet.json`).

### Run the backend

```bash
docker compose exec node pnpm -F @chiliztv.com/backend dev
```

Backend dev server listens on port 3001. Requires a populated
`apps/backend/.env` (Supabase keys, JWT secret, API-Football key, deployer
private key, contract addresses — see `apps/backend/.env.example`).

### Tear down

```bash
docker compose down --remove-orphans --volumes --timeout 0
```

## Build

```bash
docker compose -f compose/build.yaml build
docker compose -f compose/build.yaml up
docker compose -f compose/build.yaml down --remove-orphans --volumes --timeout 0
```

The `frontend` runtime image uses the Next.js standalone output
(`apps/frontend/.next/standalone`) and serves with `node server.js`. The
`backend` runtime image runs `apps/backend/dist/index.js` after `pnpm install
--prod` against the workspace.

## Deploy

```bash
docker context create chiliztv.com --docker "host=ssh://chiliztv.com"
docker -c chiliztv.com compose -f compose/deploy.yaml up -d --build
docker -c chiliztv.com compose -f compose/deploy.yaml down --remove-orphans --volumes --timeout 0
```

## Smart contracts

Foundry-based, in `apps/smart-contracts/chiliz-tv`. See its `README.md` for
the architecture, deployment runbook, and post-deploy wiring checklist.
Deployed addresses for Chiliz Spicy testnet (chain id 88882) are in
`apps/smart-contracts/chiliz-tv/deployments/chilizTestnet.json`.

## Conventions

- **Package manager:** `pnpm@10.28.1` (declared in root `packageManager`,
  activated via Corepack inside Docker — do not run `npm install`).
- **Node:** 22 LTS (image: `node:22-alpine3.20`).
- **Workspaces:** `pnpm -F <pkg>` to scope a script to one app/package.
