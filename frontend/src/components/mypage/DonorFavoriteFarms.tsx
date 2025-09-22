'use client';

import React, { useState, useEffect } from 'react';
import { getFavoriteFarms } from '@/services/userService';
import type { FavoriteFarmsResponse } from '@/types/user';

interface FavoriteFarm {
  farmName: string;
  farmUuid: string;
}

export default function DonorFavoriteFarms() {
  const [favoriteFarms, setFavoriteFarms] = useState<FavoriteFarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoriteFarms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response: FavoriteFarmsResponse = await getFavoriteFarms();
        
        if (response.isSuccess && response.result) {
          setFavoriteFarms(response.result);
        } else {
          setError('즐겨찾기 농장 목록을 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('즐겨찾기 농장 조회 오류:', error);
        setError('즐겨찾기 농장 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteFarms();
  }, []);

  const handleRemoveFavorite = (farmUuid: string) => {
    // TODO: 실제 즐겨찾기 삭제 API 호출
    setFavoriteFarms(prev => prev.filter(farm => farm.farmUuid !== farmUuid));
  };

  const handleVisitFarm = (farmUuid: string) => {
    // 농장 상세 페이지로 이동
    window.open(`/support/${farmUuid}`, '_blank');
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

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">오류가 발생했습니다</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteFarms.map((farm) => (
            <div key={farm.farmUuid} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{farm.farmName}</h3>
                <button
                  onClick={() => handleRemoveFavorite(farm.farmUuid)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="즐겨찾기에서 제거"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  농장 ID: {farm.farmUuid}
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => handleVisitFarm(farm.farmUuid)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  농장 보기
                </button>
                <button 
                  onClick={() => handleVisitFarm(farm.farmUuid)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                  후원하기
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
