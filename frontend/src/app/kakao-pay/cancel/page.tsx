"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function KakaoPayCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-yellow-500 text-6xl mb-4">⚠</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">결제 취소</h2>
        <p className="text-gray-600 mb-6">사용자가 결제를 취소했습니다.</p>
        
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            메인 페이지로 이동
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full"
          >
            이전 페이지로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
