'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithSession, saveTokens } from '@/services/authService';
import SkyBackground from '@/components/common/SkyBackground';
import ForestBackground from '@/components/common/ForestBackground';

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
            console.log('Existing farmer, redirecting to dashboard page');
            router.push('/dashboard');
          } else if (response.role === 'DONATOR') {
            // DONATOR - 기부자 페이지로 이동
            console.log('Existing donator, redirecting to donator page');
            router.push('/donator');
          } else {
            // 기타 역할
            console.log('Other role, redirecting to home page');
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
            <SkyBackground className="h-screen">
              <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                  <p className="mt-4 text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>카카오 로그인 처리 중...</p>
                </div>
              </div>
              <ForestBackground />
            </SkyBackground>
          );
        }

  // 에러 상태
  if (error) {
    return (
      <SkyBackground className="h-screen">
        <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">⚠️</div>
            <p className="text-white mb-4" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsProcessing(true);
                // 다시 시도
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
        <ForestBackground />
      </SkyBackground>
    );
  }

  return null;
}
