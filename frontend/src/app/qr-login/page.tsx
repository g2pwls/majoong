"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function QrLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) return;

    const autoLogin = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/qr-login?token=${token}`
        );
        if (!res.ok) throw new Error("QR 로그인 실패");

        const data = await res.json();
        const result = data.result;

        // 기존 로그인과 똑같이 localStorage에 저장
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        localStorage.setItem("email", result.email);
        localStorage.setItem("role", result.role);

        // ✅ Navbar에게 로그인 상태 바뀌었다고 알려주기
        window.dispatchEvent(new Event("authStateChanged"));

        // ✅ 바로 기부 페이지로 이동
        router.replace("/godonate"); // 라우트명 확인 필요
      } catch (err) {
        console.error(err);
        alert("QR 로그인 실패. 다시 시도해주세요.");
        router.replace("/login");
      }
    };

    autoLogin();
  }, [token, router]);

  return <div>자동 로그인 중입니다...</div>;
}