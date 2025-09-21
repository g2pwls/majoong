import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Windows에서 심볼릭 링크 문제로 인해 standalone 제거
  // git에 올릴 때는 주석 해제, 로컬 개발 시 주석 처리
  // output: "standalone",
  // 폰트 최적화 설정
  experimental: {
    optimizeCss: true,
  },
  // 폰트 preload 경고 줄이기
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
   // ⬇️ 여기 추가
  images: {
    // 방법 1: remotePatterns (권장: 프로토콜/호스트/경로 패턴 지정)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "e105.s3.ap-northeast-2.amazonaws.com",
        // 필요하면 경로 패턴도 제한 가능
        // pathname: "/farm/**",
      },
    ],

    // 방법 2: 간단히 도메인만 허용하고 싶다면 아래 사용 (위와 중복 사용 X)
    // domains: ["e105.s3.ap-northeast-2.amazonaws.com"],
  },
};

export default nextConfig;
