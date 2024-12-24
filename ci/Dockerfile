FROM node:20-alpine AS builder

# Установка необходимых пакетов
RUN apk add --no-cache openssl

# Настройка DNS
ENV npm_config_registry=https://registry.npmjs.org/
ENV yarn_config_registry=https://registry.yarnpkg.com/

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma

RUN yarn config set network-timeout 300000 && \
    yarn config set registry https://registry.yarnpkg.com && \
    yarn install --frozen-lockfile --network-timeout 300000 && \
    yarn prisma generate

COPY . .

RUN yarn build

FROM node:20-alpine

# Установка необходимых пакетов
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 9001

CMD ["node", "dist/main"]
