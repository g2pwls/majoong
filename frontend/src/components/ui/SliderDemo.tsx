"use client";

import { useEffect, useRef, useState } from 'react';

interface SlideData {
  id: string;
  name: string;
  image: string;
  video?: string;
}

const SliderDemo = () => {
  const [slides, setSlides] = useState<SlideData[]>([
    {
      id: '1',
      name: 'Gengar',
      image: 'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/MegaGengar.jpg'
    },
    {
      id: '2',
      name: 'Lugia',
      image: 'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/Lugia.jpg'
    },
    {
      id: '3',
      name: 'Mega Lucario',
      image: 'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/MegeLucario.jpg'
    }
  ]);

  const [currentCenter, setCurrentCenter] = useState(Math.floor(slides.length / 2));
  const sliderRef = useRef<HTMLDivElement>(null);

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

  const getSlidePosition = (index: number): string => {
    const center = currentCenter;
    const totalSlides = slides.length;
    
    // 3장인 경우 - 무한 루프
    if (totalSlides === 3) {
      // 각 슬라이드의 실제 인덱스 계산 (순환 고려)
      const getActualIndex = (slideIndex: number) => {
        return ((slideIndex - center) % totalSlides + totalSlides) % totalSlides;
      };
      
      const actualIndex = getActualIndex(index);
      
      if (actualIndex === 0) return 'position-2'; // 왼쪽
      if (actualIndex === 1) return 'position-3'; // 중앙
      if (actualIndex === 2) return 'position-4'; // 오른쪽
    }
    
    // 5장 이상인 경우 (기존 로직)
    const diff = index - center;
    if (diff === 0) return 'position-3';
    if (diff === -2) return 'position-1';
    if (diff === -1) return 'position-2';
    if (diff === 1) return 'position-4';
    if (diff === 2) return 'position-5';
    if (Math.abs(diff) > 2) return 'position-none';
    
    return 'position-none';
  };

  const leftScroll = () => {
    setCurrentCenter(prev => {
      const newCenter = prev === 0 ? slides.length - 1 : prev - 1;
      return newCenter;
    });
  };

  const rightScroll = () => {
    setCurrentCenter(prev => {
      const newCenter = prev === slides.length - 1 ? 0 : prev + 1;
      return newCenter;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStartX = e.touches[0].clientX;
    const touchStartY = e.touches[0].clientY;
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const xDiff = touchStartX - touchEndX;
      const yDiff = touchStartY - touchEndY;
      
      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
          leftScroll();
        } else {
          rightScroll();
        }
      }
      
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <>
      <style jsx>{`
        body {
          margin: 0 auto;
          height: 100vh;
          background: #f1f1f1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .container{
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .slider-container {
          height: 35rem;
          width: 100vw;
          max-width: 1200px;
          display: flex;
          justify-content: center;
          align-items: center;
          user-select: none;
          position: relative;
          margin-top: 2rem;
        }

        .slider-title{
          position: absolute;
          top: 0;
          font-family: 'Papyrus', Fantasy;
          font-size: 20px;
        }

        .left-arrow,
        .right-arrow {
          height: 100%;
          width: 10%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .slider-content {
          height: 100%;
          width: 80%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: row;
          overflow: hidden;
          position: relative;
          perspective: 100px;
        }
        .slider-content-background {
          height: 100%;
          width: 102%;
          position: absolute;
          top: 0;
          left: -1%;
          background: linear-gradient(
            to left,
            #f1f1f1,
            transparent,
            transparent,
            transparent,
            #f1f1f1
          );
          z-index: 3;
        }
        .slider-content .slide {
          position: absolute;
          left: 50%;
          height: 24rem;
          max-height: 400px;
          width: 14rem;
          min-width: 270px;
          background: #999;
          border-radius: 25px;
          z-index: 0;
          transform: translate(-50%, 0) rotateY(0deg) scale(1,1);
          transform-style: preserve-3d;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, left, z-index, opacity;
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

        .slider-container i{
          width: 2rem;
          height: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider-container .left-arrow:hover i, .slider-container .right-arrow:hover i{
          background: rgba(22,22,220,0.1);
          color: #fff;
        }

        .slider-content .slide .card-sections .upper-section, .slider-content .slide .card-button{
          opacity: 0;
          transition: opacity 0.6s ease-in-out;
        }

        .slider-content .slide.position-3 .card-sections .upper-section, .slider-content .slide.position-3 .card-button{
          opacity: 1;
          transition: opacity 0.6s ease-in-out;
        }

        .slide > *{
          color: white;
          font-family: 'Inter';
          font-size: 90%;
          letter-spacing: -0.001em;
        }

        .media, .card-sections{
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 25px;
          overflow: hidden;
        }
        .media{
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .media img{
          position: absolute;
          height: 30rem;
        }

        .card-sections{
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .upper-section{
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }

        .lower-section{
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card-sections .lower-section .card-button{
          border: 0.5px solid #fff;
          width: 35%;
          padding: 0.5rem;
          border-radius: 2rem;
          font-size: 60%;
          text-align: center;
          background: rgba(0,0,0,0.3);
          cursor: pointer;
        }
        .upper-section .wishlist, .upper-section .cart{
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
          transition: color 0.2s ease-in-out, background 0.2s ease-in-out;
          cursor: pointer;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .upper-section .cart:hover{
          color: rgb(252, 163, 60);
          background: rgba(0,0,0,0.4);
        } 
        .upper-section .wishlist:hover{
          color: rgb(244, 129, 129);
          background: rgba(0,0,0,0.4);
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
      
      <div className="container">
        <div className="slider-container">
          <h4 className='slider-title'>Slider</h4>
          <div className="left-arrow" onClick={leftScroll}>
            <i className="fa fa-angle-left" style={{fontSize: '24px'}}></i>
          </div>
          <div 
            className="slider-content" 
            id='slider-content'
            ref={sliderRef}
            onTouchStart={handleTouchStart}
          >
            {slides.map((slide, index) => (
              <div key={slide.id} className={`slide ${getSlidePosition(index)}`}>
                <div className="media">
                  <img src={slide.image} alt={slide.name} />
                  {slide.video && <video src={slide.video}></video>}
                </div>
                <div className="card-sections">
                  <div className="upper-section">
                    <div className="wishlist">
                      <i className="fa fa-heart"></i>
                    </div>
                    <div className="cart">
                      <i className="fa fa-cart-plus"></i>
                    </div>
                  </div>
                  <div className="lower-section">
                    <div className="card-caption">
                      {slide.name}
                    </div>
                    <div className="card-button">
                      know more
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="slider-content-background"></div>
          </div>
          <div className="right-arrow" onClick={rightScroll}>
            <i className="fa fa-angle-right" style={{fontSize: '24px'}}></i>
          </div>
        </div>
      </div>
    </>
  );
};

export default SliderDemo;
