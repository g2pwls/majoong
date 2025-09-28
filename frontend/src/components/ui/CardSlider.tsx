'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CardData {
  id: string;
  image: string;
  name: string;
  location: string;
  description: string;
}

interface CardSliderProps {
  cards: CardData[];
  className?: string;
}

export default function CardSlider({ cards, className = '' }: CardSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);
  
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const currentCardRef = useRef<HTMLDivElement>(null);
  const currentInfoRef = useRef<HTMLDivElement>(null);

  // 현재 카드의 이전/다음 인덱스 계산
  const getPreviousIndex = (index: number) => (index - 1 + cards.length) % cards.length;
  const getNextIndex = (index: number) => (index + 1) % cards.length;

  const currentCard = cards[currentIndex];
  const previousCard = cards[getPreviousIndex(currentIndex)];
  const nextCard = cards[getNextIndex(currentIndex)];

  // 이미지 로딩 처리
  useEffect(() => {
    if (cards.length === 0) return;

    let loadedCount = 0;
    const totalImages = cards.length;

    const handleImageLoad = () => {
      loadedCount++;
      setLoadedImages(loadedCount);
      
      if (loadedCount === totalImages) {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    cards.forEach(card => {
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad;
      img.src = card.image;
    });
  }, [cards]);

  // 카드 슬라이드 함수
  const slideCards = (direction: 'left' | 'right') => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      setCurrentIndex(prev => 
        direction === 'right' 
          ? (prev + 1) % cards.length 
          : (prev - 1 + cards.length) % cards.length
      );
      setIsLoading(false);
    }, 400);
  };

  // 카드 호버 효과
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentCardRef.current || !currentInfoRef.current) return;
    
    const card = currentCardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const angle = Math.atan2(e.clientX - centerX, 0) * (35 / Math.PI);
    
    card.style.setProperty('--current-card-rotation-offset', `${angle}deg`);
    currentInfoRef.current.style.transform = `rotateY(${angle}deg)`;
  };

  const handleCardMouseLeave = () => {
    if (!currentCardRef.current || !currentInfoRef.current) return;
    
    currentCardRef.current.style.setProperty('--current-card-rotation-offset', '0deg');
    currentInfoRef.current.style.transform = 'rotateY(0deg)';
  };

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">표시할 카드가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`card-slider relative w-full h-screen overflow-hidden ${className}`}>
      <style jsx>{`
        :root {
          --card-width: 200px;
          --card-height: 300px;
          --card-transition-duration: 800ms;
          --card-transition-easing: ease;
        }

        @media (min-width: 800px) {
          :root {
            --card-width: 250px;
            --card-height: 400px;
          }
        }

        .card-slider {
          background: rgba(0, 0, 0, 0.787);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .app__bg {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: -5;
          filter: blur(8px);
          pointer-events: none;
          user-select: none;
          overflow: hidden;
        }

        .app__bg::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: #000;
          z-index: 1;
          opacity: 0.8;
        }

        .app__bg__image {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) translateX(var(--image-translate-offset, 0));
          width: 180%;
          height: 180%;
          transition: transform 1000ms ease, opacity 1000ms ease;
          overflow: hidden;
        }

        .app__bg__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .app__bg__image.current--image {
          opacity: 1;
          --image-translate-offset: 0;
        }

        .app__bg__image.previous--image,
        .app__bg__image.next--image {
          opacity: 0;
        }

        .app__bg__image.previous--image {
          --image-translate-offset: -25%;
        }

        .app__bg__image.next--image {
          --image-translate-offset: 25%;
        }

        .cardList {
          position: absolute;
          width: calc(3 * var(--card-width));
          height: auto;
        }

        .cardList__btn {
          --btn-size: 35px;
          width: var(--btn-size);
          height: var(--btn-size);
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 100;
          border: none;
          background: none;
          cursor: pointer;
          color: white;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .cardList__btn:hover {
          opacity: 1;
        }

        .cardList__btn.btn--left {
          left: -5%;
        }

        .cardList__btn.btn--right {
          right: -5%;
        }

        .cardList .cards__wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          perspective: 1000px;
        }

        .card {
          --card-translateY-offset: 100vh;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) translateX(var(--card-translateX-offset)) translateY(var(--card-translateY-offset)) rotateY(var(--card-rotation-offset)) scale(var(--card-scale-offset));
          display: inline-block;
          width: var(--card-width);
          height: var(--card-height);
          transition: transform var(--card-transition-duration) var(--card-transition-easing);
          user-select: none;
        }

        .card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: #000;
          z-index: 1;
          transition: opacity var(--card-transition-duration) var(--card-transition-easing);
          opacity: calc(1 - var(--opacity));
        }

        .card__image {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .card__image img {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card.current--card {
          --current-card-rotation-offset: 0;
          --card-translateX-offset: 0;
          --card-rotation-offset: var(--current-card-rotation-offset);
          --card-scale-offset: 1.2;
          --opacity: 0.8;
        }

        .card.previous--card {
          --card-translateX-offset: calc(-1 * var(--card-width) * 1.1);
          --card-rotation-offset: 25deg;
        }

        .card.next--card {
          --card-translateX-offset: calc(var(--card-width) * 1.1);
          --card-rotation-offset: -25deg;
        }

        .card.previous--card,
        .card.next--card {
          --card-scale-offset: 0.9;
          --opacity: 0.4;
        }

        .infoList {
          position: absolute;
          width: calc(3 * var(--card-width));
          height: var(--card-height);
          pointer-events: none;
        }

        .infoList .info__wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: flex-start;
          align-items: flex-end;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .info {
          margin-bottom: calc(var(--card-height) / 8);
          margin-left: calc(var(--card-width) / 1.5);
          transform: translateZ(2rem);
          transition: transform var(--card-transition-duration) var(--card-transition-easing);
          position: absolute;
          bottom: 0;
          left: 0;
        }

        .info .text {
          position: relative;
          font-family: "Montserrat", sans-serif;
          font-size: calc(var(--card-width) * var(--text-size-offset, 0.2));
          white-space: nowrap;
          color: #fff;
          width: fit-content;
        }

        .info .name,
        .info .location {
          text-transform: uppercase;
        }

        .info .location {
          --mg-left: 40px;
          --text-size-offset: 0.12;
          font-weight: 600;
          margin-left: var(--mg-left);
          margin-bottom: calc(var(--mg-left) / 2);
          padding-bottom: 0.8rem;
        }

        .info .location::before,
        .info .location::after {
          content: "";
          position: absolute;
          background: #fff;
          left: 0%;
          transform: translate(calc(-1 * var(--mg-left)), -50%);
        }

        .info .location::before {
          top: 50%;
          width: 20px;
          height: 5px;
        }

        .info .location::after {
          bottom: 0;
          width: 60px;
          height: 2px;
        }

        .info .description {
          --text-size-offset: 0.065;
          font-weight: 500;
        }

        .info.current--info {
          opacity: 1;
          display: block;
        }

        .info.previous--info,
        .info.next--info {
          opacity: 0;
          display: none;
        }

        .loading__wrapper {
          position: fixed;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: #000;
          z-index: 200;
        }

        .loading__wrapper .loader--text {
          color: #fff;
          font-family: "Montserrat", sans-serif;
          font-weight: 500;
          margin-bottom: 1.4rem;
        }

        .loading__wrapper .loader {
          position: relative;
          width: 200px;
          height: 2px;
          background: rgba(255, 255, 255, 0.25);
        }

        .loading__wrapper .loader span {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: red;
          transform: scaleX(var(--progress, 0));
          transform-origin: left;
          transition: transform 0.3s ease;
        }
      `}</style>

      {/* 배경 이미지들 */}
      <div className="app__bg">
        <div className="app__bg__image current--image">
          <img src={currentCard.image} alt={currentCard.name} />
        </div>
        <div className="app__bg__image previous--image">
          <img src={previousCard.image} alt={previousCard.name} />
        </div>
        <div className="app__bg__image next--image">
          <img src={nextCard.image} alt={nextCard.name} />
        </div>
      </div>

      {/* 카드 슬라이더 */}
      <div className="cardList">
        <button 
          className="cardList__btn btn--left"
          onClick={() => slideCards('left')}
          disabled={isLoading}
        >
          <ChevronLeft size={35} />
        </button>

        <div className="cards__wrapper" ref={cardsContainerRef}>
          {/* 이전 카드 */}
          <div className="card previous--card">
            <div className="card__image">
              <img src={previousCard.image} alt={previousCard.name} />
            </div>
          </div>

          {/* 현재 카드 */}
          <div 
            className="card current--card"
            ref={currentCardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="card__image">
              <img src={currentCard.image} alt={currentCard.name} />
            </div>
          </div>

          {/* 다음 카드 */}
          <div className="card next--card">
            <div className="card__image">
              <img src={nextCard.image} alt={nextCard.name} />
            </div>
          </div>
        </div>

        <button 
          className="cardList__btn btn--right"
          onClick={() => slideCards('right')}
          disabled={isLoading}
        >
          <ChevronRight size={35} />
        </button>
      </div>

      {/* 정보 표시 */}
      <div className="infoList">
        <div className="info__wrapper">
          {/* 이전 카드 정보 */}
          <div className="info previous--info">
            <h1 className="text name">{previousCard.name}</h1>
            <h4 className="text location">{previousCard.location}</h4>
            <p className="text description">{previousCard.description}</p>
          </div>

          {/* 현재 카드 정보 */}
          <div className="info current--info" ref={currentInfoRef}>
            <h1 className="text name">{currentCard.name}</h1>
            <h4 className="text location">{currentCard.location}</h4>
            <p className="text description">{currentCard.description}</p>
          </div>

          {/* 다음 카드 정보 */}
          <div className="info next--info">
            <h1 className="text name">{nextCard.name}</h1>
            <h4 className="text location">{nextCard.location}</h4>
            <p className="text description">{nextCard.description}</p>
          </div>
        </div>
      </div>

      {/* 로딩 화면 */}
      {isLoading && (
        <div className="loading__wrapper">
          <div className="loader--text">Loading...</div>
          <div className="loader">
            <span style={{ '--progress': loadedImages / cards.length } as React.CSSProperties}></span>
          </div>
        </div>
      )}
    </div>
  );
}
