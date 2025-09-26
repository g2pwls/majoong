'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CollectionItem {
  id: string;
  farmName: string;
  farmImage: string;
  address: string;
  totalScore: number;
  horseCount: number;
  isBookmarked: boolean;
  lastVisited: string;
}

export default function DonorCollection() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 컬렉션 데이터 로드 (실제 API 연동 필요)
    const loadCollections = async () => {
      try {
        setIsLoading(true);
        // TODO: 실제 API 호출로 변경
        // const response = await getMyCollections();
        
        // 임시 데이터
        const mockData: CollectionItem[] = [
          {
            id: 'farm1',
            farmName: '찐찐희산목장',
            farmImage: '/horses/farm1.jpg',
            address: '부산 강서구 낙동남로511번길 42',
            totalScore: 46.2,
            horseCount: 5,
            isBookmarked: true,
            lastVisited: '2024-01-15'
          },
          {
            id: 'farm2',
            farmName: '해피마장',
            farmImage: '/horses/farm2.jpg',
            address: '부산 강서구 낙동남로511번길 42',
            totalScore: 29.2,
            horseCount: 3,
            isBookmarked: true,
            lastVisited: '2024-01-10'
          }
        ];
        
        setCollections(mockData);
      } catch (err) {
        console.error('컬렉션 로드 실패:', err);
        setError('컬렉션을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCollections();
  }, []);

  const handleRemoveFromCollection = async (farmId: string) => {
    try {
      // TODO: 실제 API 호출로 변경
      // await removeFromCollection(farmId);
      
      setCollections(prev => prev.filter(item => item.id !== farmId));
    } catch (err) {
      console.error('컬렉션에서 제거 실패:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">내 컬렉션</h3>
        <p className="text-sm text-gray-600">
          즐겨찾기한 목장들을 모아서 볼 수 있습니다.
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">컬렉션이 비어있습니다</h3>
          <p className="text-gray-600 mb-6">
            마음에 드는 목장을 즐겨찾기에 추가해보세요.
          </p>
          <Link
            href="/support"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            목장 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {collections.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <Image
                      src={item.farmImage}
                      alt={item.farmName}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(item.totalScore)}`}>
                        {item.totalScore}점
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.farmName}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.address}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <Users className="w-4 h-4 mr-1" />
                          말 {item.horseCount}마리
                        </div>
                        <p className="text-xs text-gray-500">
                          마지막 방문: {formatDate(item.lastVisited)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Link
                          href={`/support/${item.id}`}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        >
                          방문하기
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFromCollection(item.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          제거
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
