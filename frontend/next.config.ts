import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next.config.ts
  // output: "standalone", // Windows에서 심볼릭 링크 문제로 인해 주석 처리
  reactStrictMode: true,
};

export default nextConfig;
