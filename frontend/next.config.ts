import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Windows에서 심볼릭 링크 문제로 인해 standalone 제거
  output: "standalone",
};

export default nextConfig;
