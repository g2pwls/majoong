'use client';

import React, { useState, useEffect } from 'react';
import HologramCardCollection from '@/components/ui/HologramCardCollection';
import { getCollection, type CollectionItem } from '@/services/collectionService';

export default function HologramCardsDemoPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 실제 컬렉션 데이터 로드
        const collections = await getCollection();
        setCollections(collections);
      } catch (err) {
        console.error('컬렉션 로드 실패:', err);
        setError('컬렉션을 불러오는데 실패했습니다.');
        
        // 에러 시 더미 데이터로 폴백
        setCollections([
          {
            farmName: '스타목장',
            horseNumber: 'H001',
            horseName: '천둥마',
            profileImage: 'https://i.imgur.com/t1TBwxw.jpg',
            birth: '2018-03-15',
            raceCount: '15',
            gender: '수컷',
            breed: '아라비안',
            totalPrize: '500000000',
            firstRaceDate: '2019-05-20',
            lastRaceDate: '2023-10-15',
            cardCount: 3
          },
          {
            farmName: '드림팜',
            horseNumber: 'H002',
            horseName: '바람의 왕자',
            profileImage: 'https://i.imgur.com/t1TBwxw.jpg',
            birth: '2019-07-22',
            raceCount: '12',
            gender: '수컷',
            breed: '영국산',
            totalPrize: '350000000',
            firstRaceDate: '2020-08-10',
            lastRaceDate: '2023-09-30',
            cardCount: 2
          },
          {
            farmName: '문라이트 목장',
            horseNumber: 'H003',
            horseName: '달빛 여신',
            profileImage: 'https://i.imgur.com/t1TBwxw.jpg',
            birth: '2017-11-08',
            raceCount: '18',
            gender: '암컷',
            breed: '아라비안',
            totalPrize: '750000000',
            firstRaceDate: '2018-12-05',
            lastRaceDate: '2023-11-20',
            cardCount: 5
          },
          {
            farmName: '파이어 스테이블',
            horseNumber: 'H004',
            horseName: '불꽃의 전사',
            profileImage: 'https://i.imgur.com/t1TBwxw.jpg',
            birth: '2020-04-12',
            raceCount: '8',
            gender: '수컷',
            breed: '미국산',
            totalPrize: '200000000',
            firstRaceDate: '2021-06-18',
            lastRaceDate: '2023-08-25',
            cardCount: 1
          },
          {
            farmName: '스타가드 목장',
            horseNumber: 'H005',
            horseName: '별의 수호자',
            profileImage: 'https://i.imgur.com/t1TBwxw.jpg',
            birth: '2016-09-30',
            raceCount: '22',
            gender: '암컷',
            breed: '영국산',
            totalPrize: '1200000000',
            firstRaceDate: '2017-11-12',
            lastRaceDate: '2023-12-01',
            cardCount: 7
          },
          {
            farmName: '골든 크라운',
            horseNumber: 'H006',
            horseName: '황금의 제왕',
            profileImage: 'https://i.imgur.com/t1TBwxw.jpg',
            birth: '2015-12-25',
            raceCount: '25',
            gender: '수컷',
            breed: '아라비안',
            totalPrize: '1500000000',
            firstRaceDate: '2016-10-08',
            lastRaceDate: '2023-12-15',
            cardCount: 10
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollections();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">컬렉션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && collections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // CollectionItem을 HologramCardCollection이 기대하는 형식으로 변환
  const convertedCards = collections.map(item => ({
    id: item.horseNumber,
    name: item.horseName,
    farmName: item.farmName,
    description: `${item.breed} • ${item.gender} • 경주 ${item.raceCount}회`,
    imageUrl: item.profileImage || 'https://i.imgur.com/t1TBwxw.jpg',
    breed: item.breed,
    gender: item.gender,
    birthYear: item.birth.split('-')[0],
    raceCount: parseInt(item.raceCount),
    totalPrize: `₩${parseInt(item.totalPrize).toLocaleString()}`
  }));

  return (
    <main>
      <HologramCardCollection 
        cards={convertedCards}
        title={error ? "말 카드 컬렉션 (데모 데이터)" : "내 말 카드 컬렉션"}
      />
    </main>
  );
}
