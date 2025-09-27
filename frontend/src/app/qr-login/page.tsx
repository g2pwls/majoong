"use client";

import { Suspense } from "react";
import QrLoginInner from "./QrLoginInner";

export default function QrLoginPage() {
  return (
    <Suspense fallback={<div>자동 로그인 준비중...</div>}>
      <QrLoginInner />
    </Suspense>
  );
}