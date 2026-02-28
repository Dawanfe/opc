# Multi-stage build for Next.js application
FROM node:20-alpine AS base

# 配置 Alpine 阿里云镜像源 + 安装公共依赖（合并 RUN 减少层数）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# ====== 依赖安装阶段 ======
# 只要 package*.json 不变，这个阶段会命中缓存
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# 仅复制依赖声明文件，最大化缓存命中率
COPY package.json package-lock.json ./

# better-sqlite3 的预编译二进制从 npmmirror 代理加速
ENV npm_config_better_sqlite3_binary_host=https://registry.npmmirror.com/-/binary/better-sqlite3

RUN npm ci --registry=https://registry.npmmirror.com --loglevel=warn

# ====== 构建阶段 ======
FROM base AS builder
WORKDIR /app

# 先复制 node_modules（大且不常变）
COPY --from=deps /app/node_modules ./node_modules

# 再复制配置文件（较少变动）
COPY package.json next.config.ts tsconfig.json postcss.config.js tailwind.config.js ./

# 复制源代码（最常变动，放最后以最大化上层缓存复用）
COPY src ./src
COPY public ./public
COPY scripts ./scripts

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV BASE_PATH=/weopc

# 合并 build + esbuild 为一个 RUN，减少层数
RUN npm run build && \
    ./node_modules/.bin/esbuild scripts/init-db.ts \
      --bundle \
      --platform=node \
      --packages=external \
      --outfile=scripts/init-db.js

# ====== 运行阶段 ======
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 合并 apk + 用户创建为一个 RUN，减少层数
RUN apk add --no-cache wget sqlite && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

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
