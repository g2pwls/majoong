# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
# 빌드 단계에서는 prod로 고정하지 않습니다
ENV NEXT_TELEMETRY_DISABLED=1 CI=1

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
RUN apk add --no-cache libc6-compat
 
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch  
COPY . .

# devDependencies 포함해서 설치 (중요!)
RUN pnpm install --frozen-lockfile --prod=false

# standalone 산출
RUN pnpm --reporter=append-only build
 
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
