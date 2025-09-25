'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { registerFarm } from '@/services/userService';
import type { FarmRegistrationRequest } from '@/types/user';

export default function FarmRegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FarmRegistrationRequest>({
    phoneNumber: '',
    address: '',
    openingDate: '',
    area: 0,
    description: '',
    profileImage: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FarmRegistrationRequest, string>>>({});

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '');
    
    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 일반 입력값 변경 핸들러
  const handleInputChange = (field: keyof FarmRegistrationRequest, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 전화번호 입력 핸들러
  const handlePhoneNumberChange = (value: string) => {
    const formattedValue = formatPhoneNumber(value);
    handleInputChange('phoneNumber', formattedValue);
  };

  // 이미지 파일 선택 핸들러
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
    }
    handleInputChange('profileImage', file);
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = () => {
    handleInputChange('profileImage', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 폼 유효성 검증
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FarmRegistrationRequest, string>> = {};

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = '연락처를 입력해주세요.';
    } else if (!/^\d{3}-\d{4}-\d{4}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = '올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)';
    }

    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }

    if (!formData.openingDate) {
      newErrors.openingDate = '개업일자를 입력해주세요.';
    }

    if (!formData.area || formData.area <= 0) {
      newErrors.area = '목장 면적을 올바르게 입력해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '목장 소개를 입력해주세요.';
    } else if (formData.description.length < 10) {
      newErrors.description = '목장 소개는 최소 10자 이상 작성해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('목장 등록 시작:', formData);
      
      const response = await registerFarm(formData);
      
      if (response.isSuccess) {
        alert(`🎉 목장 등록이 완료되었습니다!\n농장 ID: ${response.result}`);
        router.push('/mypage');
      } else {
        alert(`목장 등록에 실패했습니다.\n${response.message}`);
      }
    } catch (error: unknown) {
      console.error('목장 등록 오류:', error);
      alert('목장 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">목장 등록</h1>
          <p className="text-gray-600">목장 정보를 등록하여 마중 서비스를 시작해보세요</p>
        </div>

        {/* 등록 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 프로필 이미지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목장 프로필 이미지
              </label>
              <div className="flex items-center space-x-4">
                {formData.profileImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(formData.profileImage)}
                      alt="목장 프로필"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    이미지 선택
                  </button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG 파일 (최대 5MB)</p>
                </div>
              </div>
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                placeholder="010-1234-5678"
                maxLength={13}
                className={`w-full px-3 py-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            {/* 주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목장 주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="예: 제주특별자치도 제주시 한림읍 협재리 123"
                className={`w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            {/* 개업일자 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                개업일자 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.openingDate}
                onChange={(e) => handleInputChange('openingDate', e.target.value)}
                className={`w-full px-3 py-2 border ${errors.openingDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.openingDate && (
                <p className="mt-1 text-sm text-red-500">{errors.openingDate}</p>
              )}
            </div>

            {/* 면적 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목장 면적 (평) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.area}
                onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || 0)}
                placeholder="예: 1000"
                className={`w-full px-3 py-2 border ${errors.area ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.area && (
                <p className="mt-1 text-sm text-red-500">{errors.area}</p>
              )}
            </div>

            {/* 목장 소개 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목장 소개 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="목장의 특징, 사육하는 말의 종류, 목장 운영 철학 등을 자유롭게 소개해주세요."
                rows={5}
                className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.description.length}/500자
                </p>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    목장 등록 중...
                  </div>
                ) : (
                  '목장 등록하기'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 안내사항 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">목장 등록 안내</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 목장 등록 후에도 정보를 수정할 수 있습니다.</li>
                <li>• 프로필 이미지는 목장을 대표하는 사진을 업로드해주세요.</li>
                <li>• 등록된 정보는 기부자들에게 공개됩니다.</li>
                <li>• 목장 등록 완료 후 마이페이지에서 상세 관리가 가능합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
