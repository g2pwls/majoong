'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signupComplete, getTokens, saveTokens } from '@/services/authService';

export default function WalletCreatePage() {
  // const [isCreating, setIsCreating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [userRole, setUserRole] = useState<string>('DONATOR');
  const hasStarted = useRef(false);

  useEffect(() => {
    // 중복 실행 방지
    if (hasStarted.current) return;
    hasStarted.current = true;

    // 지갑 생성 및 회원가입 완료
    const createWallet = async () => {
      try {
        // 1. 이미 처리 중인지 확인 (추가 중복 방지)
        const isProcessing = localStorage.getItem('isProcessingSignup');
        if (isProcessing === 'true') {
          console.log('이미 처리 중입니다. 중복 실행 방지');
          return;
        }

        // 2. 회원가입 데이터 가져오기
        const pendingSignupData = localStorage.getItem('pendingSignupData');
        if (!pendingSignupData) {
          alert('회원가입 정보가 없습니다. 다시 시도해주세요.');
          window.location.href = '/signup';
          return;
        }

        // 3. 처리 중 플래그 설정
        localStorage.setItem('isProcessingSignup', 'true');

        const signupData = JSON.parse(pendingSignupData);
        
        // 2. 토큰에서 이메일 정보 가져오기
        const tokens = getTokens();
        signupData.email = tokens.email || '';

        // 3. 사용자 역할 설정
        setUserRole(signupData.role);
        const isFarmer = signupData.role === 'FARMER';
        const walletCreationTime = isFarmer ? 13800 : 3800; // 목장주: 13.8초, 기부자: 3.8초

        // 4. 지갑 생성 시뮬레이션 시작 (0-30%) - 1단위씩 부드럽게 증가
        const steps = isFarmer ? [
          { message: '지갑 초기화 중...', startProgress: 0, endProgress: 3, delay: 1000 },
          { message: '개인키 생성 중...', startProgress: 3, endProgress: 6, delay: 750 },
          { message: '공개키 생성 중...', startProgress: 6, endProgress: 9, delay: 625 },
          { message: '지갑 주소 생성 중...', startProgress: 9, endProgress: 12, delay: 875 },
          { message: '목장 전용 지갑 설정 중...', startProgress: 12, endProgress: 15, delay: 750 },
          { message: '사업자 인증서 연동 중...', startProgress: 15, endProgress: 18, delay: 1000 },
          { message: '목장 계정 초기화 중...', startProgress: 18, endProgress: 21, delay: 625 },
          { message: '지갑 보안 설정 중...', startProgress: 21, endProgress: 30, delay: 750 }
        ] : [
          { message: '지갑 초기화 중...', startProgress: 0, endProgress: 5, delay: 600 },
          { message: '개인키 생성 중...', startProgress: 5, endProgress: 10, delay: 500 },
          { message: '공개키 생성 중...', startProgress: 10, endProgress: 15, delay: 400 },
          { message: '지갑 주소 생성 중...', startProgress: 15, endProgress: 20, delay: 500 },
          { message: '지갑 설정 중...', startProgress: 20, endProgress: 30, delay: 600 }
        ];

        for (const step of steps) {
          const progressRange = step.endProgress - step.startProgress;
          const stepDuration = step.delay;
          const incrementInterval = stepDuration / progressRange;
          
          for (let i = 0; i <= progressRange; i++) {
            await new Promise(resolve => setTimeout(resolve, incrementInterval));
            setProgress(step.startProgress + i);
          }
        }

        // 5. 실제 회원가입 API 호출 (지갑 생성 포함) - 30-99%
        console.log('회원가입 API 호출 시작:', signupData);
        setProgress(30); // API 호출 시작
        
        // API 호출 시작 시간 기록
        const apiStartTime = Date.now();
        
        // API 호출 중 진행률 업데이트 (역할별 시간 기반) - 1단위씩 부드럽게
        const apiProgressInterval = setInterval(() => {
          const elapsed = Date.now() - apiStartTime;
          // 역할별 시간에 따라 30%에서 99%까지 점진적으로 증가
          const apiProgress = Math.min(30 + (elapsed / walletCreationTime) * 69, 99);
          setProgress(Math.floor(apiProgress));
        }, 100); // 100ms마다 업데이트 (1단위씩 부드럽게)
        
        const response = await signupComplete(signupData);
        clearInterval(apiProgressInterval);
        
        // API 호출 완료 시간 기록
        const apiEndTime = Date.now();
        const apiDuration = apiEndTime - apiStartTime;
        console.log(`API 호출 소요 시간: ${apiDuration}ms`);
        
        if (response.isSuccess) {
          // 5. 회원가입 완료 - 진행률 100%로 설정
          setProgress(100);
          
          // 6. 새로운 토큰 정보 저장 (role 포함) - tempAccessToken은 null로 저장하여 제거
          const { accessToken, refreshToken, email, role } = response.result;
          saveTokens(accessToken, refreshToken, '', email, role); // tempAccessToken을 빈 문자열로 저장하여 제거
          
          // 7. 임시 데이터 삭제
          localStorage.removeItem('pendingSignupData');
          localStorage.removeItem('isProcessingSignup');
          
          // 8. 완료 팝업 표시 후 role에 따른 페이지 이동
          setTimeout(() => {
            if (role === 'FARMER') {
              alert('🎉 회원가입이 완료되었습니다!\n목장 등록 페이지로 이동합니다.');
              window.location.href = '/farm/register';
            } else {
              alert('🎉 회원가입이 완료되었습니다!\n지갑이 성공적으로 생성되었습니다.');
              window.location.href = '/';
            }
          }, 500);
        } else {
          throw new Error(response.message || '회원가입에 실패했습니다.');
        }

      } catch (error) {
        console.error('회원가입/지갑 생성 오류:', error);
        // 에러 발생 시 플래그 제거
        localStorage.removeItem('isProcessingSignup');
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
        window.location.href = '/signup';
      }
    };

    createWallet();
  }, []);

  const getProgressMessage = () => {
    // 역할별 메시지
    const isFarmer = userRole === 'FARMER';
    
    if (isFarmer) {
      // 목장주용 메시지 - 더 세밀한 범위로 조정
      if (progress < 3) return '지갑 초기화 중...';
      if (progress < 6) return '개인키 생성 중...';
      if (progress < 9) return '공개키 생성 중...';
      if (progress < 12) return '지갑 주소 생성 중...';
      if (progress < 15) return '목장 전용 지갑 설정 중...';
      if (progress < 18) return '사업자 인증서 연동 중...';
      if (progress < 21) return '목장 계정 초기화 중...';
      if (progress < 30) return '지갑 보안 설정 중...';
      if (progress < 50) return '목장주 회원가입 처리 중...';
      if (progress < 70) return '지갑 정보 저장 중...';
      if (progress < 90) return '목장 계정 설정 중...';
      if (progress < 100) return '최종 검증 중...';
      return '목장주 지갑 생성 완료!';
    } else {
      // 기부자용 메시지 - 더 세밀한 범위로 조정
      if (progress < 5) return '지갑 초기화 중...';
      if (progress < 10) return '개인키 생성 중...';
      if (progress < 15) return '공개키 생성 중...';
      if (progress < 20) return '지갑 주소 생성 중...';
      if (progress < 30) return '지갑 설정 중...';
      if (progress < 50) return '회원가입 처리 중...';
      if (progress < 70) return '지갑 정보 저장 중...';
      if (progress < 90) return '계정 설정 중...';
      if (progress < 100) return '최종 검증 중...';
      return '지갑 생성 완료!';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            지갑 생성
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            회원가입이 완료되었습니다. 지갑을 생성하고 있습니다.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* 지갑 생성 진행 상황 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center space-y-4">
              {/* 스피너 - 100% 완료 시에는 멈춤 */}
              <div className="flex justify-center">
                {progress < 100 ? (
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                ) : (
                  <div className="text-6xl">✅</div>
                )}
              </div>

              {/* 진행 메시지 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {getProgressMessage()}
                </h3>
                <p className="text-sm text-gray-500">
                  잠시만 기다려주세요. 지갑 생성이 완료되면 자동으로 이동합니다.
                </p>
              </div>

              {/* 진행률 바 */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* 진행률 퍼센트 */}
              <div className="text-sm text-gray-600">
                {progress}% 완료
              </div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  지갑 생성 안내
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>개인키와 공개키를 안전하게 생성합니다</li>
                    <li>지갑 주소가 자동으로 할당됩니다</li>
                    <li>생성된 지갑은 안전하게 보관됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
