# # =====================
# # 1) Build Stage
# # =====================
# FROM node:22-alpine AS builder
# WORKDIR /app

# # pnpm 설치 및 캐시 활용
# RUN corepack enable && corepack prepare pnpm@latest --activate

# # 1-1) 의존성만 먼저 설치 (변경 없는 경우 캐시 활용)
# COPY package.json pnpm-lock.yaml* ./
# RUN pnpm install

# # 1-2) 소스 복사
# COPY . .

# # ARG로 Jenkins 환경변수 주입
# ARG VITE_API_BASE_URL
# ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# # Next.js 빌드 (Turbopack 활용)
# RUN pnpm run build

# # =====================
# # 2) Runtime Stage (Blue-Green 배포용)
# # =====================
# FROM nginx:1.25-alpine
# WORKDIR /usr/share/nginx/html

# # Nginx 기본 설정 제거
# RUN rm -f /etc/nginx/conf.d/*.conf

# # Jenkins에서 ENV 인자에 따라 Nginx 설정 선택 가능
# ARG ENV=test
# COPY nginx/${ENV}.conf /etc/nginx/conf.d/default.conf

# # client_max_body_size 설정
# RUN sed -i '/http {/a \\    client_max_body_size 50M;' /etc/nginx/nginx.conf

# # 빌드 산출물 복사
# COPY --from=builder /app/.next /usr/share/nginx/html/.next
# COPY --from=builder /app/public /usr/share/nginx/html/public
# COPY --from=builder /app/package.json /usr/share/nginx/html/

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
