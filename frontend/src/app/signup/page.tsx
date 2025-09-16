'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupComplete, getTokens } from '@/services/authService';

type UserType = 'donor' | 'ranch_owner';

interface DonorInfo {
  name: string;
}

interface RanchOwnerInfo {
  ranchName: string;
  representativeName: string;
  businessNumber: string;
  openingDate: string;
  businessVerified: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({ name: '' });
  const [ranchInfo, setRanchInfo] = useState<RanchOwnerInfo>({
    ranchName: '',
    representativeName: '',
    businessNumber: '',
    openingDate: '',
    businessVerified: false
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBusinessVerification = async () => {
    if (!ranchInfo.businessNumber || !ranchInfo.openingDate) {
      alert('사업자 등록번호와 개업일자를 모두 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    
    try {
      // TODO: 백엔드 API 연동
      // const response = await fetch('/api/verify-business', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     businessNumber: ranchInfo.businessNumber,
      //     openingDate: ranchInfo.openingDate
      //   })
      // });
      
      // 임시로 2초 후 성공 처리
      setTimeout(() => {
        setRanchInfo(prev => ({ ...prev, businessVerified: true }));
        setIsVerifying(false);
        alert('사업자 등록번호 인증이 완료되었습니다.');
      }, 2000);
      
    } catch {
      setIsVerifying(false);
      alert('사업자 등록번호 인증에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSubmit = async () => {
    if (!userType) {
      alert('회원 유형을 선택해주세요.');
      return;
    }

    if (userType === 'donor' && !donorInfo.name) {
      alert('성명을 입력해주세요.');
      return;
    }

    if (userType === 'ranch_owner') {
      if (!ranchInfo.ranchName || !ranchInfo.representativeName) {
        alert('목장명과 대표자 성명을 입력해주세요.');
        return;
      }
      if (!ranchInfo.businessVerified) {
        alert('사업자 등록번호 인증을 완료해주세요.');
        return;
      }
    }

    // 가입 완료 버튼을 누르면 즉시 지갑 생성 페이지로 이동
    // 회원가입 데이터를 localStorage에 임시 저장
    const signupData = {
      role: userType === 'donor' ? 'DONATOR' : 'FARMER',
      name: userType === 'donor' ? donorInfo.name : ranchInfo.representativeName,
      farmName: userType === 'ranch_owner' ? ranchInfo.ranchName : '',
      businessNum: userType === 'ranch_owner' ? ranchInfo.businessNumber : '',
      openingAt: userType === 'ranch_owner' ? ranchInfo.openingDate : ''
    };

    // 회원가입 데이터를 localStorage에 저장
    localStorage.setItem('pendingSignupData', JSON.stringify(signupData));
    
    // 지갑 생성 페이지로 이동
    router.push('/wallet/create');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            카카오톡으로 로그인하셨습니다. 추가 정보를 입력해주세요.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* 회원 유형 선택 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">회원 유형을 선택해주세요</h3>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setUserType('donor')}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  userType === 'donor'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium text-gray-900">기부자</div>
                <div className="text-sm text-gray-500">목장에 기부하고 싶은 분</div>
              </button>
              <button
                onClick={() => setUserType('ranch_owner')}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  userType === 'ranch_owner'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                }`}
              >
                <div className="font-medium text-gray-900">목장주</div>
                <div className="text-sm text-gray-500">목장을 운영하고 계신 분</div>
              </button>
            </div>
          </div>

          {/* 기부자 정보 입력 */}
          {userType === 'donor' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-medium text-gray-900">기부자 정보</h3>
              
              <div>
                <label htmlFor="donorName" className="block text-sm font-medium text-gray-700">
                  성명 *
                </label>
                <input
                  id="donorName"
                  type="text"
                  value={donorInfo.name}
                  onChange={(e) => setDonorInfo({ name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="성명을 입력해주세요"
                />
              </div>
            </div>
          )}

          {/* 목장주 정보 입력 */}
          {userType === 'ranch_owner' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-medium text-gray-900">목장주 정보</h3>
              
              <div>
                <label htmlFor="ranchName" className="block text-sm font-medium text-gray-700">
                  목장명 *
                </label>
                <input
                  id="ranchName"
                  type="text"
                  value={ranchInfo.ranchName}
                  onChange={(e) => setRanchInfo(prev => ({ ...prev, ranchName: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="목장명을 입력해주세요"
                />
              </div>

              <div>
                <label htmlFor="representativeName" className="block text-sm font-medium text-gray-700">
                  대표자 성명 *
                </label>
                <input
                  id="representativeName"
                  type="text"
                  value={ranchInfo.representativeName}
                  onChange={(e) => setRanchInfo(prev => ({ ...prev, representativeName: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="대표자 성명을 입력해주세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700">
                    사업자 등록번호 *
                  </label>
                  <input
                    id="businessNumber"
                    type="text"
                    value={ranchInfo.businessNumber}
                    onChange={(e) => setRanchInfo(prev => ({ ...prev, businessNumber: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="000-00-00000"
                    maxLength={12}
                  />
                </div>
                <div>
                  <label htmlFor="openingDate" className="block text-sm font-medium text-gray-700">
                    개업일자 *
                  </label>
                  <input
                    id="openingDate"
                    type="date"
                    value={ranchInfo.openingDate}
                    onChange={(e) => setRanchInfo(prev => ({ ...prev, openingDate: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* 사업자 인증 */}
              <div className="space-y-2">
                <button
                  onClick={handleBusinessVerification}
                  disabled={isVerifying || ranchInfo.businessVerified}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                    ranchInfo.businessVerified
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : isVerifying
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      인증 중...
                    </>
                  ) : ranchInfo.businessVerified ? (
                    '✓ 인증 완료'
                  ) : (
                    '사업자 등록번호 인증'
                  )}
                </button>
                {ranchInfo.businessVerified && (
                  <p className="text-xs text-green-600">사업자 등록번호 인증이 완료되었습니다.</p>
                )}
              </div>
            </div>
          )}

          {/* 가입 완료 버튼 */}
          {userType && (
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-colors duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : userType === 'donor'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    가입 처리 중...
                  </>
                ) : (
                  '가입 완료'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
