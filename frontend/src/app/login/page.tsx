'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import SkyBackground from '@/components/common/SkyBackground';
import ForestBackground from '@/components/common/ForestBackground';
// OAuth 콜백 로직은 /login/callback 페이지로 이동

export default function LoginPage() {
  console.log('LoginPage - Component rendering');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 페이지는 단순히 로그인 UI만 표시
  useEffect(() => {
    console.log('Login page loaded - showing login UI');
  }, []);

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    
    try {
      // 백엔드의 카카오 OAuth2 로그인 URL로 리다이렉트
      // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`;
      
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 에러 상태 (로그인 버튼 클릭 시 에러)
  if (error) {
    return (
      <SkyBackground className="h-screen">
        <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-3">⚠️</div>
            <p className="text-white mb-3">{error}</p>
            <button
              onClick={() => {
                setError(null);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
        <ForestBackground />
      </SkyBackground>
    );
  }

  // 일반 로그인 UI
  return (
    <SkyBackground className="h-screen">
      <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              로그인
            </h2>
            <p className="mt-1 text-sm text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              카카오톡으로 간편하게 로그인하세요
            </p>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="flex justify-center">
              <button
                onClick={handleKakaoLogin}
                disabled={isLoading}
                className={`group relative w-[70%] flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black transition-colors duration-200 shadow-md ${
                  isLoading 
                    ? 'cursor-not-allowed' 
                    : 'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2'
                }`}
                style={{
                  backgroundColor: isLoading ? '#fee500' : '#fee500',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#fdd835';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#fee500';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    카카오톡으로 이동 중...
                  </>
                ) : (
                  <>
                    <Image
                      src="/kakao_logo.png"
                      alt="kakaotalk"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    카카오톡으로 로그인
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ForestBackground />
    </SkyBackground>
  );
}
