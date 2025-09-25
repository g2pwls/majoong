# syntax=docker/dockerfile:1.7-labs

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 CI=1 \
    PNPM_STORE_DIR=/pnpm/store

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store pnpm fetch
COPY . .
RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile --prod=false

# ✅ 시크릿을 레이어에 남기지 않고 환경변수로만 주입
RUN --mount=type=secret,id=buildenv \
    sh -lc 'set -eu; set -a; . /run/secrets/buildenv; set +a; \
            echo "[build] exporting NEXT_PUBLIC_*"; env | grep "^NEXT_PUBLIC_" || true; \
            pnpm --reporter=append-only build'
  
# ---- run ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOST=0.0.0.0 PORT=3000
RUN apk add --no-cache libc6-compat

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER node
EXPOSE 3000
CMD ["node", "server.js"]
