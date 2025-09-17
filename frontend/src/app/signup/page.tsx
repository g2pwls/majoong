'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyBusiness } from '@/services/authService';

type UserType = 'donor' | 'farmer';

interface DonorInfo {
  name: string;
}

interface FarmerInfo {
  farmName: string;
  representativeName: string;
  businessNumber: string;
  openingDate: string;
  businessVerified: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({ name: '' });
  const [farmerInfo, setFarmerInfo] = useState<FarmerInfo>({
    farmName: '',
    representativeName: '',
    businessNumber: '',
    openingDate: '',
    businessVerified: false
  });
  const [isVerifying, setIsVerifying] = useState(false);

  const handleBusinessVerification = async () => {
    if (!farmerInfo.businessNumber || !farmerInfo.openingDate || !farmerInfo.farmName || !farmerInfo.representativeName) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    
    try {
      // 실제 백엔드 API 호출
      const verificationData = {
        businessNum: farmerInfo.businessNumber,
        openingDate: farmerInfo.openingDate,
        name: farmerInfo.representativeName,
        farmName: farmerInfo.farmName
      };

      const response = await verifyBusiness(verificationData);
      
      if (response.isSuccess && response.data?.verified) {
        setFarmerInfo(prev => ({ ...prev, businessVerified: true }));
        alert('사업자 등록번호 인증이 완료되었습니다.');
      } else {
        alert(response.message || '사업자 등록번호 인증에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('사업자 인증 오류:', error);
      alert('사업자 등록번호 인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsVerifying(false);
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

    if (userType === 'farmer') {
      if (!farmerInfo.farmName || !farmerInfo.representativeName) {
        alert('목장명과 대표자 성명을 입력해주세요.');
        return;
      }
      if (!farmerInfo.businessVerified) {
        alert('사업자 등록번호 인증을 완료해주세요.');
        return;
      }
    }

    // 가입 완료 버튼을 누르면 즉시 지갑 생성 페이지로 이동
    // 회원가입 데이터를 localStorage에 임시 저장
    const signupData = {
      role: userType === 'donor' ? 'DONATOR' : 'FARMER',
      name: userType === 'donor' ? donorInfo.name : farmerInfo.representativeName,
      farmName: userType === 'farmer' ? farmerInfo.farmName : '',
      businessNum: userType === 'farmer' ? farmerInfo.businessNumber : '',
      openingAt: userType === 'farmer' ? farmerInfo.openingDate : ''
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
                onClick={() => setUserType('farmer')}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  userType === 'farmer'
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
          {userType === 'farmer' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-medium text-gray-900">목장주 정보</h3>
              
              <div>
                <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
                  목장명 *
                </label>
                <input
                  id="farmName"
                  type="text"
                  value={farmerInfo.farmName}
                  onChange={(e) => setFarmerInfo(prev => ({ ...prev, farmName: e.target.value }))}
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
                  value={farmerInfo.representativeName}
                  onChange={(e) => setFarmerInfo(prev => ({ ...prev, representativeName: e.target.value }))}
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
                    value={farmerInfo.businessNumber}
                    onChange={(e) => setFarmerInfo(prev => ({ ...prev, businessNumber: e.target.value }))}
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
                    value={farmerInfo.openingDate}
                    onChange={(e) => setFarmerInfo(prev => ({ ...prev, openingDate: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* 사업자 인증 */}
              <div className="space-y-2">
                <button
                  onClick={handleBusinessVerification}
                  disabled={isVerifying || farmerInfo.businessVerified || !farmerInfo.businessNumber || !farmerInfo.openingDate || !farmerInfo.farmName || !farmerInfo.representativeName}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                    farmerInfo.businessVerified
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : isVerifying
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : (!farmerInfo.businessNumber || !farmerInfo.openingDate || !farmerInfo.farmName || !farmerInfo.representativeName)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      인증 중...
                    </>
                  ) : farmerInfo.businessVerified ? (
                    '✓ 인증 완료'
                  ) : (
                    '사업자 등록번호 인증'
                  )}
                </button>
                {farmerInfo.businessVerified && (
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
                disabled={userType === 'farmer' && !farmerInfo.businessVerified}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-colors duration-200 ${
                  userType === 'farmer' && !farmerInfo.businessVerified
                    ? 'bg-gray-400 cursor-not-allowed'
                    : userType === 'donor'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                회원가입
              </button>
              {userType === 'farmer' && !farmerInfo.businessVerified && (
                <p className="mt-2 text-xs text-red-600 text-center">
                  사업자 등록번호 인증을 완료해주세요.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
