'use client';

import Link from "next/link";
import { useEffect, useState } from 'react';
import Carousel from '@/components/ui/Carousel';
import InfiniteCarousel from '@/components/ui/InfiniteCarousel';
import HeroSection from '@/components/ui/HeroSection';
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
    <>
      <style jsx global>{`
        .hero-section-wrapper {
          position: relative;
          height: 75vh;
          overflow: hidden;
        }
        
        .hero-section-wrapper * {
          pointer-events: auto;
        }
        
        body {
          overflow-y: auto;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="hero-section-wrapper">
          <HeroSection />
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
              여러분을 기다리고 있는 퇴역마를 만나 보세요
            </h2>
            <p className="text-lg text-gray-600 mb-8" style={{ color: '#91745A' }}>
              목장에서 말의 소식을 확인할 수 있어요
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
            className="inline-block px-8 py-3 bg-amber-300 rounded-lg hover:bg-amber-400 transition-colors duration-200 shadow-md hover:shadow-lg font-medium"
            style={{ color: '#000000' }}
          >
            카카오톡으로 시작하기
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
