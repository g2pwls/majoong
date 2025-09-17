'use client';

import React, { useState, useEffect } from 'react';
import { getTokens } from '@/services/authService';

interface AdminInfo {
  name: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin: string;
}

export default function AdminProfile() {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API에서 관리자 정보를 가져와야 함
    // 현재는 임시 데이터 사용
    const tokens = getTokens();
    
    // 임시 데이터
    const mockData: AdminInfo = {
      name: '김관리',
      email: tokens.email || 'admin@example.com',
      role: '시스템 관리자',
      permissions: [
        '사용자 관리',
        '신고 처리',
        '농장 승인',
        '시스템 설정',
        '데이터 백업'
      ],
      lastLogin: '2024-01-15 14:30:00'
    };
    
    setAdminInfo(mockData);
    setIsLoading(false);
  }, []);

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('ko-KR');
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
            {adminInfo?.name}
          </div>
        </div>

        {/* 계정 (이메일) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            계정
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
            {adminInfo?.email}
          </div>
        </div>

        {/* 역할 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            관리자 역할
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
            {adminInfo?.role}
          </div>
        </div>

        {/* 권한 목록 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            권한 목록
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex flex-wrap gap-2">
              {adminInfo?.permissions.map((permission, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 마지막 로그인 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            마지막 로그인
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
            {adminInfo?.lastLogin ? formatDateTime(adminInfo.lastLogin) : '정보 없음'}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-red-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              관리자 권한 안내
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>관리자 계정의 모든 정보는 수정할 수 없습니다. 계정 정보 변경이 필요한 경우 시스템 관리자에게 문의해주세요.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              보안 안내
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>관리자 계정은 높은 권한을 가지고 있습니다. 보안을 위해 정기적으로 비밀번호를 변경하고, 의심스러운 활동이 발견되면 즉시 보고해주세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
