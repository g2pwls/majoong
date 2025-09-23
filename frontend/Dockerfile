# syntax=docker/dockerfile:1.7-labs

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 CI=1

# pnpm 준비
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
RUN apk add --no-cache libc6-compat

# 의존성 레이어 최대 재활용
COPY package.json pnpm-lock.yaml ./

# pnpm 스토어 캐시 사용
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm fetch

# 앱 소스 복사
COPY . .

# devDependencies 포함 설치 (빌드용)
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --prod=false

# 빌드: NEXT_PUBLIC_*만 노출 확인, Next 캐시도 활용
RUN --mount=type=secret,id=buildenv \
    --mount=type=cache,target=/app/.next/cache \
    sh -lc 'set -eu
            set -a
            . /run/secrets/buildenv
            set +a
            echo "[build] exporting NEXT_PUBLIC_* for build"
            env | grep "^NEXT_PUBLIC_" || true
            pnpm --reporter=append-only build'
 
# ---- run ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOST=0.0.0.0 \
    PORT=3000
RUN apk add --no-cache libc6-compat

# Next standalone 런타임 파일 복사 (권한 포함)
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

# 혹시 남아있을 수 있는 .env 제거(방어적)
RUN rm -f /app/.env

USER node
EXPOSE 3000

# (선택) 헬스체크
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "require('http').get({host: '127.0.0.1', port: process.env.PORT || 3000, path: '/api/health'}, r=>{if(r.statusCode<400)process.exit(0);process.exit(1)}).on('error',()=>process.exit(1))" || exit 1

CMD ["node", "server.js"]