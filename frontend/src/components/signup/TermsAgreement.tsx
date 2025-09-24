'use client';

import React, { useState } from 'react';
import TermsModal from './TermsModal';

interface TermsAgreementProps {
  userType: 'donor' | 'farmer';
  onAgreementChange: (isAllAgreed: boolean) => void;
  onAllAgreementClick?: () => void; // 전체 동의 클릭 시 콜백
  onAllAgreementComplete?: () => void; // 모든 약관이 완료되었을 때 콜백
}

export default function TermsAgreement({ userType, onAgreementChange, onAllAgreementClick, onAllAgreementComplete }: TermsAgreementProps) {
  const [agreements, setAgreements] = useState({
    all: false,
    service: false,
    payment: false,
    privacy: false
  });
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    termType: 'service' | 'payment' | 'privacy' | null;
  }>({
    isOpen: false,
    termType: null
  });

  const handleAgreementChange = (key: keyof typeof agreements, value: boolean) => {
    let newAgreements = { ...agreements, [key]: value };
    
    // 전체 동의 체크박스 클릭 시
    if (key === 'all') {
      newAgreements = {
        all: value,
        service: value,
        payment: value,
        privacy: value
      };
      
      // 전체 동의가 체크될 때 (false -> true) 콜백 호출
      if (value && !agreements.all && onAllAgreementClick) {
        onAllAgreementClick();
      }
    } else {
      // 개별 체크박스 클릭 시 전체 동의 상태 업데이트
      const individualTerms = ['service', 'payment', 'privacy'] as const;
      const allChecked = individualTerms.every(term => 
        term === key ? value : newAgreements[term]
      );
      newAgreements.all = allChecked;
      
      // 개별 체크박스를 통해 모든 약관이 완료되었을 때 (이전에는 완료 상태가 아니었음)
      const wasNotAllAgreed = !individualTerms.every(term => agreements[term]);
      if (allChecked && wasNotAllAgreed && onAllAgreementComplete) {
        onAllAgreementComplete();
      }
    }
    
    setAgreements(newAgreements);
    
    // 모든 개별 약관이 동의되었는지 확인
    const requiredTerms = ['service', 'payment', 'privacy'] as const;
    const allRequiredAgreed = requiredTerms.every(term => newAgreements[term]);
    onAgreementChange(allRequiredAgreed);
  };

  const openModal = (termType: 'service' | 'payment' | 'privacy') => {
    setModalState({ isOpen: true, termType });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, termType: null });
  };

  return (
    <>
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">이용약관 동의</h3>
        <p className="text-sm text-gray-600">
          {userType === 'donor' ? '기부자' : '목장주'} 서비스 이용을 위해 다음 약관에 동의해주세요.
        </p>
        
        {/* 전체 동의 */}
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <input
            type="checkbox"
            id="agree-all"
            checked={agreements.all}
            onChange={(e) => handleAgreementChange('all', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="agree-all" className="text-lg font-semibold text-blue-900 cursor-pointer">
            전체 동의
          </label>
        </div>
        
        <div className="space-y-3 ml-4">
          {/* 마중 이용 약관 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="agree-service"
                checked={agreements.service}
                onChange={(e) => handleAgreementChange('service', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="agree-service" className="text-sm text-gray-700 cursor-pointer">
                마중 이용 약관 동의 <span className="text-red-500">(필수)</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => openModal('service')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              보기
            </button>
          </div>
          
          {/* 결제 관련 약관 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="agree-payment"
                checked={agreements.payment}
                onChange={(e) => handleAgreementChange('payment', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="agree-payment" className="text-sm text-gray-700 cursor-pointer">
                결제 관련 약관 동의 <span className="text-red-500">(필수)</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => openModal('payment')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              보기
            </button>
          </div>
          
          {/* 개인정보 처리방침 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="agree-privacy"
                checked={agreements.privacy}
                onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="agree-privacy" className="text-sm text-gray-700 cursor-pointer">
                개인정보 처리방침 동의 <span className="text-red-500">(필수)</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => openModal('privacy')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              보기
            </button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          위 약관에 동의하시면 마중의 {userType === 'donor' ? '기부자' : '목장주'} 서비스를 이용할 수 있습니다.
          모든 필수 약관에 동의해야 가입이 완료됩니다.
        </p>
      </div>

      {/* 약관 모달 */}
      <TermsModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        termType={modalState.termType!}
      />
    </>
  );
}
