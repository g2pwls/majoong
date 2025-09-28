'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCollection, type CollectionItem } from '@/services/collectionService';
import HologramCard from '@/components/ui/HologramCard';

export default function DonorCollection() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCardCount, setTotalCardCount] = useState(0);

  useEffect(() => {
    // 컬렉션 데이터 로드
    const loadCollections = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 사용자의 전체 컬렉션을 조회
        const collections = await getCollection();
        setCollections(collections);
        
        // 총 카드 수 계산
        const totalCards = collections.reduce((sum, item) => sum + item.cardCount, 0);
        setTotalCardCount(totalCards);
      } catch (err) {
        console.error('컬렉션 로드 실패:', err);
        setError('컬렉션을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCollections();
  }, []);



  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-64"></div>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">컬렉션</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="text-white px-4 py-2 rounded-md transition-colors"
            style={{ backgroundColor: '#4D3A2C' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d2f24'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4D3A2C'}
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">
            컬렉션
          </h2>
          <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ color: '#4D3A2C', backgroundColor: '#D3CAB8', border: '1px solid #4D3A2C' }}>
            총 {totalCardCount}장
          </span>
        </div>
        <p className="text-sm text-gray-600">
          기부를 통해 얻은 말 카드들을 모아서 볼 수 있습니다.
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 mb-4" style={{ color: '#4D3A2C' }} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">컬렉션이 비어있습니다</h3>
          <p className="text-gray-600 mb-6">
            목장에 기부하여 말 카드를 수집해보세요.
          </p>
          <Link
            href="/support"
            className="inline-flex items-center px-4 py-2 text-white rounded-md transition-colors"
            style={{ backgroundColor: '#4D3A2C' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d2f24'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4D3A2C'}
          >
            목장 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((item) => (
            <div key={item.horseNumber} className="flex flex-col items-center">
              <HologramCard
                imageUrl={item.profileImage || '/horses/default.jpg'}
                title={item.horseName}
                subtitle={`${item.breed} • ${item.gender} • ${item.birth.split('-')[0]}년생`}
                description={`${item.farmName} | 경주 ${item.raceCount}회 | 상금 ₩${parseInt(item.totalPrize).toLocaleString()}`}
                width={200}
                height={280}
                className="compact"
                onClick={() => {
                  console.log(`Clicked on ${item.horseName} from ${item.farmName}`);
                  // 여기에 카드 상세 정보 모달이나 페이지 이동 로직 추가 가능
                }}
              />
              <div className="mt-2 text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#D3CAB8', color: '#4D3A2C', border: '1px solid #4D3A2C' }}>
                  {item.cardCount}장
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
