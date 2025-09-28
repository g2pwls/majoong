'use client';

import React from 'react';

interface FarmerInfo {
  role: string;
  nameString: string;
  email: string;
  walletAddress: string;
  businessNum: string;
  farmName: string;
  farmVaultAddress: string;
}

interface FarmerProfileProps {
  farmerInfo?: FarmerInfo;
  userRole?: string;
}

export default function FarmerProfile({ farmerInfo }: FarmerProfileProps) {
  if (!farmerInfo) {
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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">회원정보</h2>
      </div>
      <div className="space-y-6">
        {/* 이름 */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <label className="w-32 sm:w-40 text-sm font-medium text-gray-700 mb-2 sm:mb-0 whitespace-nowrap">
            이름
          </label>
          <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 sm:ml-4">
            {farmerInfo?.nameString}
          </div>
        </div>

        {/* 계정 (이메일) */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <label className="w-32 sm:w-40 text-sm font-medium text-gray-700 mb-2 sm:mb-0 whitespace-nowrap">
            계정
          </label>
          <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 sm:ml-4 break-all">
            {farmerInfo?.email}
          </div>
        </div>

        {/* 지갑 정보 */}
        <div className="flex flex-col sm:flex-row sm:items-start">
          <label className="w-32 sm:w-40 text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:pt-2 whitespace-nowrap">
            지갑 주소
          </label>
          <div className="flex-1 sm:ml-4">
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 font-mono text-sm break-all overflow-wrap-anywhere">
              {farmerInfo?.walletAddress}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              블록체인 지갑 주소입니다. 수정할 수 없습니다.
            </p>
          </div>
        </div>

        {/* 금고 주소 */}
        <div className="flex flex-col sm:flex-row sm:items-start">
          <label className="w-32 sm:w-40 text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:pt-2 whitespace-nowrap">
            금고 주소
          </label>
          <div className="flex-1 sm:ml-4">
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 font-mono text-sm break-all overflow-wrap-anywhere">
              {farmerInfo?.farmVaultAddress}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              목장 금고 주소입니다. 수정할 수 없습니다.
            </p>
          </div>
        </div>

        {/* 사업자 등록번호 */}
        <div className="flex flex-col sm:flex-row sm:items-start">
          <label className="w-32 sm:w-40 text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:pt-2 whitespace-nowrap">
            사업자 등록번호
          </label>
          <div className="flex-1 sm:ml-4">
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 break-all">
              {farmerInfo?.businessNum}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              사업자 등록번호는 수정할 수 없습니다.
            </p>
          </div>
        </div>

      </div>

      <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#D3CAB8' }}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5" style={{ color: '#4D3A2C' }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium" style={{ color: '#4D3A2C' }}>
              정보 수정 안내
            </h3>
            <div className="mt-2 text-sm" style={{ color: '#6B4E3D' }}>
              <p>회원 정보는 수정할 수 없습니다. 정보 변경이 필요한 경우 고객센터로 문의해주세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
