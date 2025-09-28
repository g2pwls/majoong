'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { getFarms, Farm } from '@/services/apiService';

interface CarouselItem {
  id: string;
  title: string;
  number: string;
  image: string;
  farmName?: string;
  farmScore?: number;
  address?: string;
  horseCount?: number;
}

interface CarouselProps {
  items?: CarouselItem[];
  className?: string;
  useApiData?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({ items = [], className = '', useApiData = false }) => {
  const [progress, setProgress] = useState(50);
  const [active, setActive] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [apiItems, setApiItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // API에서 목장 데이터 가져오기
  useEffect(() => {
    if (!useApiData) return;

    const fetchFarms = async () => {
      try {
        setLoading(true);
        const response = await getFarms({
          page: 0,
          size: 20 // 더 많은 데이터를 가져온 후 클라이언트에서 정렬
        });

        // 신뢰도 순으로 정렬하고 상위 10개 선택
        const sortedFarms = response.content
          .sort((a, b) => b.total_score - a.total_score)
          .slice(0, 10);

        const farmItems: CarouselItem[] = sortedFarms.map((farm, index) => ({
          id: farm.id || `farm-${index}`,
          title: farm.farm_name || '목장명 없음',
          number: String(index + 1).padStart(2, '0'),
          image: farm.image_url || '/farms/default-farm.jpg',
          farmName: farm.farm_name,
          farmScore: farm.total_score,
          address: farm.address,
          horseCount: farm.horse_count
        }));

        setApiItems(farmItems);
      } catch (error) {
        console.error('목장 데이터 조회 실패:', error);
        // 에러 시 기본 데이터 사용
        setApiItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, [useApiData]);

  // 사용할 아이템 결정 (API 데이터 우선)
  const displayItems = useApiData ? apiItems : items;

  const speedWheel = 0.02;
  const speedDrag = -0.1;

  // Z-index 계산 함수
  const getZindex = (array: CarouselItem[], index: number) => {
    return array.map((_, i) => 
      index === i ? array.length : array.length - Math.abs(index - i)
    );
  };

  // 아이템 표시 함수
  const getItemStyle = (index: number, activeIndex: number) => {
    const zIndex = getZindex(displayItems, activeIndex)[index];
    return {
      '--zIndex': zIndex,
      '--active': (index - activeIndex) / displayItems.length,
    } as React.CSSProperties;
  };

  // 애니메이션 함수
  const animate = useCallback(() => {
    if (displayItems.length === 0) return;
    const clampedProgress = Math.max(0, Math.min(progress, 100));
    const newActive = Math.floor((clampedProgress / 100) * (displayItems.length - 1));
    setActive(newActive);
  }, [progress, displayItems.length]);

  useEffect(() => {
    animate();
  }, [animate]);

  // 마우스 휠 핸들러
  const handleWheel = useCallback((e: WheelEvent) => {
    if (displayItems.length === 0) return;
    console.log('Wheel event detected:', e.deltaY);
    const wheelProgress = e.deltaY * speedWheel;
    setProgress(prev => {
      const newProgress = prev + wheelProgress;
      console.log('Progress changed:', prev, '->', newProgress);
      return newProgress;
    });
  }, [displayItems.length, speedWheel]);

  // 마우스 이동 핸들러
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDown || displayItems.length === 0) return;
    
    const x = 'clientX' in e ? e.clientX : (e.touches && e.touches[0].clientX) || 0;
    const mouseProgress = (x - startX) * speedDrag;
    setProgress(prev => prev + mouseProgress);
    setStartX(x);
  }, [isDown, displayItems.length, startX, speedDrag]);

  // 마우스 다운 핸들러
  const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
    setIsDown(true);
    setStartX('clientX' in e ? e.clientX : (e.touches && e.touches[0].clientX) || 0);
  }, []);

  // 마우스 업 핸들러
  const handleMouseUp = useCallback(() => {
    setIsDown(false);
  }, []);

