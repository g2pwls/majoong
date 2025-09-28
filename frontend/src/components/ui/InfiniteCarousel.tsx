'use client';

import React from 'react';
import Image from 'next/image';

interface CarouselItem {
  id: string;
  src: string;
  alt: string;
  text?: string; // 텍스트 표시용
}

interface InfiniteCarouselProps {
  items: CarouselItem[];
  width?: number;
  height?: number;
  reverse?: boolean;
  className?: string;
  gap?: number;
}

const InfiniteCarousel: React.FC<InfiniteCarouselProps> = ({
  items,
  width = 150,
  height = 50,
  reverse = false,
  className = '',
  gap
}) => {
  // 기본 gap 값 계산 (width의 1/4)
  const defaultGap = gap || width / 4;

  return (
    <>
      <style jsx>{`
        .slider {
          padding-block: 12px;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          position: relative;
          mask-image: linear-gradient(to right, transparent 20% 80%, #000, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, #000, transparent);
        }

        .list {
          display: flex;
          width: calc(${width}px * ${items.length} * 2);
          gap: ${defaultGap}px;
          animation: autoScroll 40s linear infinite;
        }

        .list:hover {
          animation-play-state: paused !important;
        }

        .item {
          width: ${width}px;
          height: ${height}px;
          flex-shrink: 0;
        }

        .item img {
          width: 100%;
          height: 100%;
          transition: filter 0.5s ease-in-out;
          object-fit: cover;
        }

        .item-text {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          text-align: center;
          background: linear-gradient(135deg, #4D3A2C, #6B4E3D);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .item-text:hover {
          background: linear-gradient(135deg, #6B4E3D, #4D3A2C);
          transform: scale(1.05);
        }

        @keyframes autoScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-1 * ${width}px * ${items.length}));
          }
        }

        .slider.reverse .list {
          animation: reverseScroll 40s linear infinite;
        }

        @keyframes reverseScroll {
          0% {
            transform: translateX(calc(-1 * ${width}px * ${items.length}));
          }
          100% {
            transform: translateX(0);
          }
        }

        .slider:hover .item img {
          filter: grayscale(1);
        }

        .slider .item:hover img {
          filter: grayscale(0);
        }
      `}</style>

      <div className={`slider ${reverse ? 'reverse' : ''} ${className}`}>
        <div className="list">
          {/* Original items */}
          {items.map((item) => (
            <div key={item.id} className="item">
              {item.src ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={width}
                  height={height}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="item-text">
                  {item.text || item.alt}
                </div>
              )}
            </div>
          ))}
          {/* Duplicate items for seamless looping */}
          {items.map((item) => (
            <div key={`duplicate-${item.id}`} className="item">
              {item.src ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={width}
                  height={height}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="item-text">
                  {item.text || item.alt}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default InfiniteCarousel;
