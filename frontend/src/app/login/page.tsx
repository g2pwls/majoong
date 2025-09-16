'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signInWithSession, saveTokens } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지 로드 시 세션 쿠키 기반 로그인 처리 (백엔드에서 리다이렉트된 경우)
  useEffect(() => {
    const handleCallbackLogin = async () => {
      try {
        // 세션 쿠키가 있는 상태에서 POST /api/v1/auth/sign-in 호출
        const response = await signInWithSession();
        
        // JWT 토큰 저장
        saveTokens(response.accessToken, response.refreshToken, response.tempAccessToken);
        
        // 회원가입 여부에 따른 리다이렉트
        if (response.signUp) {
          // 신규 회원 - 메인 페이지로 이동
          router.push('/');
        } else {
          // 기존 회원 - 회원가입 페이지로 이동
          router.push('/signup');
        }
      } catch (error) {
        console.error('로그인 처리 오류:', error);
        setError('로그인 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    // URL에 특정 파라미터가 있으면 콜백 처리로 간주
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || urlParams.has('state')) {
      setIsProcessing(true);
      handleCallbackLogin();
    }
  }, [router]);

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    
    try {
      // 백엔드의 카카오 OAuth2 로그인 URL로 리다이렉트
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-test.majoong.site';
      window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`;
      
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 콜백 처리 중일 때
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로그인 처리 중...</p>
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
              setIsProcessing(false);
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 일반 로그인 UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            카카오톡으로 간편하게 로그인하세요
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <button
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black transition-colors duration-200 shadow-md ${
                isLoading 
                  ? 'bg-yellow-200 cursor-not-allowed' 
                  : 'bg-yellow-300 hover:bg-yellow-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  카카오톡으로 이동 중...
                </>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <Image
                      src="/KakaoTalk_logo.svg.webp"
                      alt="카카오톡 아이콘"
                      width={20}
                      height={20}
                      className="text-black"
                    />
                  </span>
                  카카오톡으로 로그인
                </>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
