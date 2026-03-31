FROM node:25.7.0-alpine3.23 AS development

USER node

WORKDIR /home/node

FROM node:25.7.0-alpine3.23 AS build

USER node

WORKDIR /home/node

COPY --chown=node:node . .

RUN npm install && npm --workspace applications/backend run build && npm --workspace applications/frontend run build

FROM node:25.7.0-alpine3.23 AS frontend

USER node

WORKDIR /home/node

COPY --chown=node:node --from=build /home/node/applications/frontend/dist /home/node/dist
COPY --chown=node:node --from=build /home/node/applications/frontend/package.json /home/node/package.json

RUN npm install --omit=dev

CMD [ "npm", "start" ]

FROM node:25.7.0-alpine3.23 AS backend

USER node

WORKDIR /home/node

COPY --chown=node:node --from=build /home/node/applications/backend/dist /home/node/dist
COPY --chown=node:node --from=build /home/node/applications/backend/package.json /home/node/package.json

RUN npm install --omit=dev

CMD [ "npm", "start" ]
