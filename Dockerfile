# syntax=docker/dockerfile:1.6

FROM node:20-slim AS base

WORKDIR /usr/src/app
ENV NODE_ENV=production

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder

ENV NODE_ENV=development

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm run build

FROM base AS production

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/server.js"]

