'use client';

import React, { useState, useEffect } from 'react';

interface FarmInfo {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
  totalSupport: number;
  supportCount: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastUpdated: string;
}

export default function FarmerMyFarm() {
  const [farmInfo, setFarmInfo] = useState<FarmInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    // TODO: 실제 API에서 목장 정보를 가져와야 함
    // 현재는 임시 데이터 사용
    const mockData: FarmInfo = {
      id: '1',
      name: '행복한 목장',
      description: '자연친화적인 목장에서 건강한 가축을 키우고 있습니다. 지속가능한 농업을 실천하며, 후원자분들과 함께 성장하고 있습니다.',
      location: '강원도 평창군',
      totalSupport: 5000000,
      supportCount: 150,
      status: 'active',
      createdAt: '2024-01-01',
      lastUpdated: '2024-01-15'
    };
    
    setFarmInfo(mockData);
    setEditedInfo({
      name: mockData.name,
      description: mockData.description
    });
    setIsLoading(false);
  }, []);

  const handleSave = () => {
    // TODO: 실제 API 호출
    setFarmInfo(prev => prev ? {
      ...prev,
      name: editedInfo.name,
      description: editedInfo.description,
      lastUpdated: new Date().toISOString().split('T')[0]
    } : null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedInfo({
      name: farmInfo?.name || '',
      description: farmInfo?.description || ''
    });
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">활성</span>;
      case 'inactive':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">비활성</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">검토중</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!farmInfo) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">목장 정보가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">목장을 등록해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">나의 목장</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            정보 수정
          </button>
        )}
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* 목장 상태 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">목장 상태:</span>
            {getStatusBadge(farmInfo.status)}
          </div>
          <span className="text-sm text-gray-500">
            마지막 수정: {formatDate(farmInfo.lastUpdated)}
          </span>
        </div>

        {/* 목장명 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            목장명
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedInfo.name}
              onChange={(e) => setEditedInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="목장명을 입력하세요"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {farmInfo.name}
            </div>
          )}
        </div>

        {/* 목장 설명 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            목장 설명
          </label>
          {isEditing ? (
            <textarea
              value={editedInfo.description}
              onChange={(e) => setEditedInfo(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="목장에 대한 설명을 입력하세요"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {farmInfo.description}
            </div>
          )}
        </div>

        {/* 목장 위치 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            목장 위치
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
            {farmInfo.location}
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">총 후원금</p>
                <p className="text-lg font-semibold text-blue-900">{formatAmount(farmInfo.totalSupport)}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">후원자 수</p>
                <p className="text-lg font-semibold text-green-900">{farmInfo.supportCount}명</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">등록일</p>
                <p className="text-lg font-semibold text-purple-900">{formatDate(farmInfo.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 편집 버튼들 */}
        {isEditing && (
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        )}
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
              목장 관리 안내
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>목장명과 설명은 언제든지 수정할 수 있습니다. 정확한 정보를 제공하여 후원자들이 목장을 더 잘 이해할 수 있도록 도와주세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
