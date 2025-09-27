'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// GSAP 플러그인 등록
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Draggable);
}

interface InfiniteSliderProps {
  images: string[];
  className?: string;
}

export default function InfiniteSlider({ images, className = '' }: InfiniteSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<HTMLDivElement>(null);
  const dragProxyRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<gsap.core.Timeline | null>(null);
  const playheadRef = useRef({ position: 0 });
  // iterationRef 제거됨 - 단순화를 위해 iteration 관리 제거
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!boxesRef.current || !dragProxyRef.current) return;

    const boxes = Array.from(boxesRef.current.querySelectorAll('.box')) as HTMLElement[];
    
    if (boxes.length === 0) return;

    // 초기 설정
    gsap.set(boxes, {
      yPercent: -50,
      display: 'block'
    });

    const STAGGER = 0.1;
    const DURATION = 1;
    const OFFSET = 0;

    // 메인 루프 타임라인 생성
    const LOOP = gsap.timeline({
      paused: true,
      repeat: -1,
      ease: 'none',
    });

    // 박스들을 3번 반복하여 무한 루프 효과 생성
    const SHIFTS = [...boxes, ...boxes, ...boxes];

    SHIFTS.forEach((box, index) => {
      const BOX_TL = gsap
        .timeline()
        .set(box, {
          xPercent: 250,
          rotateY: -50,
          opacity: 0,
          scale: 0.5,
        })
        // 투명도와 스케일 애니메이션
        .to(box, {
          opacity: 1,
          scale: 1,
          duration: 0.1,
        }, 0)
        .to(box, {
          opacity: 0,
          scale: 0.5,
          duration: 0.1,
        }, 0.9)
        // 이동 애니메이션
        .fromTo(box, {
          xPercent: 250,
        }, {
          xPercent: -350,
          duration: 1,
          immediateRender: false,
          ease: 'power1.inOut',
        }, 0)
        // 회전 애니메이션
        .fromTo(box, {
          rotateY: -50,
        }, {
          rotateY: 50,
          immediateRender: false,
          duration: 1,
          ease: 'power4.inOut',
        }, 0)
        // Z축과 스케일 애니메이션
        .to(box, {
          z: 100,
          scale: 1.25,
          duration: 0.1,
          repeat: 1,
          yoyo: true,
        }, 0.4)
        .fromTo(box, {
          zIndex: 1,
        }, {
          zIndex: boxes.length,
          repeat: 1,
          yoyo: true,
          ease: 'none',
          duration: 0.5,
          immediateRender: false,
        }, 0);
      
      LOOP.add(BOX_TL, index * STAGGER);
    });

    loopRef.current = LOOP;

    const CYCLE_DURATION = STAGGER * boxes.length;
    const START_TIME = CYCLE_DURATION + DURATION * 0.5 + OFFSET;

    const LOOP_HEAD = gsap.fromTo(LOOP, {
      totalTime: START_TIME,
    }, {
      totalTime: `+=${CYCLE_DURATION}`,
      duration: 1,
      ease: 'none',
      repeat: -1,
      paused: true,
    });

    const POSITION_WRAP = gsap.utils.wrap(0, LOOP_HEAD.duration());

    const SCRUB = gsap.to(playheadRef.current, {
      position: 0,
      onUpdate: () => {
        LOOP_HEAD.totalTime(POSITION_WRAP(playheadRef.current.position));
      },
      paused: true,
      duration: 0.25,
      ease: 'power3',
    });

    // 타입 안전성을 위한 헬퍼 함수
    const getScrubPosition = (): number => {
      if (triggerRef.current) {
        return triggerRef.current.progress;
      }
      return typeof SCRUB.vars.position === 'number' ? SCRUB.vars.position : 0;
    };

    // ScrollTrigger 생성
    const TRIGGER = ScrollTrigger.create({
      start: 0,
      end: '+=4000', // 스크롤 범위를 더 크게 설정
      horizontal: false,
      pin: '.boxes',
      onUpdate: self => {
        const PROGRESS = self.progress;
        
        // 스크롤 진행도에 따라 슬라이더 위치 계산
        // 0 (시작) → 1 (끝)로 진행하면서 슬라이드도 순차적으로 이동
        const NEW_POS = PROGRESS * LOOP_HEAD.duration();
        (SCRUB.vars as any).position = NEW_POS;
        SCRUB.invalidate().restart();
      },
    });

    triggerRef.current = TRIGGER;

    // WRAP 함수 단순화 - iteration 관리 제거
    const WRAP = (iterationDelta: number, scrollTo: number) => {
      // iteration 관리를 제거하고 단순히 스크롤 위치만 조정
      TRIGGER.scroll(scrollTo);
      TRIGGER.update();
    };

    const SNAP = gsap.utils.snap(1 / boxes.length);

    const progressToScroll = (progress: number) =>
      gsap.utils.clamp(
        0,
        TRIGGER.end,
        progress * TRIGGER.end
      );

    const scrollToPosition = (position: number) => {
      // 위치를 0과 1 사이로 정규화
      let normalizedPosition = position % 1;
      if (normalizedPosition < 0) normalizedPosition += 1;
      
      const SNAP_POS = SNAP(normalizedPosition);
      const SCROLL = progressToScroll(SNAP_POS);
      TRIGGER.scroll(SCROLL);
    };

    ScrollTrigger.addEventListener('scrollEnd', () =>
      scrollToPosition(getScrubPosition())
    );

    const NEXT = () => {
      const currentProgress = getScrubPosition();
      let nextProgress = currentProgress + (1 / boxes.length);
      
      // 1을 넘으면 0으로 래핑 (무한 루프)
      if (nextProgress >= 1) {
        nextProgress = 0;
      }
      
      scrollToPosition(nextProgress);
    };
    
    const PREV = () => {
      const currentProgress = getScrubPosition();
      let prevProgress = currentProgress - (1 / boxes.length);
      
      // 0보다 작으면 1에서 해당 값만큼 뺀 값으로 래핑
      if (prevProgress < 0) {
        prevProgress = 1 + prevProgress; // prevProgress는 이미 음수이므로 더하면 됨
      }
      
      scrollToPosition(prevProgress);
    };

    // 키보드 이벤트
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') PREV();
      if (event.code === 'ArrowRight' || event.code === 'KeyD') NEXT();
    };

    // 박스 클릭 이벤트
    const handleBoxClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const BOX = target.closest('.box') as HTMLElement;
      if (BOX) {
        let TARGET = boxes.indexOf(BOX);
        const targetProgress = TARGET / boxes.length;
        scrollToPosition(targetProgress);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (boxesRef.current) {
      boxesRef.current.addEventListener('click', handleBoxClick);
    }

    // 드래그 기능 - 전체 슬라이더 영역에서 드래그 가능하도록 수정
    const draggable = Draggable.create(dragProxyRef.current, {
      type: 'x',
      trigger: '.boxes', // 전체 슬라이더 영역을 트리거로 변경
      onPress() {
        (this as any).startOffset = getScrubPosition();
      },
      onDrag() {
        // 드래그 감도를 조정하고 방향을 수정
        const dragDelta = ((this as any).startX - (this as any).x) * 0.002;
        (SCRUB.vars as any).position = (this as any).startOffset + dragDelta;
        SCRUB.invalidate().restart();
      },
      onDragEnd() {
        scrollToPosition(getScrubPosition());
      },
    });

    // 버튼 이벤트 리스너 추가
    const nextButton = document.querySelector('.next');
    const prevButton = document.querySelector('.prev');

    const handleNextClick = () => NEXT();
    const handlePrevClick = () => PREV();

    nextButton?.addEventListener('click', handleNextClick);
    prevButton?.addEventListener('click', handlePrevClick);

    gsap.set('button', { z: 200 });

    // 클린업 함수
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (boxesRef.current) {
        boxesRef.current.removeEventListener('click', handleBoxClick);
      }
      
      // 버튼 이벤트 리스너 제거
      const nextBtn = document.querySelector('.next');
      const prevBtn = document.querySelector('.prev');
      nextBtn?.removeEventListener('click', handleNextClick);
      prevBtn?.removeEventListener('click', handlePrevClick);
      
      if (triggerRef.current) {
        triggerRef.current.kill();
      }
      if (loopRef.current) {
        loopRef.current.kill();
      }
      if (draggable && draggable[0]) {
        draggable[0].kill();
      }
      ScrollTrigger.killAll();
    };
  }, [images]);

  return (
    <div className={`infinite-slider relative w-full h-screen overflow-hidden ${className}`}>
      <style jsx>{`
        :root {
          --bg: hsl(0, 0%, 10%);
          --min-size: 200px;
        }

        .infinite-slider {
          display: grid;
          place-items: center;
          min-height: 100vh;
          padding: 0;
          margin: 0;
          overflow-y: hidden;
          background: var(--bg);
        }

        .drag-proxy {
          visibility: hidden;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 100;
        }

        .controls {
          position: absolute;
          top: calc(50% + clamp(var(--min-size), 20vmin, 20vmin));
          left: 50%;
          transform: translate(-50%, -50%) scale(1.5);
          display: flex;
          justify-content: space-between;
          min-width: var(--min-size);
          height: 44px;
          width: 20vmin;
          z-index: 300;
        }

        .controls button {
          height: 48px;
          width: 48px;
          border-radius: 50%;
          position: absolute;
          top: 0%;
          outline: transparent;
          cursor: pointer;
          background: none;
          appearance: none;
          border: 0;
          transition: transform 0.1s;
          transform: translate(0, calc(var(--y, 0)));
          color: white;
        }

        .controls button:before {
          border: 2px solid hsl(0, 0%, 90%);
          background: linear-gradient(hsla(0, 0%, 80%, 0.65), hsl(0, 0%, 0%)) hsl(0, 0%, 0%);
          content: '';
          box-sizing: border-box;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 80%;
          width: 80%;
          border-radius: 50%;
        }

        .controls button:active:before {
          background: linear-gradient(hsl(0, 0%, 0%), hsla(0, 0%, 80%, 0.65)) hsl(0, 0%, 0%);
        }

        .controls button:nth-of-type(1) {
          right: 100%;
        }

        .controls button:nth-of-type(2) {
          left: 100%;
        }

        .controls button span {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .controls button:hover {
          --y: -5%;
        }

        .controls button svg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(0deg) translate(2%, 0);
          height: 30%;
          fill: hsl(0, 0%, 90%);
        }

        .controls button:nth-of-type(1) svg {
          transform: translate(-50%, -50%) rotate(180deg) translate(2%, 0);
        }


        .scroll-icon {
          height: 30px;
          position: fixed;
          top: 1rem;
          right: 1rem;
          color: hsl(0, 0%, 90%);
          animation: action 4s infinite;
        }

        @keyframes action {
          0%, 25%, 50%, 100% {
            transform: translate(0, 0);
          }
          12.5%, 37.5% {
            transform: translate(0, 25%);
          }
        }

        .boxes {
          height: 100vh;
          width: 100%;
          overflow: hidden;
          position: absolute;
          transform-style: preserve-3d;
          perspective: 800px;
          touch-action: none;
        }

        .box {
          transform-style: preserve-3d;
          position: absolute;
          top: 50%;
          left: 50%;
          height: 20vmin;
          width: 20vmin;
          min-height: var(--min-size);
          min-width: var(--min-size);
          display: none;
        }

        .box:after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          height: 100%;
          width: 100%;
          background-image: var(--src);
          background-size: cover;
          transform: translate(-50%, -50%) rotate(180deg) translate(0, -100%) translate(0, -0.5vmin);
          opacity: 0.75;
        }

        .box:before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          height: 100%;
          width: 100%;
          background: linear-gradient(var(--bg) 50%, transparent);
          transform: translate(-50%, -50%) rotate(180deg) translate(0, -100%) translate(0, -0.5vmin) scale(1.01);
          z-index: 2;
        }

        .box img {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          object-fit: cover;
        }

        .box:nth-of-type(odd) {
          background: hsl(90, 80%, 70%);
        }

        .box:nth-of-type(even) {
          background: hsl(90, 80%, 40%);
        }

        @supports(-webkit-box-reflect: below) {
          .box {
            -webkit-box-reflect: below 0.5vmin linear-gradient(transparent 0 50%, white 100%);
          }

          .box:after,
          .box:before {
            display: none;
          }
        }

        @media (min-width: 800px) {
          :root {
            --min-size: 250px;
          }
        }
      `}</style>

      <div className="boxes" ref={boxesRef}>
        {images.map((image, index) => (
          <div
            key={index}
            className="box"
            style={{ '--src': `url(${image})` } as React.CSSProperties}
          >
            <span>{index + 1}</span>
            <img src={image} alt={`Slide ${index + 1}`} />
          </div>
        ))}
      </div>

      {/* 네비게이션 버튼들 */}
      <div className="controls">
        <button className="prev">
          <span>Previous slide</span>
          <ChevronLeft size={24} />
        </button>
        <button className="next">
          <span>Next slide</span>
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 스크롤 아이콘 */}
      <svg className="scroll-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M20 6H23L19 2L15 6H18V18H15L19 22L23 18H20V6M9 3.09C11.83 3.57 14 6.04 14 9H9V3.09M14 11V15C14 18.3 11.3 21 8 21S2 18.3 2 15V11H14M7 9H2C2 6.04 4.17 3.57 7 3.09V9Z" />
      </svg>

      {/* 드래그 프록시 */}
      <div className="drag-proxy" ref={dragProxyRef}></div>
    </div>
  );
}