  // 아이템 클릭 핸들러
  const handleItemClick = (index: number) => {
    if (displayItems.length === 0) return;
    const newProgress = (index / displayItems.length) * 100 + 10;
    setProgress(newProgress);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    console.log('Setting up event listeners for carousel');
    console.log('Display items length:', displayItems.length);
    console.log('Farm items:', displayItems.map(item => ({ title: item.title, score: item.farmScore })));

    // 이벤트 리스너 추가
    carousel.addEventListener('wheel', handleWheel);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleMouseDown);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      console.log('Cleaning up event listeners');
      carousel.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleMouseDown);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className={`carousel ${className}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>목장 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (displayItems.length === 0) {
    return (
      <div className={`carousel ${className}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-center">
            <p>표시할 데이터가 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .carousel {
          position: relative;
          z-index: 1;
          height: 100vh;
          pointer-events: none;
        }

         .carousel-item {
           --items: ${displayItems.length};
           --width: clamp(180px, 36vw, 360px);
           --height: calc(var(--width) * 2 / 3);
           --x: calc(var(--active) * 800%);
           --y: calc(var(--active) * 200%);
           --rot: calc(var(--active) * 120deg);
           --opacity: calc(var(--zIndex) / var(--items) * 3 - 2);
           
           overflow: hidden;
           position: absolute;
           z-index: var(--zIndex);
           width: var(--width);
           height: var(--height);
           margin: calc(var(--height) * -0.5) 0 0 calc(var(--width) * -0.5);
           border-radius: 10px;
           top: 50%;
           left: 50%;
           user-select: none;
           transform-origin: 0% 100%;
           box-shadow: 0 10px 50px 10px rgba(0, 0, 0, 0.5);
           background: black;
           pointer-events: all;
           transform: translate(var(--x), var(--y)) rotate(var(--rot));
           transition: transform 0.8s cubic-bezier(0, 0.02, 0, 1);
         }

        .carousel-box {
          position: absolute;
          z-index: 1;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: opacity 0.8s cubic-bezier(0, 0.02, 0, 1);
          opacity: var(--opacity);
        }

        .carousel-box::before {
          content: '';
          position: absolute;
          z-index: 1;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.5));
        }

         .carousel-title {
           position: absolute;
           z-index: 1;
           color: #fff;
           bottom: 15px;
           left: 15px;
           right: 15px;
           transition: opacity 0.8s cubic-bezier(0, 0.02, 0, 1);
           font-size: clamp(14px, 2.2vw, 20px);
           text-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
           font-weight: 600;
           text-align: left;
           line-height: 1.2;
         }

         .carousel-number {
           position: absolute;
           z-index: 1;
           color: #fff;
           top: 8px;
           left: 15px;
           transition: opacity 0.8s cubic-bezier(0, 0.02, 0, 1);
           font-size: clamp(18px, 6vw, 48px);
           font-weight: 700;
         }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }

         .carousel-farm-score {
           position: absolute;
           z-index: 2;
           color: #00ff00;
           bottom: 50px;
           left: 15px;
           right: 15px;
           font-size: clamp(11px, 1.8vw, 16px);
           opacity: 0.9;
           line-height: 1.2;
           font-weight: 700;
           text-shadow: 0 0 10px rgba(0, 255, 0, 0.6);
         }

         .carousel-farm-info {
           position: absolute;
           z-index: 2;
           color: #fff;
           bottom: 70px;
           left: 15px;
           right: 15px;
           font-size: clamp(8px, 1.1vw, 11px);
           opacity: 0.7;
           line-height: 1.2;
         }
      `}</style>
      
      <div className={`carousel ${className}`} ref={carouselRef}>
        {displayItems.map((item, index) => (
          <div
            key={item.id}
            className="carousel-item"
            style={getItemStyle(index, active)}
            onClick={() => handleItemClick(index)}
          >
             <div className="carousel-box">
               <div className="carousel-title">{item.title}</div>
               <div className="carousel-number">{item.number}</div>
               
               {/* 신뢰도 점수 (API 데이터인 경우만 표시) */}
               {useApiData && item.farmScore !== undefined && (
                 <div className="carousel-farm-score">
                   신뢰도: {item.farmScore.toFixed(1)}점
                 </div>
               )}
               
               {/* 목장 정보 (API 데이터인 경우만 표시) */}
               {useApiData && item.horseCount !== undefined && (
                 <div className="carousel-farm-info">
                   말 {item.horseCount}마리
                   {item.address && (
                     <div style={{ marginTop: '2px', fontSize: '0.9em', opacity: 0.6 }}>
                       {item.address.length > 20 ? `${item.address.substring(0, 20)}...` : item.address}
                     </div>
                   )}
                 </div>
               )}
               
               <Image
                 src={item.image}
                 alt={item.title}
                 fill
                 className="carousel-image"
                 sizes="(max-width: 768px) 180px, (max-width: 1200px) 240px, 360px"
               />
             </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Carousel;
