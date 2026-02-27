# Multi-stage build for Next.js application
FROM node:20-alpine AS base

# 配置 Alpine 阿里云镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package*.json ./

# better-sqlite3 的预编译二进制从 GitHub 下载，使用 npmmirror 代理加速
ENV npm_config_better_sqlite3_binary_host=https://registry.npmmirror.com/-/binary/better-sqlite3

RUN npm ci --registry=https://registry.npmmirror.com --loglevel=info

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV BASE_PATH=/weopc

RUN npm run build

# 用 esbuild 将数据库初始化脚本编译为 JS（避免运行时依赖 tsx）
RUN ./node_modules/.bin/esbuild scripts/init-db.ts \
  --bundle \
  --platform=node \
  --packages=external \
  --outfile=scripts/init-db.js

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache wget sqlite

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy DB init resources (compiled JS + seed data)
COPY --from=builder /app/scripts/init-db.js ./scripts/init-db.js
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/public/communities.json ./public/communities.json
COPY --from=builder /app/public/events.json ./public/events.json
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# Copy entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Ensure data directory exists and is writable
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
