'use client';

import React, { useState, useEffect } from 'react';
import { getTokens } from '@/services/authService';

interface FarmerInfo {
  role: string;
  nameString: string;
  email: string;
  walletAddress: string;
  businessNum: string;
  farmName: string;
}

interface FarmerProfileProps {
  farmerInfo?: FarmerInfo;
  userRole?: string;
}

export default function FarmerProfile({ farmerInfo: propFarmerInfo, userRole }: FarmerProfileProps) {
  const [farmerInfo, setFarmerInfo] = useState<FarmerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingFarmName, setIsEditingFarmName] = useState(false);
  const [editedFarmName, setEditedFarmName] = useState('');

  useEffect(() => {
    if (propFarmerInfo) {
      // props로 받은 데이터 사용
      setFarmerInfo(propFarmerInfo);
      setEditedFarmName(propFarmerInfo.farmName);
      setIsLoading(false);
    } else {
      // 기존 로직 (임시 데이터)
      const tokens = getTokens();
      
      const mockData: FarmerInfo = {
        role: 'farmer',
        nameString: '김농장',
        email: tokens.email || 'farmer@example.com',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        businessNum: '123-45-67890',
        farmName: '행복한 목장'
      };
      
      setFarmerInfo(mockData);
      setEditedFarmName(mockData.farmName);
      setIsLoading(false);
    }
  }, [propFarmerInfo]);

  const handleSaveFarmName = () => {
    // TODO: 실제 API 호출
    setFarmerInfo(prev => prev ? { ...prev, farmName: editedFarmName } : null);
    setIsEditingFarmName(false);
  };

  const handleCancelEdit = () => {
    setEditedFarmName(farmerInfo?.farmName || '');
    setIsEditingFarmName(false);
  };

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
            {farmerInfo?.nameString}
          </div>
        </div>

        {/* 계정 (이메일) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            계정
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
            {farmerInfo?.email}
          </div>
        </div>

        {/* 지갑 정보 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            지갑 주소
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 font-mono text-sm">
            {farmerInfo?.walletAddress}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            블록체인 지갑 주소입니다. 수정할 수 없습니다.
          </p>
        </div>

        {/* 사업자 등록번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사업자 등록번호
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
            {farmerInfo?.businessNum}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            사업자 등록번호는 수정할 수 없습니다.
          </p>
        </div>

        {/* 목장명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            목장명
          </label>
          {isEditingFarmName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editedFarmName}
                onChange={(e) => setEditedFarmName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="목장명을 입력하세요"
              />
              <button
                onClick={handleSaveFarmName}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {farmerInfo?.farmName}
              </div>
              <button
                onClick={() => setIsEditingFarmName(true)}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                수정
              </button>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            목장명은 수정할 수 있습니다.
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
              <p>목장명을 제외한 모든 정보는 수정할 수 없습니다. 정보 변경이 필요한 경우 고객센터로 문의해주세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
