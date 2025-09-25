"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FarmCard from "./FarmCard";
import { RecommendFarm } from "@/services/apiService";

interface FarmCarousel3DProps {
  farms: RecommendFarm[];
  selectedFarm: RecommendFarm | null;
  onFarmSelect: (farm: RecommendFarm) => void;
}

export default function FarmCarousel3D({ farms, selectedFarm, onFarmSelect }: FarmCarousel3DProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // selectedFarm이 변경되면 해당 농장의 인덱스로 캐러셀 이동
  useEffect(() => {
    if (selectedFarm) {
      const targetIndex = farms.findIndex(farm => farm.farmUuid === selectedFarm.farmUuid);
      if (targetIndex !== -1) {
        setCurrentSlide(targetIndex);
      }
    }
  }, [selectedFarm, farms]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % farms.length);
    onFarmSelect(farms[(currentSlide + 1) % farms.length]);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + farms.length) % farms.length);
    onFarmSelect(farms[(currentSlide - 1 + farms.length) % farms.length]);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    onFarmSelect(farms[index]);
  };

  if (farms.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-gray-500">목장 정보가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3D 원형 캐러셀 컨테이너 */}
      <div className="relative h-[400px] flex items-center justify-center mb-0" style={{ perspective: '1000px' }}>
        {/* 회전하는 3D 원형 컨테이너 */}
        <div
          className="absolute w-full h-full transition-transform duration-500 ease-in-out"
          style={{
            transform: `rotateY(${-currentSlide * (360 / farms.length)}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 3D 원형 배치된 카드들 */}
          {farms.map((farm, index) => {
            const angle = (index * 360) / farms.length; // 각 카드의 원형 위치 각도
            const radius = 200; // 3D 원의 반지름
            
            // 현재 슬라이드 기준으로 상대적 위치 계산
            let relativeIndex = index - currentSlide;
            if (relativeIndex > farms.length / 2) {
              relativeIndex -= farms.length;
            } else if (relativeIndex < -farms.length / 2) {
              relativeIndex += farms.length;
            }
            
            const absRelativeIndex = Math.abs(relativeIndex);
            
            // 카드 크기와 투명도 설정
            let scale = 0.8;
            let opacity = 1;
            let zIndex = 10;
            
            if (absRelativeIndex === 0) { // 중앙 카드
              scale = 0.85;
              opacity = 1;
              zIndex = 10;
            } else if (absRelativeIndex === 1) { // 양쪽 카드
              scale = 0.8;
              opacity = 0.8;
              zIndex = 9;
            } else if (absRelativeIndex === 2) { // 뒤쪽 카드
              scale = 0.6;
              opacity = 0.6;
              zIndex = 8;
            } else { // 숨겨진 카드
              scale = 0.4;
              opacity = 0;
              zIndex = 1;
            }
            
            return (
              <div
                key={farm.farmUuid}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px) scale(${scale})`,
                  zIndex: zIndex,
                  opacity: opacity,
                  pointerEvents: absRelativeIndex > 2 ? 'none' : 'auto',
                  backfaceVisibility: 'hidden',
                }}
                onClick={() => goToSlide(index)}
              >
                <div className="w-64">
                  <FarmCard
                    farmUuid={farm.farmUuid}
                    profileImage={farm.profileImage}
                    farmName={farm.farmName}
                    totalScore={farm.totalScore}
                    address={farm.address}
                    description={farm.description}
                    isSelected={selectedFarm?.farmUuid === farm.farmUuid}
                    onSelect={() => goToSlide(index)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 캐러셀 네비게이션 버튼 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={prevSlide}
          className="bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg border"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg border"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* 캐러셀 인디케이터 */}
      <div className="flex justify-center space-x-2">
        {farms.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-green-500' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
