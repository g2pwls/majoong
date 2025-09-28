"use client";

import { useEffect, useRef, useState } from 'react';
import { RecommendFarm } from '@/services/apiService';

interface FarmSliderProps {
  farms: RecommendFarm[];
  selectedFarm: RecommendFarm | null;
  onFarmSelect: (farm: RecommendFarm) => void;
}

const FarmSlider = ({ farms, selectedFarm, onFarmSelect }: FarmSliderProps) => {
  const [currentCenter, setCurrentCenter] = useState(Math.floor(farms.length / 2));
  const [centerFarm, setCenterFarm] = useState<RecommendFarm | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const onFarmSelectRef = useRef(onFarmSelect);

  useEffect(() => {
    // FontAwesome 아이콘 로드
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // onFarmSelect 함수 참조 업데이트
  useEffect(() => {
    onFarmSelectRef.current = onFarmSelect;
  }, [onFarmSelect]);

  // 선택된 농장이 변경되면 해당 농장을 중앙에 위치시키기
  useEffect(() => {
    if (selectedFarm && farms.length > 0) {
      const selectedIndex = farms.findIndex(farm => farm.farmUuid === selectedFarm.farmUuid);
      if (selectedIndex !== -1) {
        setCurrentCenter(selectedIndex);
      }
    }
  }, [selectedFarm, farms]);

  // currentCenter가 변경될 때마다 중앙에 있는 목장 정보 업데이트
  useEffect(() => {
    if (farms.length > 0 && currentCenter >= 0 && currentCenter < farms.length) {
      setCenterFarm(farms[currentCenter]);
    }
  }, [currentCenter, farms]);

  // farms가 로드될 때 초기 centerFarm 설정
  useEffect(() => {
    if (farms.length > 0 && !centerFarm) {
      setCenterFarm(farms[currentCenter]);
    }
  }, [farms, centerFarm, currentCenter]);


  const getSlidePosition = (index: number): string => {
    const center = currentCenter;
    const totalSlides = farms.length;
    
    // 3장인 경우 - 무한 루프
    if (totalSlides >= 3) {
      // 각 슬라이드의 실제 인덱스 계산 (순환 고려)
      const getActualIndex = (slideIndex: number) => {
        return ((slideIndex - center) % totalSlides + totalSlides) % totalSlides;
      };
      
      const actualIndex = getActualIndex(index);
      
      if (actualIndex === 0) return 'position-3'; // 선택된 사진 - 중앙(제일 앞)
      if (actualIndex === 1) return 'position-4'; // 오른쪽
      if (actualIndex === 2) return 'position-2'; // 왼쪽
    }
    
    return 'position-none';
  };

  const leftScroll = () => {
    setCurrentCenter(prev => {
      const newCenter = prev === 0 ? farms.length - 1 : prev - 1;
      return newCenter;
    });
  };

  const rightScroll = () => {
    setCurrentCenter(prev => {
      const newCenter = prev === farms.length - 1 ? 0 : prev + 1;
      return newCenter;
    });
  };


  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touchStartX = e.touches[0].clientX;
    const touchStartY = e.touches[0].clientY;
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const xDiff = touchStartX - touchEndX;
      const yDiff = touchStartY - touchEndY;
      
      // 최소 드래그 거리 설정 (50px 이상)
      const minDragDistance = 50;
      
      if (Math.abs(xDiff) > minDragDistance && Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
          leftScroll();
        } else {
          rightScroll();
        }
      }
      
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
  };

  if (farms.length === 0) {
    return <div>목장 정보를 불러오는 중...</div>;
  }

  return (
    <>
      <style jsx>{`
        .farm-slider-container {
          height: 18rem;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          user-select: none;
          position: relative;
          padding: 0 1rem;
          margin: 0;
        }

         @media screen and (max-width: 768px) {
           .farm-slider-container {
             padding: 0 0.5rem;
             width: 100%;
             margin: 0;
             max-width: 100%;
             overflow: hidden;
           }

           .slider-content {
             width: 100%;
             max-width: 100%;
           }

           .slide {
             width: 18rem;
             max-width: calc(100vw - 2rem);
           }

           .slide img {
             border-radius: 10px;
           }

           .farm-details-container {
             margin: -1rem 0 0 0;
           }

           .left-arrow,
           .right-arrow {
             display: none;
           }
         }

         @media screen and (max-width: 480px) {
           .farm-slider-container {
             padding: 0 0.25rem;
           }

           .slider-content {
             width: 100%;
             max-width: 100%;
           }

           .slide {
             width: 16rem;
             max-width: calc(100vw - 1.5rem);
           }

           .left-arrow,
           .right-arrow {
             display: none;
           }
         }

        .farm-details-container {
          margin: -1rem 1rem 0 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.95);
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          min-height: 6rem;
        }

        .left-arrow,
        .right-arrow {
          height: 100%;
          width: 6%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          cursor: pointer;
        }

        .slider-content {
          height: 100%;
          width: 88%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: row;
          overflow: visible;
          position: relative;
          perspective: 100px;
        }
        .slider-content .slide {
          position: absolute;
          left: 50%;
          height: 14rem;
          width: 24rem;
          background: #999;
          border-radius: 15px;
          z-index: 0;
          transform: translate(-50%, 0) rotateY(0deg) scale(1,1);
          transform-style: preserve-3d;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, left, z-index, opacity;
          overflow: hidden;
        }

        .slide.position-1 {
          left: 20% !important;
          z-index: 1 !important;
          transform: translate(-50%, 0) rotateY(-2deg) scale(0.8, 0.8) !important;
          opacity: 1 !important;
          box-shadow: 0px 0.4rem 1.6rem rgba(0, 0, 0, 0.1) !important;
          filter: blur(5px) !important;
        }
        .slide.position-2 {
          left: 35% !important;
          z-index: 2 !important;
          transform: translate(-50%, 0) rotateY(-1deg) scale(0.9, 0.9) !important;
          opacity: 1 !important;
          box-shadow: 0px 0.4rem 1.6rem rgba(0, 0, 0, 0.3) !important;
          filter: blur(2px) !important;
        }
        .slide.position-3 {
          left: 50% !important;
          z-index: 4 !important;
          transform: translate(-50%, 0) rotateY(0deg) scale(1, 1) !important;
          opacity: 1 !important;
          box-shadow: 0px 0.4rem 1.6rem rgba(0, 0, 0, 0.5) !important;
          cursor: pointer;
          filter: blur(0px) !important;
        }
        .slide.position-3:hover {
          box-shadow: 0px 0rem 1.8rem rgba(0, 0, 0, 0.7) !important;
          transform: translate(-50%, 0) rotateY(0deg) scale(1.05, 1.05) !important;
        }
        .slide.position-4 {
          left: 65% !important;
          z-index: 2 !important;
          transform: translate(-50%, 0) rotateY(1deg) scale(0.9, 0.9) !important;
          opacity: 1 !important;
          box-shadow: 0px 0.4rem 1.6rem rgba(0, 0, 0, 0.3) !important;
          filter: blur(2px) !important;
        }
        .slide.position-5 {
          left: 80% !important;
          z-index: 1 !important;
          transform: translate(-50%, 0) rotateY(2deg) scale(0.8, 0.8) !important;
          opacity: 1 !important;
          box-shadow: 0px 0.4rem 1.6rem rgba(0, 0, 0, 0.1) !important;
          filter: blur(5px) !important;
        }

        .slide.position-none{
           left: 50%;
          z-index: 0;
          transform: translate(-50%, 0) rotateY(0deg) scale(0.7, 0.7);
          opacity: 1;
          box-shadow: 0px 0.4rem 1.6rem rgba(0, 0, 0, 0);
        }

        .farm-slider-container i{
          width: 2rem;
          height: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          border-radius: 50%;
        }
        .farm-slider-container .left-arrow:hover i, .farm-slider-container .right-arrow:hover i{
          background: rgba(22,22,220,0.1);
          color: #fff;
        }

        .slider-content .slide .card-sections{
          opacity: 0;
          transition: opacity 0.6s ease-in-out;
        }

        .slider-content .slide.position-3 .card-sections{
          opacity: 1;
          transition: opacity 0.6s ease-in-out;
        }

        .slide > *{
          color: white;
          font-family: 'Inter';
          font-size: 90%;
          letter-spacing: -0.001em;
        }

        .slide img{
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 15px;
        }

        .card-sections{
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 14rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          border-radius: 15px;
          overflow: hidden;
        }

        .trust-score{
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(0,0,0,0.7);
          color: #ffd700;
          padding: 0.5rem 1rem;
          border-radius: 1rem;
          font-size: 0.9rem;
          font-weight: 600;
          z-index: 2;
        }

        .farm-name{
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 1rem;
          font-size: 1.1rem;
          font-weight: 700;
          z-index: 2;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }


        .address{
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pin-icon{
          flex-shrink: 0;
        }

        .description{
          font-size: 0.85rem;
          line-height: 1.4;
          color: #333;
        }

        .slide.selected{
          border: 3px solid #4D3A2C;
          box-shadow: 0 0 0 2px rgba(77, 58, 44, 0.3);
        }

        .check-icon{
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 2rem;
          height: 2rem;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #d1d5db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .check-icon.selected {
          background: #4D3A2C;
          border-color: #4D3A2C;
        }

        .check-icon svg{
          width: 1.2rem;
          height: 1.2rem;
          color: transparent;
        }

        .check-icon.selected svg {
          color: white;
        }

        .slide{
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .slide:hover{
          transform: translate(-50%, 0) rotateY(0deg) scale(1.02, 1.02);
        }

        @media screen and (max-width:620px){
        .slide.position-1, .slide.position-5 {
          opacity: 0.5 !important;
          }
          .slide.position-2, .slide.position-4 {
          opacity: 0.95 !important;
        }
        } 
          
        @media screen and (max-width: 445px){
          
          .slide.position-1, .slide.position-5 {
          opacity: 0 !important;
          }
        .slide.position-2, .slide.position-4 {
          opacity: 0.5 !important;
        }
        }
        @media screen and (max-width: 415px){
          .slide{
            opacity: 0 !important;
            box-shadow: none !important;
          }
          .slide.position-3{
            box-shadow: none !important;
            opacity: 1 !important;
          }
          .slide.position-1, .slide.position-2 {
            left: -50% !important;
            transform: translate(-50%, 0) rotateY(0deg) scale(0.7, 0.7) !important;
          }
          .slide.position-4, .slide.position-5 {
            left: 150% !important;
            transform: translate(-50%, 0) rotateY(0deg) scale(0.7, 0.7) !important;
          }
        }
      `}</style>
      
      <div className="farm-slider-container">
        <div className="left-arrow" onClick={leftScroll}>
          <i className="fa fa-angle-left" style={{fontSize: '24px'}}></i>
        </div>
        <div 
          className="slider-content" 
          id='slider-content'
          ref={sliderRef}
          onTouchStart={handleTouchStart}
        >
          {farms.map((farm, index) => (
            <div 
              key={farm.farmUuid} 
              className={`slide ${getSlidePosition(index)} ${selectedFarm?.farmUuid === farm.farmUuid ? 'selected' : ''}`}
              onClick={() => onFarmSelect(farm)}
            >
              <img src={farm.profileImage || '/images/default-farm.jpg'} alt={farm.farmName} />
              <div className="card-sections">
                <div className="trust-score">
                  {farm.totalScore}℃
                </div>
                <div className="farm-name">
                  {farm.farmName}
                </div>
              </div>
              <div className={`check-icon ${selectedFarm?.farmUuid === farm.farmUuid ? 'selected' : ''}`}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
        <div className="right-arrow" onClick={rightScroll}>
          <i className="fa fa-angle-right" style={{fontSize: '24px'}}></i>
        </div>
      </div>
      
      {/* 중앙에 있는 농장의 상세 정보 */}
      {centerFarm && (
        <div className="farm-details-container">
          <div className="address">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#666" className="pin-icon">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {centerFarm.address}
          </div>
          <div className="description">
            {centerFarm.description}
          </div>
        </div>
      )}
    </>
  );
};

export default FarmSlider;
