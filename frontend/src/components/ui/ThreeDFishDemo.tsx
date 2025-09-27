'use client';

import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Mousewheel, Autoplay, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface FishCard {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
}

interface ThreeDFishDemoProps {
  cards?: FishCard[];
}

const defaultCards: FishCard[] = [
  {
    id: 1,
    title: "1",
    subtitle: "Ocean Explorer",
    description: "Dive deep into the mysteries of the ocean with this magnificent creature. Discover the hidden treasures beneath the waves and explore a world of wonder and beauty.",
    image: "https://scary.land/images/codepen%20swiper/fish%201.png",
    link: "#"
  },
  {
    id: 2,
    title: "2", 
    subtitle: "Coral Guardian",
    description: "Protecting the delicate coral reefs with grace and elegance. This beautiful fish plays a crucial role in maintaining the balance of marine ecosystems.",
    image: "https://scary.land/images/codepen%20swiper/fish%202.png",
    link: "#"
  },
  {
    id: 3,
    title: "3",
    subtitle: "Deep Sea Wanderer",
    description: "Journey to the darkest depths where few dare to venture. This mysterious fish has adapted to survive in the most extreme conditions of the deep ocean.",
    image: "https://scary.land/images/codepen%20swiper/fish%203.png",
    link: "#"
  },
  {
    id: 4,
    title: "4",
    subtitle: "Tropical Beauty",
    description: "Bright colors and vibrant patterns make this fish a true masterpiece of nature. Found in warm tropical waters, it brings joy to all who encounter it.",
    image: "https://scary.land/images/codepen%20swiper/fish%204.png",
    link: "#"
  },
  {
    id: 5,
    title: "5",
    subtitle: "Arctic Survivor",
    description: "Thriving in the coldest waters of the Arctic, this resilient fish has developed unique adaptations to survive in extreme cold conditions.",
    image: "https://scary.land/images/codepen%20swiper/fish%205.png",
    link: "#"
  },
  {
    id: 6,
    title: "6",
    subtitle: "River Navigator",
    description: "Swimming upstream against strong currents, this determined fish represents perseverance and strength in the face of adversity.",
    image: "https://scary.land/images/codepen%20swiper/fish%206.png",
    link: "#"
  }
];

