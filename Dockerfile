FROM node:25.7.0-alpine3.23 AS development

USER node

WORKDIR /home/node

FROM node:25.7.0-alpine3.23 AS build

# Install pnpm globally
RUN npm install -g pnpm

USER node

WORKDIR /home/node

COPY --chown=node:node . .

RUN pnpm install --frozen-lockfile && pnpm build

FROM node:25.7.0-alpine3.23 AS frontend

RUN npm install -g pnpm

USER node

WORKDIR /home/node

COPY --chown=node:node --from=build /home/node/apps/frontend/dist /home/node/dist
COPY --chown=node:node --from=build /home/node/apps/frontend/package.json /home/node/package.json

RUN pnpm install --prod

CMD [ "pnpm", "start" ]

FROM node:25.7.0-alpine3.23 AS backend

RUN npm install -g pnpm

USER node

WORKDIR /home/node

COPY --chown=node:node --from=build /home/node/apps/backend/dist /home/node/dist
COPY --chown=node:node --from=build /home/node/apps/backend/package.json /home/node/package.json

RUN pnpm install --prod

CMD [ "pnpm", "start" ]
