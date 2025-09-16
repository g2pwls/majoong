import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Windows에서 심볼릭 링크 문제로 인해 standalone 제거
  // git에 올릴 때는 주석 해제, 로컬 개발 시 주석 처리
  output: "standalone",
  // 폰트 최적화 설정
  experimental: {
    optimizeCss: true,
  },
  // 폰트 preload 경고 줄이기
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
