ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends tini ca-certificates git python3 build-essential \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
# Hardhat은 devDeps에 있으므로 npm ci 그대로 사용
RUN npm ci

COPY . .

# 보안/운영
USER node
ENTRYPOINT ["/usr/bin/tini","--"]

# 기본은 테스트넷(실제 실행 시 -e NETWORK=mainnet 등으로 교체)
ENV NETWORK=sepolia

# 안전 가드: REALLY_DEPLOY=YES 없으면 중단
CMD ["sh","-lc", "[[ \"$REALLY_DEPLOY\" = \"YES\" ]] && npx hardhat run scripts/deploy.js --network ${NETWORK} || { echo 'Set REALLY_DEPLOY=YES to proceed'; exit 1; }"]
