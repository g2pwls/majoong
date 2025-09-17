'use client';

import React, { useState, useEffect } from 'react';

interface FavoriteFarm {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
  totalSupport: number;
  supportCount: number;
  addedDate: string;
}

export default function DonorFavoriteFarms() {
  const [favoriteFarms, setFavoriteFarms] = useState<FavoriteFarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API에서 즐겨찾는 농장 목록을 가져와야 함
    // 현재는 임시 데이터 사용
    const mockData: FavoriteFarm[] = [
      {
        id: '1',
        name: '행복한 목장',
        description: '자연친화적인 목장에서 건강한 가축을 키우고 있습니다.',
        location: '강원도 평창군',
        totalSupport: 5000000,
        supportCount: 150,
        addedDate: '2024-01-10'
      },
      {
        id: '2',
        name: '사랑의 농장',
        description: '지속가능한 농업을 실천하는 친환경 농장입니다.',
        location: '경기도 가평군',
        totalSupport: 3200000,
        supportCount: 89,
        addedDate: '2024-01-05'
      }
    ];
    
    setFavoriteFarms(mockData);
    setIsLoading(false);
  }, []);

  const handleRemoveFavorite = (farmId: string) => {
    // TODO: 실제 API 호출
    setFavoriteFarms(prev => prev.filter(farm => farm.id !== farmId));
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">즐겨찾는 농장</h2>
      
      {favoriteFarms.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">즐겨찾는 농장이 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">관심 있는 농장을 즐겨찾기에 추가해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favoriteFarms.map((farm) => (
            <div key={farm.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{farm.name}</h3>
                <button
                  onClick={() => handleRemoveFavorite(farm.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="즐겨찾기에서 제거"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{farm.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {farm.location}
                </div>
                
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  총 후원금: {formatAmount(farm.totalSupport)}
                </div>
                
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  후원자 수: {farm.supportCount}명
                </div>
                
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  추가일: {formatDate(farm.addedDate)}
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                  후원하기
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors">
                  상세보기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              즐겨찾기 안내
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>관심 있는 농장을 즐겨찾기에 추가하여 빠르게 접근할 수 있습니다. 하트 아이콘을 클릭하여 제거할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