export default function ThreeDFishDemo({ cards = defaultCards }: ThreeDFishDemoProps) {
  const swiperRef = useRef<any>(null);
  const [swiperInstance, setSwiperInstance] = React.useState<any>(null);

  return (
    <>
      <div className="sectionWrapper">
        <div className="swiper" data-swiper-parallax="-300">
          
          <Swiper
            ref={swiperRef}
            onSwiper={setSwiperInstance}
            modules={[EffectCoverflow, Mousewheel, Autoplay, Scrollbar]}
            direction="horizontal"
            loop={true}
            speed={1500}
            slidesPerView={4}
            spaceBetween={60}
            mousewheel={true}
            centeredSlides={true}
            effect="coverflow"
            coverflowEffect={{
              rotate: 40,
              slideShadows: true,
              depth: 200,
              modifier: 1,
              stretch: 0
            }}
            autoplay={{
              delay: 2000,
              pauseOnMouseEnter: true
            }}
            scrollbar={{
              el: ".swiper-scrollbar"
            }}
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 60
              },
              600: {
                slidesPerView: 2,
                spaceBetween: 60
              },
              1000: {
                slidesPerView: 3,
                spaceBetween: 60
              },
              1400: {
                slidesPerView: 4,
                spaceBetween: 60
              },
              2300: {
                slidesPerView: 5,
                spaceBetween: 60
              },
              2900: {
                slidesPerView: 6,
                spaceBetween: 60
              }
            }}
            className="swiper-container"
          >
            {cards.map((card) => (
              <SwiperSlide key={card.id} className="swiper-slide">
                <div className="cardPopout">
                  <img src={card.image} alt={card.title} />
                  <h2>{card.title}</h2>
                  <h4>{card.subtitle}</h4>
                  <figcaption>
                    <p>{card.description}</p>
                  </figcaption>
                  <a href={card.link}>
                    Explore More
                    <ExternalLink />
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <div className="swiper-scrollbar"></div>
          
          {/* 네비게이션 버튼들 */}
          <div className="navigation-buttons">
            <button 
              className="nav-btn prev-btn" 
              onClick={() => {
                if (swiperInstance) {
                  swiperInstance.slidePrev();
                  console.log('Previous slide clicked');
                }
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="nav-btn next-btn" 
              onClick={() => {
                if (swiperInstance) {
                  swiperInstance.slideNext();
                  console.log('Next slide clicked');
                }
              }}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        *:not(style, head),
        *::before,
        *::after {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          background: #222;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          font-family: "Figtree", sans-serif;
          font-optical-sizing: auto;
          font-style: normal;
          font-size: 110%;
          font-weight: 400;
          line-height: 150%;
        }

        body article {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .sectionWrapper {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .swiper {
          width: 100%;
          height: 100%;
          padding: 50px 20px;
          overflow: visible;
          position: relative;
        }


        .swiper .swiper-wrapper {
          align-items: center;
        }

        .swiper .swiper-slide {
          position: relative;
          height: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          background-color: rgba(102, 102, 102, 0.8);
          border-radius: 7px;
          padding: 10px;
          margin: 0;
          cursor: grab;
          user-select: none;
          text-wrap: pretty;
        }

        .swiper .swiper-slide::before {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 80px;
          height: 80px;
          border-bottom: 1px dashed white;
          border-right: 1px solid white;
          border-radius: 0 0 7px 0;
          content: "";
          transition: all 0.3s ease;
        }

        .swiper .swiper-slide::after {
          position: absolute;
          top: 0;
          left: 0;
          width: 80px;
          height: 80px;
          border-top: 1px solid white;
          border-left: 1px dashed white;
          border-radius: 7px 0 0 0;
          content: "";
          transition: all 0.3s ease;
        }

        .swiper .swiper-slide:hover {
          background: linear-gradient(
            135deg,
            #ff1e9c99,
            #ff1ea499,
            #ff1fbc99,
            #ff1fde99,
            #f620ff99,
            #c721ff99,
            #9723ff99,
            #6a24ff99,
            #4125ff99,
            #252aff99,
            #2641ff99,
            #2649ff99
          );
        }

        .swiper .swiper-slide:hover::before,
        .swiper .swiper-slide:hover::after {
          width: 170px;
          height: 170px;
          transition: all 0.3s ease;
        }

        .swiper .swiper-slide .cardPopout {
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          border-radius: 7px;
          padding: 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .swiper .swiper-slide img {
          width: 100%;
          height: auto;
          margin-bottom: 25px;
          border-radius: 5px;
        }

        .swiper .swiper-slide h2 {
          font-size: 200%;
          line-height: 110%;
          margin: 0 0 7px 0;
          color: white;
          font-family: "Nabla", system-ui;
          font-variation-settings: "EDPT" 100, "EHLT" 24;
          background-color: #111;
          border-radius: 100%;
        }

        .swiper .swiper-slide h4 {
          font-size: 110%;
          line-height: 120%;
          font-weight: 700;
          margin: 0 0 13px 0;
          color: #bbb;
          font-style: italic;
        }

        .swiper .swiper-slide figcaption {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          margin: 0 0 20px 0;
          padding-left: 20px;
          border-left: 1px solid white;
        }

        .swiper .swiper-slide figcaption p {
          color: #999;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .swiper .swiper-slide a {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          background-color: black;
          color: white;
          border-radius: 3px;
          text-decoration: none;
          overflow: hidden;
          z-index: 1;
          transition: all 0.6s ease !important;
        }

        .swiper .swiper-slide a:hover {
          color: black;
          transition: all 0.6s ease;
        }

        .swiper .swiper-slide a::after {
          position: absolute;
          right: 100%;
          bottom: 0;
          width: 100%;
          height: 100%;
          background-color: #2649ff;
          content: "";
          z-index: -1;
          transition: all 0.6s ease;
        }

        .swiper .swiper-slide a:hover::after {
          right: 0;
          transition: all 0.6s ease;
        }

        .swiper .swiper-slide a svg {
          width: 23px;
          height: auto;
          fill: white;
          margin-left: 5px;
          transition: all 0.6s ease;
        }

        .swiper .swiper-slide a:hover svg {
          margin-left: 10px;
          fill: black;
          transition: all 0.6s ease;
        }

        .swiper .swiper-scrollbar {
          --swiper-scrollbar-bottom: 0px;
          --swiper-scrollbar-size: 10px;
        }

        .navigation-buttons {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 1200px;
          pointer-events: none;
          z-index: 100;
        }

        .nav-btn {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          border: 2px solid rgba(255, 255, 255, 0.8);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          pointer-events: auto;
          backdrop-filter: blur(10px);
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.9);
          color: black;
          border-color: white;
          transform: scale(1.1);
        }

        .nav-btn:active {
          transform: scale(0.95);
        }

        .nav-btn svg {
          transition: all 0.3s ease;
        }

        .nav-btn:hover svg {
          transform: scale(1.2);
        }

        .prev-btn {
          margin-left: -80px;
        }

        .next-btn {
          margin-right: -80px;
        }

        @media (min-width: 2000px) {
          .swiper .swiper-slide {
            padding: 20px;
          }
        }

        @media (max-height: 550px) {
          .swiper .swiper-slide figcaption p {
            -webkit-line-clamp: 2;
          }
        }

        @media (max-height: 490px) {
          .swiper .swiper-slide figcaption p {
            -webkit-line-clamp: 1;
          }
        }

        @media (max-height: 460px) {
          .swiper .swiper-slide figcaption p {
            display: none;
          }
          .swiper .swiper-slide h4 {
            margin: 0;
          }
        }

        @media (max-height: 430px) {
          .swiper .swiper-wrapper {
            position: relative;
            bottom: 6px;
          }
        }

        @media (max-width: 750px) {
          .nav-btn {
            width: 50px;
            height: 50px;
          }
          
          .prev-btn {
            margin-left: -60px;
          }

          .next-btn {
            margin-right: -60px;
          }
        }

        @media (max-width: 480px) {
          .navigation-buttons {
            max-width: 90%;
          }
          
          .nav-btn {
            width: 45px;
            height: 45px;
          }
          
          .prev-btn {
            margin-left: -50px;
          }

          .next-btn {
            margin-right: -50px;
          }
        }

      `}</style>
    </>
  );
}
