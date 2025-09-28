"use client";

import { useEffect, useState, useRef } from "react";

// GSAP 타입 정의
interface GSAPTimeline {
  set: (target: string, vars: Record<string, unknown>) => GSAPTimeline;
  to: (target: string, vars: Record<string, unknown>, position?: number | string) => GSAPTimeline;
  add: (callback: () => void, position?: number | string) => GSAPTimeline;
  from: (target: string, vars: Record<string, unknown>, position?: number | string) => GSAPTimeline;
  fromTo: (target: string, fromVars: Record<string, unknown>, toVars: Record<string, unknown>, position?: number | string) => GSAPTimeline;
  call: (callback: () => void, params?: unknown[], position?: number | string) => GSAPTimeline;
}

interface GSAP {
  timeline: () => GSAPTimeline;
  set: (target: string, vars: Record<string, unknown>) => void;
  to: (target: string, vars: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    gsap: GSAP;
  }
}

export default function CardAnimation() {
  const [randomHorse, setRandomHorse] = useState({
    name: "아이스",
    type: "번식용",
    sex: "암",
    birthYear: "2004년생",
    farm: "안성팜랜드",
    raceCount: "경주 0회",
    prize: "상금 ₩0"
  });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 랜덤 말 데이터 생성
  const horseData = [
    { name: "아이스", type: "번식용", sex:"암", birthYear: "2004년생", farm: "안성팜랜드", raceCount: "경주 0회", prize: "상금 ₩0" },
    { name: "썬더", type: "경주마", sex:"암", birthYear: "2018년생", farm: "제주마장", raceCount: "경주 12회", prize: "상금 ₩250,000" },
    { name: "스타", type: "번식용수", sex:"수", birthYear: "2015년생", farm: "경주마공단", raceCount: "경주 8회", prize: "상금 ₩1,800,000" },
    { name: "문", type: "번식용", sex:"암", birthYear: "2019년생", farm: "부산경마공원", raceCount: "경주 3회", prize: "상금 ₩500,000,000" },
    { name: "라이트", type: "경주마", sex:"수", birthYear: "2020년생", farm: "서울마장", raceCount: "경주 5회", prize: "상금 ₩1,200,000" },
    { name: "스카이", type: "번식용", sex:"암", birthYear: "2017년생", farm: "대구경마장", raceCount: "경주 15회", prize: "상금 ₩3,200,000" }
  ];

  // Intersection Observer로 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // 랜덤 말 선택 및 주기적 변경
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * horseData.length);
    setRandomHorse(horseData[randomIndex]);
    
    // 1.5초마다 랜덤하게 말 변경
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * horseData.length);
      setRandomHorse(horseData[randomIndex]);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    // GSAP 라이브러리 로드
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      // GSAP가 로드된 후 실행
      if (window.gsap) {
        const gsap = window.gsap;
        
        gsap.timeline()
          .set('.logo', { x: 215, y: 482 })
          .set('.chip', { x: 148, y: 66 })
          .set('.knot', { x: 22, y: 250 })
          .set('.donation-text-1', { opacity: 0, x: -50 })
          .set('.donation-text-2', { opacity: 0, x: -50 })
          .set('.numTxt', { x: 22, y: 375 })
          .set('.nameTxt', { x: 22, y: 410 })
          .add(centerMain, 0.2)
          .from('.ball', {
            duration: 2,
            transformOrigin: '50% 50%',
            scale: 0,
            opacity: 0,
            ease: 'elastic',
            stagger: 0.2
          }, 0)
          .fromTo('.card', {
            x: 200,
            y: 40,
            transformOrigin: '50% 50%',
            rotation: -4,
            skewX: 10,
            skewY: 4,
            scale: 2,
            opacity: 0
          }, {
            duration: 1.3,
            skewX: 0,
            skewY: 0,
            scale: 1,
            opacity: 1,
            ease: 'power4.inOut'
          }, 0.2)
          .to('.donation-text-1', { duration: 1, opacity: 1, x: 30, ease: "power2.out" }, 1.5)
          .to('.donation-text-2', { duration: 1, opacity: 1, x: 30, ease: "power2.out" }, 1.8);

        function centerMain() {
          gsap.set('.main', { x: '50%', xPercent: -50, y: '50%', yPercent: -50 });
        }
        window.onresize = centerMain;

        window.onmousemove = (e) => {
          const winPercent = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
          const distFromCenter = 1 - Math.abs((e.clientX - window.innerWidth / 2) / window.innerWidth * 2);
          
          gsap.timeline({ defaults: { duration: 0.5, overwrite: 'auto' } })
            .to('.card', { rotation: -7 + 9 * winPercent.x }, 0)
            .to('.fillLight', { opacity: distFromCenter }, 0)
            .to('.bg', { x: 100 - 200 * winPercent.x, y: 20 - 40 * winPercent.y }, 0)
            .to('.donation-text-1', { opacity: 1, x: 30, duration: 1, ease: "power2.out" }, 0)
            .to('.donation-text-2', { opacity: 1, x: 30, duration: 1, ease: "power2.out" }, 0.2);
        };
      }
    };
    document.head.appendChild(script);

    return () => {
      // cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isVisible]);

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono&display=swap');
        
        .card-animation-container {
          width: 100%;
          height: 85vh;
          overflow: hidden;
          font-family: 'Space Mono', monospace;
          letter-spacing: 1.6px;
        }
      `}</style>
      
      <div ref={containerRef} className="card-animation-container">
        <svg width="100%" height="100%">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="65%">
              <stop offset="10%" stopColor="#004476" />
              <stop offset="90%" stopColor="#006fbe" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="85%">
              <stop offset="0%" stopColor="#f5eacc" />
              <stop offset="80%" stopColor="#e0c677" />
              <stop offset="110%" stopColor="#ebd8a0" />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="85%">
              <stop offset="0%" stopColor="#54e2fe" />
              <stop offset="80%" stopColor="#049afd" />
              <stop offset="110%" stopColor="#2aaffc" />
            </linearGradient>
             <linearGradient id="grad4" x1="0%" y1="0%" x2="80%" y2="70%">
               <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
               <stop offset="90%" stopColor="rgba(255,255,255,0.3)" />
             </linearGradient>
             <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#4fd1c7" />
               <stop offset="50%" stopColor="#f472b6" />
               <stop offset="100%" stopColor="#4fd1c7" />
             </linearGradient>
            
            <pattern id="cardBg" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <image opacity="0.5" width="100" height="100" xlinkHref="https://assets.codepen.io/721952/whiteNoise2.png" />
              <image className="fillLight" opacity="0.5" width="100" height="100" xlinkHref="https://assets.codepen.io/721952/whiteNoise.png" />
            </pattern>
            
            <mask id="m">
              <rect className="card" fill="#fff" width="340" height="540" rx="30" ry="30" />
            </mask>
          </defs>
          
          <rect fill="url(#grad1)" width="100%" height="100%" />
          
          <g className="main">
            <circle className="ball bg" fill="url(#grad2)" cx="120" cy="130" r="130"/>
            <circle className="ball bg" fill="url(#grad3)" cx="550" cy="410" r="210"/>
            <g className="blur" mask="url(#m)">
              <image className="bg" x="33" y="7" width="700" height="600" xlinkHref="https://assets.codepen.io/721952/bgBlur.jpg" />
            </g>
             <g className="card">
               <rect fill="none" stroke="url(#cardBorder)" opacity="0.9" strokeWidth="4" width="341" height="541" rx="31" ry="31" />
               <rect fill="url(#cardBg)" width="340" height="540" rx="30" ry="30" opacity="0.8" />
               
               {/* 말 이미지 영역 */}
               <rect fill="url(#grad2)" width="300" height="350" x="20" y="20" rx="15" ry="15" opacity="0.3" />
               <text fill="#FFFFFF" fontSize="48" x="170" y="180" textAnchor="middle"></text>
               
               {/* 말 이름 */}
               <text className="horseName" fill="#ffffff" fontSize="28" x="30" y="420" textAnchor="start" fontWeight="bold" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', 'Roboto', 'Helvetica Neue', Arial, sans-serif">{randomHorse.name}</text>
               
               {/* 말 정보 */}
               <text className="horseInfo" fill="#3bedff" fontSize="14" x="30" y="450" textAnchor="start" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', 'Roboto', 'Helvetica Neue', Arial, sans-serif">{randomHorse.type} • {randomHorse.sex} •{randomHorse.birthYear}</text>
               
               {/* 목장 정보 */}
               <text className="farmInfo" fill="#ffffff" fontSize="12" x="30" y="480" textAnchor="start" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', 'Roboto', 'Helvetica Neue', Arial, sans-serif">{randomHorse.farm} | {randomHorse.raceCount} | {randomHorse.prize}</text>
               
            </g>
          </g>
          
          {/* 기부 문구 - 카드 오른쪽 */}
          <text className="donation-text-1" fill="#ffffff" fontSize="35" x="700" y="200" textAnchor="start" fontWeight="bold" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', 'Roboto', 'Helvetica Neue', Arial, sans-serif">기부할 때마다 나만의 말 카드를 모으는 즐거움</text>
          <text className="donation-text-2" fill="#ffffff" fontSize="35" x="700" y="260" textAnchor="start" fontWeight="bold" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', 'Roboto', 'Helvetica Neue', Arial, sans-serif">후원할수록 늘어나는 특별한 컬렉션을 만나보세요</text>
        </svg>
      </div>
      
    </>
  );
}
