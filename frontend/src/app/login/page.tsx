'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    
    try {
      // TODO: 백엔드 구현 후 카카오톡 소셜 로그인 API 연동
      // 예: window.location.href = '/api/auth/kakao';
      
      // 임시로 2초 후 알림 표시 (실제 구현 시에는 카카오톡으로 리다이렉트)
      setTimeout(() => {
        setIsLoading(false);
        alert('카카오톡 소셜 로그인 기능은 백엔드 구현 후 연동됩니다.');
      }, 2000);
      
    } catch (error) {
      setIsLoading(false);
      console.error('로그인 오류:', error);
    }
  };

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
