'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getMyFarm, updateFarmInfo } from '@/services/userService';
import { MyFarmResponse, FarmUpdateRequest } from '@/types/user';

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
  const router = useRouter();
  const [farmInfo, setFarmInfo] = useState<FarmInfo | null>(null);
  const [myFarmData, setMyFarmData] = useState<MyFarmResponse['result'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    name: '',
    description: ''
  });
  const [editedPhoneNumber, setEditedPhoneNumber] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
           setEditedPhoneNumber(farmData.phoneNumber);
        }
      } catch (error) {
        console.error('목장 정보 조회 오류:', error);
      } finally {
    setIsLoading(false);
      }
    };

    fetchMyFarm();
  }, []);

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 전화번호 입력 핸들러
  const handlePhoneNumberChange = (value: string) => {
    const formattedValue = formatPhoneNumber(value);
    setEditedPhoneNumber(formattedValue);
  };

  // 이미지 선택 핸들러
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('목장 정보 저장 시작');
      
      const updateData: FarmUpdateRequest = {
        farmName: editedInfo.name,
        phoneNumber: editedPhoneNumber,
        description: editedInfo.description,
        image: selectedImage
      };
      
      const response = await updateFarmInfo(updateData);
      
      if (response.isSuccess) {
        // 성공 시 로컬 상태 업데이트
    setFarmInfo(prev => prev ? {
      ...prev,
      name: editedInfo.name,
      description: editedInfo.description,
      lastUpdated: new Date().toISOString().split('T')[0]
    } : null);
        
        if (myFarmData) {
          setMyFarmData(prev => prev ? {
            ...prev,
            farmName: editedInfo.name,
            phoneNumber: editedPhoneNumber,
            description: editedInfo.description,
            profileImage: imagePreview || prev.profileImage
          } : null);
        }
        
        alert('목장 정보가 성공적으로 수정되었습니다.');
    setIsEditing(false);
        
        // 이미지 미리보기 URL 정리
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        alert(`목장 정보 수정에 실패했습니다.\n${response.message}`);
      }
    } catch (error) {
      console.error('목장 정보 수정 오류:', error);
      alert('목장 정보 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedInfo({
      name: farmInfo?.name || '',
      description: farmInfo?.description || ''
    });
    setEditedPhoneNumber(myFarmData?.phoneNumber || '');
    
    // 이미지 미리보기 정리
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setIsEditing(false);
  };

  const handleFarmNameClick = () => {
    if (myFarmData?.farmUuid) {
      router.push(`/support/${myFarmData.farmUuid}`);
    }
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
      <div className="space-y-6">
          {/* 기본 정보 섹션 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">기본 정보</h3>
            <div className="space-y-6">
              {/* 목장명 (편집 가능) */}
            <div className="flex items-center">
              <label className="w-40 text-sm font-medium text-gray-700">
                  목장명
                </label>
              <div className="flex-1 ml-4 flex items-center gap-3">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedInfo.name}
                    onChange={(e) => setEditedInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="목장명을 입력하세요"
                  />
                ) : (
                  <div 
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={handleFarmNameClick}
                    title="목장 상세 페이지로 이동"
                  >
                    {myFarmData?.farmName}
                  </div>
                )}
                {!isEditing && (
                  <button
                    onClick={() => router.push(`/support/${myFarmData?.farmUuid}`)}
                    className="px-3 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                  >
                    내 목장 가기
                  </button>
                )}
              </div>
              </div>

              {/* 대표 사진 (편집 가능) */}
            <div className="flex items-start">
              <label className="w-40 text-sm font-medium text-gray-700 pt-2">
                  대표 사진
                </label>
              <div className="flex-1 ml-4">
                {isEditing ? (
                  <div className="space-y-3">
                    {(imagePreview || myFarmData?.profileImage) && (
                      <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 relative">
                        <Image
                          src={imagePreview || myFarmData?.profileImage || ''}
                          alt={editedInfo.name || '목장 대표 사진'}
                          width={800}
                          height={400}
                          className="w-full h-auto object-contain rounded-lg"
                        />
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="farm-image-upload"
                      />
                      <label
                        htmlFor="farm-image-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                      >
                        이미지 선택
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG 파일 (최대 5MB)</p>
                    </div>
                  </div>
                ) : (
                  myFarmData?.profileImage ? (
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <Image
                        src={myFarmData.profileImage}
                        alt={farmInfo?.name || '목장 대표 사진'}
                        width={800}
                        height={400}
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500">
                      대표 사진이 없습니다
                    </div>
                  )
                )}
              </div>
              </div>

              {/* 연락처 (편집 가능) */}
            <div className="flex items-center">
              <label className="w-40 text-sm font-medium text-gray-700">
                  연락처
                </label>
              <div className="flex-1 ml-4">
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedPhoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    placeholder="010-1234-5678"
                    maxLength={13}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                    {myFarmData?.phoneNumber}
                  </div>
                )}
              </div>
              </div>

              {/* 목장 설명 (편집 가능) */}
            <div className="flex items-start">
              <label className="w-40 text-sm font-medium text-gray-700 pt-2">
                  목장 설명
                </label>
              <div className="flex-1 ml-4">
                {isEditing ? (
                  <textarea
                    value={editedInfo.description}
                    onChange={(e) => setEditedInfo(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="목장에 대한 설명을 입력하세요"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                    {myFarmData?.description || '목장 설명이 없습니다.'}
                  </div>
                )}
              </div>
              </div>

              {/* 주소 (읽기 전용) */}
            <div className="flex items-center">
              <label className="w-40 text-sm font-medium text-gray-700">
                  주소
                </label>
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 ml-4">
                  {myFarmData?.address}
                </div>
              </div>

              {/* 면적 (읽기 전용) */}
            <div className="flex items-center">
              <label className="w-40 text-sm font-medium text-gray-700">
                  면적
                </label>
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 ml-4">
                  {myFarmData?.area}m²
                </div>
              </div>
            </div>
            
            {/* 정보 수정 버튼 */}
            {!isEditing && (
            <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  정보 수정
                </button>
              </div>
            )}
            
            {/* 편집 버튼들 */}
            {isEditing && (
            <div className="flex gap-2 pt-4 justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-4 py-2 text-white rounded-md transition-colors flex items-center ${
                    isSaving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      저장 중...
                    </>
                  ) : (
                    '저장'
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            )}
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
