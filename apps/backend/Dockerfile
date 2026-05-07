# Standalone development image for the backend, used when you want to spin
# up just the backend without the frontend (via `apps/backend/compose.yml`).
#
# For everything else — root dev (`compose.yml`), build, and the prod
# `frontend` / `backend` runtimes — use the multi-stage Dockerfile at the
# repo root. Keep this one minimal so it stays in sync with the root one's
# base image.
ARG NODE_IMAGE=node:22-alpine3.20

FROM ${NODE_IMAGE} AS development

RUN apk add --no-cache git libc6-compat \
    && corepack enable \
    && corepack prepare pnpm@10.28.1 --activate

USER node
WORKDIR /home/node

# Source is bind-mounted by `apps/backend/compose.yml`; deps install at
# runtime so this image stays cache-friendly.
