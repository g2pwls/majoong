'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getMyFarm } from '@/services/userService';
import { MyFarmResponse } from '@/types/user';

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
  const [myFarmData, setMyFarmData] = useState<MyFarmResponse['result'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const fetchMyFarm = async () => {
      try {
        setIsLoading(true);
        const response = await getMyFarm();
        
        if (response.isSuccess && response.result) {
          const farmData = response.result;
          
          // API 응답 데이터 저장
          setMyFarmData(farmData);
          
          // 기존 FarmInfo 인터페이스에 맞춰 변환
          const farmInfo: FarmInfo = {
            id: farmData.farmUuid,
            name: farmData.farmName,
            description: farmData.description,
            location: farmData.address,
            imageUrl: farmData.profileImage,
            totalSupport: farmData.monthTotalAmount,
            supportCount: 0, // API에서 제공되지 않는 필드
            status: 'active',
            createdAt: '', // API에서 제공되지 않는 필드
            lastUpdated: '' // API에서 제공되지 않는 필드
          };
          
          setFarmInfo(farmInfo);
          setEditedInfo({
            name: farmData.farmName,
            description: farmData.description
          });
        }
      } catch (error) {
        console.error('나의 목장 정보 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyFarm();
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

  // 현재 미사용 함수들 - 향후 필요 시 활성화
  // const getStatusBadge = (status: string) => { ... };
  // const formatAmount = (amount: number) => { ... };
  // const formatDate = (dateString: string) => { ... };

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
        {/* 목장 이미지 */}
        {myFarmData?.profileImage && (
          <div className="mb-6">
            <Image
              src={myFarmData.profileImage}
              alt={farmInfo.name}
              width={800}
              height={192}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* 목장 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">기본 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">목장명:</span>
                <span className="text-sm font-medium text-gray-900">{myFarmData?.farmName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">목장주:</span>
                <span className="text-sm font-medium text-gray-900">{myFarmData?.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">목장 주소:</span>
                <span className="text-sm font-medium text-gray-900">{myFarmData?.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">면적:</span>
                <span className="text-sm font-medium text-gray-900">{myFarmData?.area}m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">연락처:</span>
                <span className="text-sm font-medium text-gray-900">{myFarmData?.phoneNumber}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">현재 상태</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">현재 두 수:</span>
                <span className="text-sm font-medium text-gray-900">{myFarmData?.horseCount}두</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">목장 점수:</span>
                <span className="text-sm font-medium text-gray-900">{myFarmData?.totalScore}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">월 총 후원금:</span>
                <span className="text-sm font-medium text-gray-900">{myFarmData?.monthTotalAmount.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 목장 설명 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            목장 설명
          </label>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  목장명
                </label>
                <input
                  type="text"
                  value={editedInfo.name}
                  onChange={(e) => setEditedInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="목장명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  목장 설명
                </label>
                <textarea
                  value={editedInfo.description}
                  onChange={(e) => setEditedInfo(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="목장에 대한 설명을 입력하세요"
                />
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {myFarmData?.description || '목장 설명이 없습니다.'}
            </div>
          )}
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
