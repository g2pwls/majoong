'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyBusiness } from '@/services/authService';
import TermsAgreement from '@/components/signup/TermsAgreement';

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
  businessVerifying: boolean;
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
    businessVerified: false,
    businessVerifying: false
  });
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const handleBusinessVerification = async () => {
    if (!farmerInfo.businessNumber || !farmerInfo.openingDate || !farmerInfo.farmName || !farmerInfo.representativeName) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }

    // 개업일자 형식 검증 (YYYY-MM-DD)
    if (!farmerInfo.openingDate || !/^\d{4}-\d{2}-\d{2}$/.test(farmerInfo.openingDate)) {
      alert('개업일자를 올바르게 입력해주세요.');
      return;
    }

    // 확인 팝업 표시
    const confirmed = confirm('입력하신 사업자 정보가 정확한지 확인해주세요.\n\n' +
      `목장명: ${farmerInfo.farmName}\n` +
      `대표자: ${farmerInfo.representativeName}\n` +
      `사업자 등록번호: ${farmerInfo.businessNumber}\n` +
      `개업일자: ${farmerInfo.openingDate}\n\n` +
      '위 정보가 정확하다면 확인을 눌러주세요.');
    
    if (confirmed) {
      try {
        setFarmerInfo(prev => ({ ...prev, businessVerifying: true }));
        
        // 날짜를 YYYY-MM-DD에서 YYYYMMDD로 변환
        const openingDateFormatted = farmerInfo.openingDate.replace(/-/g, '');
        
        const verificationData = {
          businessNum: farmerInfo.businessNumber,
          openingDate: openingDateFormatted,
          name: farmerInfo.representativeName,
          farmName: farmerInfo.farmName
        };
        
        const response = await verifyBusiness(verificationData);
        
        if (response.isSuccess) {
          if (response.result.verified) {
            setFarmerInfo(prev => ({ ...prev, businessVerified: true, businessVerifying: false }));
            alert('사업자 정보 확인이 완료되었습니다.');
          } else {
            setFarmerInfo(prev => ({ ...prev, businessVerifying: false }));
            alert('사업자 정보 확인에 실패했습니다. 입력하신 정보를 다시 확인해주세요.');
          }
        } else {
          setFarmerInfo(prev => ({ ...prev, businessVerifying: false }));
          alert(`사업자 정보 확인 중 오류가 발생했습니다: ${response.message}`);
        }
      } catch (error) {
        console.error('사업자 정보 확인 오류:', error);
        setFarmerInfo(prev => ({ ...prev, businessVerifying: false }));
        alert('사업자 정보 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleSubmit = async () => {
    // 약관 동의 확인
    if (!isTermsAgreed) {
      alert('모든 필수 약관에 동의해주세요.');
      return;
    }

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
        alert('사업자 정보 확인을 완료해주세요.');
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
                    개업일자 * (YYYY-MM-DD)
                  </label>
                  <input
                    id="openingDate"
                    type="text"
                    value={farmerInfo.openingDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9-]/g, ''); // 숫자와 하이픈만 허용
                      
                      // 하이픈 자동 추가
                      if (value.length >= 5 && value.charAt(4) !== '-') {
                        value = value.slice(0, 4) + '-' + value.slice(4);
                      }
                      if (value.length >= 8 && value.charAt(7) !== '-') {
                        value = value.slice(0, 7) + '-' + value.slice(7);
                      }
                      
                      // 10자리로 제한 (YYYY-MM-DD)
                      value = value.slice(0, 10);
                      
                      setFarmerInfo(prev => ({ ...prev, openingDate: value }));
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="예: 2024-01-01"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* 사업자 정보 확인 */}
              <div className="space-y-2">
                <button
                  onClick={handleBusinessVerification}
                  disabled={farmerInfo.businessVerified || farmerInfo.businessVerifying || !farmerInfo.businessNumber || !farmerInfo.openingDate || !farmerInfo.farmName || !farmerInfo.representativeName}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                    farmerInfo.businessVerified
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : farmerInfo.businessVerifying
                      ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                      : (!farmerInfo.businessNumber || !farmerInfo.openingDate || !farmerInfo.farmName || !farmerInfo.representativeName)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {farmerInfo.businessVerifying ? (
                    '⏳ 확인 중...'
                  ) : farmerInfo.businessVerified ? (
                    '✓ 확인 완료'
                  ) : (
                    '사업자 정보 확인'
                  )}
                </button>
                {farmerInfo.businessVerified && (
                  <p className="text-xs text-green-600">사업자 정보 확인이 완료되었습니다.</p>
                )}
              </div>
            </div>
          )}

          {/* 약관 동의 */}
          {userType && (
            <TermsAgreement
              userType={userType}
              onAgreementChange={setIsTermsAgreed}
            />
          )}

          {/* 가입 완료 버튼 */}
          {userType && (
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={!isTermsAgreed || (userType === 'farmer' && !farmerInfo.businessVerified)}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-colors duration-200 ${
                  !isTermsAgreed || (userType === 'farmer' && !farmerInfo.businessVerified)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : userType === 'donor'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                회원가입
              </button>
              {(!isTermsAgreed || (userType === 'farmer' && !farmerInfo.businessVerified)) && (
                <p className="mt-2 text-xs text-red-600 text-center">
                  {!isTermsAgreed 
                    ? '모든 필수 약관에 동의해주세요.'
                    : userType === 'farmer' && !farmerInfo.businessVerified
                    ? '사업자 정보 확인을 완료해주세요.'
                    : ''
                  }
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
