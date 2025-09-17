'use client';

import React, { useState, useEffect } from 'react';
import { getTokens } from '@/services/authService';

interface DonorInfo {
  name: string;
  email: string;
  walletAddress: string;
}

export default function DonorProfile() {
  const [donorInfo, setDonorInfo] = useState<DonorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API에서 기부자 정보를 가져와야 함
    // 현재는 임시 데이터 사용
    const tokens = getTokens();
    
    // 임시 데이터
    const mockData: DonorInfo = {
      name: '김기부',
      email: tokens.email || 'donor@example.com',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
    };
    
    setDonorInfo(mockData);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">회원 정보</h2>
      
      <div className="space-y-6">
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
            {donorInfo?.name}
          </div>
        </div>

        {/* 계정 (이메일) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            계정
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
            {donorInfo?.email}
          </div>
        </div>

        {/* 지갑 정보 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            지갑 주소
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 font-mono text-sm">
            {donorInfo?.walletAddress}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            블록체인 지갑 주소입니다. 수정할 수 없습니다.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              정보 수정 안내
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>기부자의 회원 정보는 수정할 수 없습니다. 정보 변경이 필요한 경우 고객센터로 문의해주세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
