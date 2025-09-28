'use client';

import Link from "next/link";
import { useEffect, useState } from 'react';
import Carousel from '@/components/ui/Carousel';
import InfiniteCarousel from '@/components/ui/InfiniteCarousel';
import { getHorses, Horse } from '@/services/apiService';

export default function Home() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);

  // 말 데이터 가져오기
  useEffect(() => {
    const fetchHorses = async () => {
      try {
        setLoading(true);
        const response = await getHorses({
          page: 0,
          size: 15 // 적당한 수의 말 데이터
        });
        
        const horseList = response.content.map(item => item.horse);
        setHorses(horseList);
      } catch (error) {
        console.error('말 데이터를 가져오는데 실패했습니다:', error);
        setHorses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHorses();
  }, []);

  // 말 이름 캐러셀용 데이터
  const horseNameItems = horses.map((horse) => ({
    id: horse.id.toString(),
    src: '',
    alt: horse.hrNm,
    text: horse.hrNm,
    farmId: horse.farm_id
  }));

  // 말 사진 캐러셀용 데이터
  const horseImageItems = horses.map((horse) => ({
    id: horse.id.toString(),
    src: horse.horse_url || `https://via.placeholder.com/200x200/4D3A2C/FFFFFF?text=${encodeURIComponent(horse.hrNm)}`,
    alt: horse.hrNm,
    text: horse.hrNm,
    farmId: horse.farm_id
  }));
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            마중
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            목장 후원과 기부를 통해 따뜻한 마음을 나누는 플랫폼입니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="px-8 py-3 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#4D3A2C' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d2f24'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4D3A2C'}
            >
              목장 후원하기
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              서비스 소개
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="relative py-10" style={{ backgroundColor: '#4D3A2C' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-right mb-6">
            <h2 className="text-2xl font-bold text-white mb-3">
              신뢰도 TOP10 목장을 만나보세요
            </h2>
            <p className="text-lg text-amber-100 mb-6">
              목장 운영에 기반한 신뢰도를 측정하여<br />
              퇴역마의 관리를 모니터링합니다
            </p>
          </div>
          <div className="relative">
            <div className="h-[300px] w-full flex items-center justify-center">
              <div className="w-full h-full">
                <Carousel useApiData={true} />
              </div>
            </div>
            <div className="absolute bottom-2 left-4">
              <p className="text-xs text-amber-200 opacity-80">
                카드 영역에서 마우스를 스크롤하거나 드래그로 구경할 수 있어요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              지금도 퇴역마가 많이 기다리고 있어요
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              여러분의 따뜻한 마음으로 그들을 도와주세요
            </p>
            
            {/* 감성적인 멘트 */}
            <p className="text-xl font-medium text-gray-700 mb-6">
              지금도 <span className="font-bold text-amber-600">{horses.length}마리</span>의 퇴역마가 여러분을 기다리고 있어요
            </p>
            <p className="text-lg text-gray-600 mb-8 italic">
              그들을 만나러 가시겠어요?
            </p>
            
            {/* 말 이름 캐러셀 */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                <span className="ml-2 text-gray-600">말 정보를 불러오는 중...</span>
              </div>
            ) : horseNameItems.length > 0 ? (
              <div className="mb-8">
                <InfiniteCarousel
                  items={horseNameItems}
                  width={180}
                  height={50}
                  reverse={false}
                />
              </div>
            ) : (
              <div className="py-8 text-gray-500">
                말 정보를 불러올 수 없습니다.
              </div>
            )}
          </div>
          
          {/* 말 사진 캐러셀 */}
          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                <span className="ml-2 text-gray-600">말 사진을 불러오는 중...</span>
              </div>
            ) : horseImageItems.length > 0 ? (
              <div>
                <InfiniteCarousel
                  items={horseImageItems}
                  width={200}
                  height={200}
                  reverse={true}
                />
              </div>
            ) : (
              <div className="py-8 text-gray-500 text-center">
                말 사진을 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16" style={{ backgroundColor: '#4D3A2C' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 시작해보세요
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            마음을 나누는 따뜻한 후원에 참여하세요
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-amber-300 text-black rounded-lg hover:bg-amber-400 transition-colors duration-200 shadow-md hover:shadow-lg font-medium"
          >
            카카오톡으로 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
