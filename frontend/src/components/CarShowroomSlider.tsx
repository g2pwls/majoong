"use client";

import { useEffect, useRef } from "react";

export default function CarShowroomSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    class AccordionSlider {
      slides: NodeListOf<Element>;
      prevBtn: Element | null;
      nextBtn: Element | null;
      currentIndex: number;

      constructor(container: HTMLElement) {
        this.slides = container.querySelectorAll(".slide");
        this.prevBtn = container.querySelector(".nav-prev");
        this.nextBtn = container.querySelector(".nav-next");
        this.currentIndex = -1;

        this.init();
      }

      init() {
        this.slides.forEach((slide, index) => {
          slide.addEventListener("click", () => this.setActiveSlide(index));
        });

        this.prevBtn?.addEventListener("click", () => this.previousSlide());
        this.nextBtn?.addEventListener("click", () => this.nextSlide());

        document.addEventListener("keydown", (e) => {
          if (e.key === "ArrowLeft") this.previousSlide();
          if (e.key === "ArrowRight") this.nextSlide();
        });
      }

      setActiveSlide(index: number) {
        if (this.currentIndex === index) {
          this.slides.forEach((slide) => slide.classList.remove("active"));
          this.currentIndex = -1;
        } else {
          this.slides.forEach((slide) => slide.classList.remove("active"));
          this.slides[index].classList.add("active");
          this.currentIndex = index;
        }
      }

      nextSlide() {
        const nextIndex =
          this.currentIndex === -1 ? 0 : (this.currentIndex + 1) % this.slides.length;
        this.setActiveSlide(nextIndex);
      }

      previousSlide() {
        const prevIndex =
          this.currentIndex === -1
            ? this.slides.length - 1
            : (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.setActiveSlide(prevIndex);
      }
    }

    if (sliderRef.current) {
      new AccordionSlider(sliderRef.current);
    }
  }, []);

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
        }

        .slider-container {
          width: 100%;
          height: 80vh;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .now-showing {
          position: absolute;
          top: 36px;
          left: 20px;
          color: #9fff6b;
          font-size: 19px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 10;
        }

        .now-showing::before {
          content: "";
          width: 6px;
          height: 6px;
          background: #9fff6b;
          border-radius: 50%;
        }

        .accordion-slider {
          display: flex;
          height: 100%;
          position: relative;
        }

        .slide {
          flex: 1;
          position: relative;
          cursor: pointer;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          filter: grayscale(1);
        }

        .slide:hover {
          filter: grayscale(0);
        }

        .slide.active {
          flex: 2.5;
          filter: grayscale(0);
        }

        .slide::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 80%);
        }

        .slide-content {
          position: absolute;
          bottom: 30px;
          left: 30px;
          right: 30px;
          color: white;
          z-index: 2;
        }

        .slide.active .slide-content {
          bottom: 80px;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
        }

        .slide-number {
          font-size: 64px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1;
          position: absolute;
          bottom: 30px;
          left: 30px;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slide.active .slide-number {
          bottom: auto;
          top: -50px;
          font-size: 48px;
          left: 0;
        }

        .car-brand {
          font-size: 25px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 5px;
          transform: rotate(-90deg);
          transform-origin: left bottom;
          position: absolute;
          bottom: 100px;
          left: 30px;
          white-space: nowrap;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slide.active .car-brand {
          transform: rotate(0deg);
          position: static;
          transform-origin: unset;
        }

        .car-name {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: 0s;
        }

        .slide.active .car-name {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.3s;
        }

        .car-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 20px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: 0s;
        }

        .slide.active .car-subtitle {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.4s;
        }

        .car-specs {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: 0s;
        }

        .slide.active .car-specs {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.5s;
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 14px;
          opacity: 0;
          transform: translateX(-20px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slide.active .spec-row {
          opacity: 1;
          transform: translateX(0);
        }

        .slide.active .spec-row:nth-child(1) {
          transition-delay: 0.6s;
        }
        .slide.active .spec-row:nth-child(2) {
          transition-delay: 0.65s;
        }
        .slide.active .spec-row:nth-child(3) {
          transition-delay: 0.7s;
        }
        .slide.active .spec-row:nth-child(4) {
          transition-delay: 0.75s;
        }

        .spec-label {
          color: rgba(255, 255, 255, 0.7);
        }

        .spec-value {
          color: white;
          font-weight: 600;
        }

        .performance-badges {
          display: flex;
          gap: 12px;
          margin-top: 15px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: 0s;
        }

        .slide.active .performance-badges {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.8s;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }


        .slide.active .badge {
          opacity: 1;
          transform: scale(1);
        }

        .slide.active .badge:nth-child(1) {
          transition-delay: 0.85s;
        }
        .slide.active .badge:nth-child(2) {
          transition-delay: 0.9s;
        }
        .slide.active .badge:nth-child(3) {
          transition-delay: 0.95s;
        }

        .badge-icon {
          width: 8px;
          height: 8px;
          background: #9fff6b;
          border-radius: 50%;
        }

        .badge.poor .badge-icon {
          background: #ef4444;
        }

        .badge.fair .badge-icon {
          background: #f59e0b;
        }

        .badge.good .badge-icon {
          background: #3b82f6;
        }

        .badge.excellent .badge-icon {
          background: #22c55e;
        }

        .add-button {
          position: absolute;
          bottom: 30px;
          right: 30px;
          width: 32px;
          height: 32px;
          background: transparent;
          border: 2px solid #9fff6b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s ease;
          z-index: 3;
        }

        .add-button::before,
        .add-button::after {
          content: "";
          position: absolute;
          background: #9fff6b;
          transition: all 0.4s ease;
        }

        .add-button::before {
          width: 12px;
          height: 2px;
        }

        .add-button::after {
          width: 2px;
          height: 12px;
          transform: rotate(0deg);
        }

        .slide.active .add-button::before {
          transform: rotate(0deg);
        }

        .slide.active .add-button::after {
          opacity: 0;
          transform: scale(0);
        }

        .navigation-arrows {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 4;
          backdrop-filter: blur(10px);
        }

        .nav-prev {
          left: 20px;
        }

        .nav-next {
          right: 20px;
        }

        .navigation-arrows:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .accordion-slider {
            flex-direction: column;
          }

          .slide {
            flex: 1;
            min-height: 80px;
          }

          .slide.active {
            flex: 2;
          }

          .slide-number {
            font-size: 32px;
          }

          .car-brand {
            transform: none;
            position: static;
          }
        }
      `}</style>

      <div className="slider-container" ref={sliderRef}>
        <div className="now-showing">마중만의 투명한 관리</div>

        <div className="accordion-slider">
          <div 
            className="slide" 
            style={{ backgroundImage: "url('/maron.png')" }}
          >
            <div className="slide-content">
              <div className="slide-number">마론</div>
              <div className="car-brand">01</div>
              <div className="car-name">Maron Token</div>
              <div className="car-subtitle">투명한 기부를 위한 ERC-20 기반 블록체인 토큰</div>
              <div className="car-specs">
                <div className="spec-row">
                  <span className="spec-label">기반 (Platform):</span>
                  <span className="spec-value">ERC-20</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">의미 (Meaning):</span>
                  <span className="spec-value">말(Mal) + On-chain(블록체인)</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">환율 (Exchange Rate):</span>
                  <span className="spec-value">100 KRW = 1 Maron</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">결제 구조 (Donation Flow):</span>
                  <span className="spec-value">기부자 기부 결제 → 기부자의 원화는 마중 계좌 입금</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label"></span>
                  <span className="spec-value">토큰은 목장 금고에 저장 & 블록체인 기록</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label"></span>
                  <span className="spec-value">목장주 영수증 증빙 → 확인 시 Maron 지급 → 원화 출금 & 토큰 소각</span>
                </div>
              </div>
              <div className="performance-badges">
                <div className="badge">
                  <div className="badge-icon"></div>
                  <span>🔒 투명성</span>
                </div>
                <div className="badge">
                  <div className="badge-icon"></div>
                  <span>📜 블록체인 기록</span>
                </div>
                <div className="badge">
                  <div className="badge-icon"></div>
                  <span>♻️ 소각 구조</span>
                </div>
              </div>
            </div>
            <div className="add-button"></div>
          </div>

          <div 
            className="slide" 
            style={{ backgroundImage: "url('/trusttem.png')" }}
          >
            <div className="slide-content">
              <div className="slide-number">신뢰도</div>
              <div className="car-brand">02</div>
              <div className="car-name">신뢰도 점수</div>
              <div className="car-subtitle">온도가 높을수록 관리가 잘 되고 있음을 의미</div>
              <div className="car-specs">
                <div className="spec-row">
                  <span className="spec-label">시작점 (Base):</span>
                  <span className="spec-value">말의 체온 38.2℃</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">점수 산정 (Scoring):</span>
                  <span className="spec-value">말 전체 사진 업로드 → +5점</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label"></span>
                  <span className="spec-value">영수증 및 인증 사진 업로드 → +1점</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label"></span>
                  <span className="spec-value">미업로드 시 항목(개체)당 -1점</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label"></span>
                  <span className="spec-value">(단, 메타데이터의 일시/위치 불일치 시 점수 부여 안 함)</span>
                </div>
              </div>
                <div className="performance-badges">
                  <div className="badge poor">
                    <div className="badge-icon"></div>
                    <span>38 미만: 미흡</span>
                  </div>
                  <div className="badge fair">
                    <div className="badge-icon"></div>
                    <span>38 ~ 45: 보통</span>
                  </div>
                  <div className="badge good">
                    <div className="badge-icon"></div>
                    <span>45 ~ 60: 양호</span>
                  </div>
                  <div className="badge excellent">
                    <div className="badge-icon"></div>
                    <span>60 이상: 우수</span>
                  </div>
                </div>
            </div>
            <div className="add-button"></div>
          </div>

          <div 
            className="slide" 
            style={{ backgroundImage: "url('/collection.png')" }}
          >
            <div className="slide-content">
              <div className="slide-number">컬렉션</div>
              <div className="car-brand">03</div>
              <div className="car-name">재미있게 참여할 수 있는 기부 리워드 카드</div>
              <div className="car-subtitle">좋아하는 말을 선택하고 컬렉션으로 모으세요!</div>
              <div className="car-specs">
                <div className="spec-row">
                  <span className="spec-label">기부 후 리워드:</span>
                  <span className="spec-value">전체 말 중 랜덤 5마리 등장</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label"></span>
                  <span className="spec-value">원하는 말 1마리 선택 → 카드 지급</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">보관:</span>
                  <span className="spec-value">지급된 카드는 마이페이지에서 소장 가능</span>
                </div>
              </div>
              <div className="performance-badges">
                <div className="badge">
                  <div className="badge-icon"></div>
                  <span>랜덤 카드</span>
                </div>
                <div className="badge">
                  <div className="badge-icon"></div>
                  <span>소장 가능</span>
                </div>
              </div>
            </div>
            <div className="add-button"></div>
          </div>

          <div 
            className="slide" 
            style={{ backgroundImage: "url('/algorithm.png')" }}
          >
            <div className="slide-content">
              <div className="slide-number">바로기부</div>
              <div className="car-brand">04</div>
              <div className="car-name">알고리즘 기준에 따라 자동 추천되는 농장</div>
              <div className="car-subtitle">공정한 기준으로 선택된 농장에 기부해 보세요!</div>
              <div className="car-specs">
                <div className="spec-row">
                  <span className="spec-label">선정 조건:</span>
                  <span className="spec-value">기부금액이 목장 최소 목표 금액 미만</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label"></span>
                  <span className="spec-value">농장 온도가 시작 온도(38.2℃) 이상</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label"></span>
                  <span className="spec-value">최근 추천 횟수 및 마지막 추천 시간 → 일정 기간 제외</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">추천 개수:</span>
                  <span className="spec-value">전체 농장 ≤ 30개 → 3개 추천</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label"></span>
                  <span className="spec-value">전체 농장 ≤ 50개 → 5개 추천</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label"></span>
                  <span className="spec-value">전체 농장 &gt; 50개 → 7개 추천</span>
                </div>
              </div>
              <div className="performance-badges">
                <div className="badge">
                  <div className="badge-icon"></div>
                  <span>공정성 (알고리즘 기반)</span>
                </div>
                <div className="badge">
                  <div className="badge-icon"></div>
                  <span>목표 달성 (최소금액 고려)</span>
                </div>
                <div className="badge">
                  <div className="badge-icon"></div>
                  <span>균형 추천 (횟수·시간 분배)</span>
                </div>
              </div>
            </div>
            <div className="add-button"></div>
          </div>
        </div>

        <button className="navigation-arrows nav-prev">‹</button>
        <button className="navigation-arrows nav-next">›</button>
      </div>
    </>
  );
}
