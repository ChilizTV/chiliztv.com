# syntax=docker/dockerfile:1.7
#
# Multi-stage build for the ChilizTV monorepo.
#
#   development → bare Node + pnpm, used by the root compose.yml for local dev.
#                 The repo is bind-mounted at /home/node, so the image stays
#                 lean: it does NOT pre-install dependencies. Run
#                 `docker compose exec node pnpm install` once after first up.
#
#   build       → installs all workspace deps + runs `pnpm build`. Internal —
#                 you don't normally start this stage directly.
#
#   frontend    → runtime image for `apps/frontend` (Next.js standalone).
#   backend     → runtime image for `apps/backend` (tsc → dist).
#
# Base image: Node 22 LTS on Alpine 3.20 (current). Node 24/25 are unreleased,
# do not point the FROM at them. pnpm version is pinned to the value declared
# in the root `package.json` ("packageManager": "pnpm@10.28.1") and activated
# via Corepack so dev / build / runtime never drift.

ARG NODE_IMAGE=node:22-alpine3.20

# ──────────────────────────────────────────────────────────────────────────
# DEVELOPMENT STAGE — used by `compose.yml` for local development.
# ──────────────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS development

# git is needed by some pnpm post-install scripts (e.g. workspace deps that
# resolve git refs). libc6-compat smooths over native modules that ship glibc
# binaries (next-swc, sharp).
RUN apk add --no-cache git libc6-compat \
    && corepack enable \
    && corepack prepare pnpm@10.28.1 --activate

USER node
WORKDIR /home/node

# No COPY here — the dev compose bind-mounts the host repo. Keeps rebuilds
# instant and lets `pnpm install` run against the host volume.

# ──────────────────────────────────────────────────────────────────────────
# BUILD STAGE — produces .next/standalone + apps/backend/dist for prod images.
# ──────────────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS build

RUN apk add --no-cache git libc6-compat \
    && corepack enable \
    && corepack prepare pnpm@10.28.1 --activate

USER node
WORKDIR /home/node

# Copy lockfile + manifests first so the dependency layer caches independently
# of source changes. Includes every workspace package — pnpm refuses to
# resolve `workspace:*` ranges unless it sees the whole graph.
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY --chown=node:node apps/frontend/package.json        ./apps/frontend/package.json
COPY --chown=node:node apps/backend/package.json         ./apps/backend/package.json
COPY --chown=node:node apps/smart-contracts/chiliz-tv/   ./apps/smart-contracts/chiliz-tv/
COPY --chown=node:node packages/blockchain/package.json  ./packages/blockchain/package.json
COPY --chown=node:node packages/domain/package.json      ./packages/domain/package.json
COPY --chown=node:node packages/shared/package.json      ./packages/shared/package.json

RUN pnpm install --frozen-lockfile

# Now bring in the rest of the source and run the workspace build.
COPY --chown=node:node . .
RUN pnpm build

# ──────────────────────────────────────────────────────────────────────────
# FRONTEND RUNTIME — Next.js standalone bundle.
# ──────────────────────────────────────────────────────────────────────────
# `output: "standalone"` (in apps/frontend/next.config.ts) emits everything
# the runtime needs into apps/frontend/.next/standalone — including a slim
# node_modules. We just copy that + the static assets and run.
FROM ${NODE_IMAGE} AS frontend

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat
USER node
WORKDIR /home/node

COPY --chown=node:node --from=build /home/node/apps/frontend/.next/standalone ./
COPY --chown=node:node --from=build /home/node/apps/frontend/.next/static     ./apps/frontend/.next/static
COPY --chown=node:node --from=build /home/node/apps/frontend/public           ./apps/frontend/public

EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]

# ──────────────────────────────────────────────────────────────────────────
# BACKEND RUNTIME — tsc-built dist + minimal prod deps.
# ──────────────────────────────────────────────────────────────────────────
# We copy the compiled dist plus the workspace context (lockfile + every
# manifest) so `pnpm install --prod` can resolve `workspace:*` ranges. The
# packages/* sources are needed because the backend imports compiled output
# from them via tsconfig path aliases.
FROM ${NODE_IMAGE} AS backend

ENV NODE_ENV=production
ENV PORT=3001

RUN apk add --no-cache git libc6-compat \
    && corepack enable \
    && corepack prepare pnpm@10.28.1 --activate

USER node
WORKDIR /home/node

COPY --chown=node:node --from=build /home/node/package.json /home/node/pnpm-lock.yaml /home/node/pnpm-workspace.yaml ./
COPY --chown=node:node --from=build /home/node/apps/backend/package.json     ./apps/backend/package.json
COPY --chown=node:node --from=build /home/node/apps/backend/dist             ./apps/backend/dist
COPY --chown=node:node --from=build /home/node/packages                      ./packages

RUN pnpm install --prod --frozen-lockfile --filter @chilitztv.com/backend...

EXPOSE 3001
CMD ["node", "apps/backend/dist/index.js"]
