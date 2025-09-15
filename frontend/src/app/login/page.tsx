'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    
    try {
      // 백엔드 OAuth2 엔드포인트로 리다이렉트
      window.location.href = 'https://api-test.majoong.site/oauth2/authorization/kakao';
      
    } catch (error) {
      setIsLoading(false);
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  // OAuth 콜백 처리 (백엔드에서 리다이렉트된 후)
  React.useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionKey = urlParams.get('session_key');
      const error = urlParams.get('error');
      
      if (error) {
        console.error('OAuth 에러:', error);
        alert('OAuth 로그인 중 오류가 발생했습니다.');
        return;
      }
      
      if (sessionKey) {
        setIsLoading(true);
        
        try {
          // 백엔드 API로 로그인 요청
          const response = await authService.signIn({
            oauthId: sessionKey,
            oauthProvider: 'kakao'
          });
          
          // 토큰 및 사용자 정보 저장
          authService.saveTokens(response.accessToken, response.refreshToken);
          authService.saveUserInfo(response.memberUuid, response.email);

          // 회원가입 여부에 따른 페이지 이동
          if (response.isSignUp) {
            router.push('/signup');
          } else {
            router.push('/');
          }
          
        } catch (error) {
          console.error('OAuth 콜백 처리 오류:', error);
          alert('로그인 처리 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [router]);

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
