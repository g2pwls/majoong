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
      <div className="p-6 bg-white rounded-lg shadow-lg" style={{ background: 'linear-gradient(135deg, #333844 0%, #2a2f3a 100%)' }}>
        <div className="mb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-64"></div>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg" style={{ background: 'linear-gradient(135deg, #333844 0%, #2a2f3a 100%)' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">컬렉션</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg" style={{ background: 'linear-gradient(135deg, #333844 0%, #2a2f3a 100%)' }}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white" style={{ 
            background: 'linear-gradient(45deg, #00e7ff, #ff00e7, #ffe759)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(0, 231, 255, 0.5)'
          }}>
            컬렉션
          </h2>
          <span className="text-sm font-medium text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-400/30">
            총 {totalCardCount}장
          </span>
        </div>
        <p className="text-sm text-gray-300">
          기부를 통해 얻은 말 카드들을 모아서 볼 수 있습니다.
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-blue-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">컬렉션이 비어있습니다</h3>
          <p className="text-gray-300 mb-6">
            목장에 기부하여 말 카드를 수집해보세요.
          </p>
          <Link
            href="/support"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            목장 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
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
