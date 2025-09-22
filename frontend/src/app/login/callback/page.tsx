'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithSession, saveTokens } from '@/services/authService';

export default function OAuthCallbackPage() {
  console.log('OAuthCallbackPage - Component rendering');
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect - Processing OAuth callback');
    
    const handleOAuthCallback = async () => {
      try {
        // OAuth 콜백이므로 세션키가 있어야 함
        const response = await signInWithSession();
        console.log('OAuth callback response:', response);

        // JWT 토큰 저장 (email, role 정보 포함)
        saveTokens(response.accessToken, response.refreshToken, response.tempAccessToken, response.email, response.role);
        
        // 회원가입 여부에 따른 리다이렉트
        if (response.signUp) {
          // 신규 회원 - 회원가입 페이지로 이동
          console.log('New user, redirecting to signup page');
          router.push('/signup');
        } else {
          // 기존 회원 - role에 따른 리다이렉트
          if (response.role === 'FARMER') {
            console.log('Existing farmer, redirecting to mypage');
            router.push('/mypage');
          } else {
            // DONATOR 또는 기타
            console.log('Existing donator, redirecting to home page');
            router.push('/');
          }
        }
      } catch (error) {
        console.error('OAuth callback 처리 오류:', error);
        setError('로그인 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    // OAuth 콜백 처리
    handleOAuthCallback();
  }, [router]);

        // 처리 중일 때
        if (isProcessing) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">카카오 로그인 처리 중...</p>
              </div>
            </div>
          );
        }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsProcessing(true);
              // 다시 시도
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return null;
}
