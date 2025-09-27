'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCollection, type CollectionItem } from '@/services/collectionService';
import { getDonationHistory } from '@/services/userService';

export default function DonorCollection() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 컬렉션 데이터 로드
    const loadCollections = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 사용자의 후원 내역을 조회하여 기부한 농장들의 UUID를 가져옴
        const donationHistoryResponse = await getDonationHistory();
        
        // 중복 제거된 농장 UUID 목록 생성
        const farmUuids = [...new Set(donationHistoryResponse.result.donationHistory.content.map(donation => donation.farmUuid))];
        
        if (farmUuids.length === 0) {
          setCollections([]);
          return;
        }
        
        // 모든 농장의 컬렉션을 조회
        const allCollections: CollectionItem[] = [];
        for (const farmUuid of farmUuids) {
          try {
            const farmCollections = await getCollection(farmUuid);
            allCollections.push(...farmCollections);
          } catch (err) {
            console.error(`농장 ${farmUuid} 컬렉션 조회 실패:`, err);
          }
        }
        
        setCollections(allCollections);
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
          기부를 통해 얻은 말 카드들을 모아서 볼 수 있습니다.
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">컬렉션이 비어있습니다</h3>
          <p className="text-gray-600 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((item) => (
            <Card key={item.horseNumber} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="relative w-full h-48">
                    <Image
                      src={item.profileImage || '/horses/default.jpg'}
                      alt={item.horseName}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                        {item.farmName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.horseName}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <span className="font-medium">{item.breed}</span>
                        <span className="mx-2">•</span>
                        <span>{item.gender}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        생년: {item.birth}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">경주 횟수:</span>
                        <span className="font-medium">{item.raceCount}회</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 상금:</span>
                        <span className="font-medium">
                          {parseInt(item.totalPrize).toLocaleString()}원
                        </span>
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
