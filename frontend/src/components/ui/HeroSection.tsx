'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

// GSAP Observer 플러그인 등록
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Observer);
}

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const imagesRef = useRef<HTMLDivElement[]>([]);
  const headingsRef = useRef<HTMLHeadingElement[]>([]);
  const outerWrappersRef = useRef<HTMLDivElement[]>([]);
  const innerWrappersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sections = sectionsRef.current;
    const images = imagesRef.current;
    const headings = headingsRef.current;
    const outerWrappers = outerWrappersRef.current;
    const innerWrappers = innerWrappersRef.current;

    if (sections.length === 0) return;

    // SplitText 대신 수동으로 문자 분할
    const splitHeadings = headings.map(heading => {
      const text = heading.textContent || '';
      heading.innerHTML = text.split('').map(char => 
        `<span class="char" style="display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
      return {
        chars: Array.from(heading.querySelectorAll('.char'))
      };
    });

    let currentIndex = -1;
    const wrap = gsap.utils.wrap(0, sections.length);
    let animating = false;

    gsap.set(outerWrappers, { yPercent: 100 });
    gsap.set(innerWrappers, { yPercent: -100 });

    function gotoSection(index: number, direction: number) {
      index = wrap(index);
      animating = true;
      const fromTop = direction === -1;
      const dFactor = fromTop ? -1 : 1;
      
      const tl = gsap.timeline({
        defaults: { duration: 1.25, ease: "power1.inOut" },
        onComplete: () => { animating = false; }
      });

      if (currentIndex >= 0) {
        gsap.set(sections[currentIndex], { zIndex: 0 });
        tl.to(images[currentIndex], { yPercent: -15 * dFactor })
          .set(sections[currentIndex], { autoAlpha: 0 });
      }

      gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
      
      tl.fromTo([outerWrappers[index], innerWrappers[index]], { 
        yPercent: (i: number) => i ? -100 * dFactor : 100 * dFactor
      }, { 
        yPercent: 0 
      }, 0)
      .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
      .fromTo(splitHeadings[index].chars, { 
        autoAlpha: 0, 
        yPercent: 150 * dFactor
      }, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 1,
        ease: "power2",
        stagger: {
          each: 0.02,
          from: "random"
        }
      }, 0.2);

      currentIndex = index;
    }

    const observer = Observer.create({
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      onDown: () => !animating && gotoSection(currentIndex - 1, -1),
      onUp: () => !animating && gotoSection(currentIndex + 1, 1),
      tolerance: 10,
      preventDefault: true,
      target: containerRef.current
    });

    gotoSection(0, 1);

    return () => {
      observer.kill();
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        .hero-container * {
          box-sizing: border-box;
          user-select: none;
        }

        .hero-container a {
          color: white;
          text-decoration: none;
        }

        .hero-container {
          margin: 0;
          padding: 0;
          height: 75vh;
          color: white;
          text-transform: uppercase;
          font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", "Roboto", "Helvetica Neue", Arial, sans-serif;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }

         .hero-container h2 {
           font-size: clamp(1rem, 5vw, 7rem);
           font-weight: 600;
           text-align: center;
           margin-right: -0.5em;
           width: 90vw;
           max-width: 1200px;
           text-transform: none;
         }

        .hero-header {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5%;
          width: 100%;
          z-index: 3;
          height: 7em;
          font-size: clamp(0.66rem, 2vw, 1rem);
          letter-spacing: 0.5em;
        }

        .hero-section {
          height: 100%;
          width: 100%;
          top: 0;
          position: absolute;
          visibility: hidden;
        }

        .hero-section .outer,
        .hero-section .inner {
          width: 100%;
          height: 100%;
          overflow-y: hidden;
        }

        .hero-section .bg {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          background-size: cover;
          background-position: center;
        }

        .hero-section .bg h2 {
          z-index: 999;
        }

        .hero-section .bg .clip-text {
          overflow: hidden;
        }

         .first .bg {
           background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 100%),
              url("/images/main-animated/main1.jpg");
         }

         .second .bg {
           background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 100%),
              url("/images/main-animated/main2.jpg");
         }

         .third .bg {
           background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 100%),
             url("/images/main-animated/main3.jpg");
         }

         .fourth .bg {
           background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 100%),
             url("/images/main-animated/main4.webp");
         }

         .fifth .bg {
           background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 100%),
             url("/images/main-animated/main5.jpg");
           background-position: 50% 45%;
         }

        .hero-section h2 * {
          will-change: transform;
        }

        .char {
          will-change: transform;
        }
      `}</style>

      <div ref={containerRef} className={`hero-container ${className}`}>
        <header className="hero-header">
          <div>마중</div>
          <div><Link href="/support">목장 둘러보기</Link></div>
        </header>

        <section 
          ref={(el) => { if (el) sectionsRef.current[0] = el; }}
          className="hero-section first"
        >
          <div 
            ref={(el) => { if (el) outerWrappersRef.current[0] = el; }}
            className="outer"
          >
            <div 
              ref={(el) => { if (el) innerWrappersRef.current[0] = el; }}
              className="inner"
            >
              <div 
                ref={(el) => { if (el) imagesRef.current[0] = el; }}
                className="bg one"
              >
                 <h2 
                   ref={(el) => { if (el) headingsRef.current[0] = el; }}
                   className="section-heading"
                 >
                   도착지가 정해진 경주에서
                 </h2>
              </div>
            </div>
          </div>
        </section>

        <section 
          ref={(el) => { if (el) sectionsRef.current[1] = el; }}
          className="hero-section second"
        >
          <div 
            ref={(el) => { if (el) outerWrappersRef.current[1] = el; }}
            className="outer"
          >
            <div 
              ref={(el) => { if (el) innerWrappersRef.current[1] = el; }}
              className="inner"
            >
              <div 
                ref={(el) => { if (el) imagesRef.current[1] = el; }}
                className="bg"
              >
                 <h2 
                   ref={(el) => { if (el) headingsRef.current[1] = el; }}
                   className="section-heading"
                 >
                   한없이 자유로운 걸음으로
                 </h2>
              </div>
            </div>
          </div>
        </section>

        <section 
          ref={(el) => { if (el) sectionsRef.current[2] = el; }}
          className="hero-section third"
        >
          <div 
            ref={(el) => { if (el) outerWrappersRef.current[2] = el; }}
            className="outer"
          >
            <div 
              ref={(el) => { if (el) innerWrappersRef.current[2] = el; }}
              className="inner"
            >
              <div 
                ref={(el) => { if (el) imagesRef.current[2] = el; }}
                className="bg"
              >
                 <h2 
                   ref={(el) => { if (el) headingsRef.current[2] = el; }}
                   className="section-heading"
                 >
                   퇴역의 시작, 마생의 시작
                 </h2>
              </div>
            </div>
          </div>
        </section>

        <section 
          ref={(el) => { if (el) sectionsRef.current[3] = el; }}
          className="hero-section fourth"
        >
          <div 
            ref={(el) => { if (el) outerWrappersRef.current[3] = el; }}
            className="outer"
          >
            <div 
              ref={(el) => { if (el) innerWrappersRef.current[3] = el; }}
              className="inner"
            >
              <div 
                ref={(el) => { if (el) imagesRef.current[3] = el; }}
                className="bg"
              >
                 <h2 
                   ref={(el) => { if (el) headingsRef.current[3] = el; }}
                   className="section-heading"
                 >
                   퇴역마의 새로운 시작을 함께 마중해보세요
                 </h2>
              </div>
            </div>
          </div>
        </section>

        <section 
          ref={(el) => { if (el) sectionsRef.current[4] = el; }}
          className="hero-section fifth"
        >
          <div 
            ref={(el) => { if (el) outerWrappersRef.current[4] = el; }}
            className="outer"
          >
            <div 
              ref={(el) => { if (el) innerWrappersRef.current[4] = el; }}
              className="inner"
            >
              <div 
                ref={(el) => { if (el) imagesRef.current[4] = el; }}
                className="bg"
              >
                 <h2 
                   ref={(el) => { if (el) headingsRef.current[4] = el; }}
                   className="section-heading"
                 >
                   마중
                 </h2>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HeroSection;
