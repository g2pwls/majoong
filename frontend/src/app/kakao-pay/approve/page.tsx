"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function KakaoPayApproveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const handlePaymentApproval = async () => {
      try {
        // URL에서 pg_token 파라미터 확인
        const pgToken = searchParams.get('pg_token');
        
        console.log('카카오페이 승인 페이지 접근:', { 
          pgToken,
          allParams: Object.fromEntries(searchParams.entries())
        });
        
        if (!pgToken) {
          setStatus('error');
          setMessage('결제 승인 정보가 없습니다.');
          return;
        }

        // 백엔드에서 결제 승인과 기부를 모두 처리하므로
        // 프론트엔드에서는 성공 결과만 표시하면 됨
        console.log('결제 및 기부가 백엔드에서 처리됨');
        
        setStatus('success');
        setMessage('결제 및 기부가 성공적으로 완료되었습니다!');
        
        // 세션 스토리지 정리
        sessionStorage.removeItem('kakao_pay_info');
        
        // 3초 후 메인 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/');
        }, 3000);
        
      } catch (error) {
        console.error('결제 승인 처리 오류:', error);
        setStatus('error');
        setMessage('결제 처리 중 오류가 발생했습니다.');
      }
    };

    handlePaymentApproval();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">결제 처리 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">기부 완료!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500 mt-4">3초 후 메인 페이지로 이동합니다.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">처리 실패</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              메인 페이지로 이동
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">로딩 중...</h2>
        <p className="text-gray-600">결제 정보를 확인하고 있습니다.</p>
      </div>
    </div>
  );
}

export default function KakaoPayApprovePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KakaoPayApproveContent />
    </Suspense>
  );
}