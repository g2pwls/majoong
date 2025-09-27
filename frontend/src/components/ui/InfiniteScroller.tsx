'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// GSAP 플러그인 등록
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface InfiniteScrollerProps {
  images: string[];
}

export default function InfiniteScroller({ images }: InfiniteScrollerProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const scrubRef = useRef<gsap.core.Tween | null>(null);
  const seamlessLoopRef = useRef<gsap.core.Timeline | null>(null);
  const iterationRef = useRef(0);

  useEffect(() => {
    if (!galleryRef.current || !cardsRef.current) return;

    // 이미지 페이드 인
    gsap.to("img", { opacity: 1, delay: 0.1 });

    const spacing = 0.1;
    const snap = gsap.utils.snap(spacing);
    const cards = gsap.utils.toArray<HTMLElement>('.cards li');

    // Seamless Loop 빌드
    const seamlessLoop = buildSeamlessLoop(cards, spacing);
    seamlessLoopRef.current = seamlessLoop;

    // Scrub tween 생성
    const scrub = gsap.to(seamlessLoop, {
      totalTime: 0,
      duration: 0.5,
      ease: "power3",
      paused: true
    });
    scrubRef.current = scrub;

    // Wrap 함수들
    const wrapForward = (trigger: ScrollTrigger) => {
      iterationRef.current++;
      (trigger as any).wrapping = true;
      trigger.scroll(trigger.start + 1);
    };

    const wrapBackward = (trigger: ScrollTrigger) => {
      iterationRef.current--;
      if (iterationRef.current < 0) {
        iterationRef.current = 9;
        seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10);
        scrub.pause();
      }
      (trigger as any).wrapping = true;
      trigger.scroll(trigger.end - 1);
    };

    const scrubTo = (totalTime: number) => {
      let progress = (totalTime - seamlessLoop.duration() * iterationRef.current) / seamlessLoop.duration();
      
      if (progress > 1) {
        wrapForward(trigger);
      } else if (progress < 0) {
        wrapBackward(trigger);
      } else {
        trigger.scroll(trigger.start + progress * (trigger.end - trigger.start));
      }
    };

    // ScrollTrigger 생성
    const trigger = ScrollTrigger.create({
      start: 0,
      onUpdate(self) {
        if (self.progress === 1 && self.direction > 0 && !(self as any).wrapping) {
          wrapForward(self);
        } else if (self.progress < 1e-5 && self.direction < 0 && !(self as any).wrapping) {
          wrapBackward(self);
        } else {
          scrub.vars.totalTime = snap((iterationRef.current + self.progress) * seamlessLoop.duration());
          scrub.invalidate().restart();
          (self as any).wrapping = false;
        }
      },
      end: "+=3000",
      pin: ".gallery"
    });
    triggerRef.current = trigger;

    // 버튼 이벤트 리스너
    const nextButton = document.querySelector(".next");
    const prevButton = document.querySelector(".prev");

    const handleNext = () => scrubTo(scrub.vars.totalTime + spacing);
    const handlePrev = () => scrubTo(scrub.vars.totalTime - spacing);

    nextButton?.addEventListener("click", handleNext);
    prevButton?.addEventListener("click", handlePrev);

    // 클린업
    return () => {
      nextButton?.removeEventListener("click", handleNext);
      prevButton?.removeEventListener("click", handlePrev);
      
      if (triggerRef.current) {
        triggerRef.current.kill();
      }
      if (scrubRef.current) {
        scrubRef.current.kill();
      }
      if (seamlessLoopRef.current) {
        seamlessLoopRef.current.kill();
      }
    };
  }, [images]);

  // buildSeamlessLoop 함수
  const buildSeamlessLoop = (items: HTMLElement[], spacing: number) => {
    let overlap = Math.ceil(1 / spacing);
    let startTime = items.length * spacing + 0.5;
    let loopTime = (items.length + overlap) * spacing + 1;
    let rawSequence = gsap.timeline({ paused: true });
    let seamlessLoop = gsap.timeline({
      paused: true,
      repeat: -1,
      onRepeat() {
        if (this._time === this._dur) {
          (this as any)._tTime += this._dur - 0.01;
        }
      }
    });

    let l = items.length + overlap * 2;
    let time = 0;
    let i, index, item;

    // 초기 상태 설정
    gsap.set(items, { xPercent: 400, opacity: 0, scale: 0 });

    // 애니메이션 생성
    for (i = 0; i < l; i++) {
      index = i % items.length;
      item = items[index];
      time = i * spacing;
      
      rawSequence.fromTo(item, 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false }, 
        time
      ).fromTo(item, 
        { xPercent: 400 }, 
        { xPercent: -400, duration: 1, ease: "none", immediateRender: false }, 
        time
      );
      
      if (i <= items.length) {
        seamlessLoop.add("label" + i, time);
      }
    }

    // Seamless scrubbing 설정
    rawSequence.time(startTime);
    seamlessLoop.to(rawSequence, {
      time: loopTime,
      duration: loopTime - startTime,
      ease: "none"
    }).fromTo(rawSequence, 
      { time: overlap * spacing + 1 }, 
      { time: startTime, duration: startTime - (overlap * spacing + 1), immediateRender: false, ease: "none" }
    );

    return seamlessLoop;
  };

  return (
    <div className="gallery" ref={galleryRef}>
      <ul className="cards" ref={cardsRef}>
        {images.map((image, index) => (
          <li key={`first-${index}`}>
            <img src={image} alt={`Portrait ${index + 1}`} />
          </li>
        ))}
        {images.map((image, index) => (
          <li key={`second-${index}`}>
            <img src={image} alt={`Portrait ${index + 1}`} />
          </li>
        ))}
      </ul>
      
      <div className="actions">
        <button className="prev">
          <ChevronLeft size={20} />
          <span>Prev</span>
        </button>
        <button className="next">
          <span>Next</span>
          <ChevronRight size={20} />
        </button>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: Mori;
          background: #111;
          min-height: 100vh;
          padding: 0;
          margin: 0;
        }
        
        .gallery {
          position: absolute;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        .cards {
          position: absolute;
          width: 14rem;
          height: 18rem;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .cards li {
          list-style: none;
          padding: 0;
          margin: 0;
          width: 14rem;
          height: 18rem;
          text-align: center;
          line-height: 18rem;
          font-size: 2rem;
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 0.8rem;
        }

        .cards li img {
          max-width: 90%;
          opacity: 0;
        }

        .actions {
          position: absolute;
          top: 60%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          gap: 2rem;
        }

        button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          outline: none;
          background: #111;
          border: solid 2px #fff;
          color: #fff;
          text-decoration: none;
          border-radius: 99px;
          padding: 16px 32px;
          font-weight: 600;
          cursor: pointer;
          line-height: 18px;
          transition: all 0.3s ease;
          font-size: 16px;
          min-width: 120px;
          justify-content: center;
        }

        button:hover {
          background: #fff;
          color: #111;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
        }

        button:active {
          transform: translateY(0);
        }

        button svg {
          flex-shrink: 0;
        }

        a {
          color: #88ce02;
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
