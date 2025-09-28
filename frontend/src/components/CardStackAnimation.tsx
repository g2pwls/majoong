'use client';

import { useEffect } from 'react';

export default function CardStackAnimation() {

  useEffect(() => {
    // GSAP 라이브러리를 동적으로 import
    const initGSAP = async () => {
      const gsapModule = await import('gsap');
      const gsap = gsapModule.default;
      
      // GSAP 라이브러리가 로드되었는지 확인
      if (typeof window !== 'undefined' && gsap) {

      // ***** GSAP Timeline Initialization *****
      const animateCard1 = gsap.timeline({ paused: true });
      const animateCard2 = gsap.timeline({ paused: true });
      const animateCard3 = gsap.timeline({ paused: true });
      const selectCard = gsap.timeline({ paused: true });

      // ***** GSAP TimelineMax Initialization *****
      const animateCurrentCard = gsap.timeline();
      const animateExtraCards = gsap.timeline();

      // ***** SCSS Parameters *****
      const colors = {
        $black: "#111",
        $lightBlack: "#242224",
        $blue: "#1b2f69",
        $lightBlue: "#27408f",
        $white: "#fff",
        $lightWhite: "#dae4ee"
      };
      const balance = {
        $card1: 1000,
        $card2: 250000,
        $card3: 500000,
      };
      const cardPositions = {
        $top: {
          $marginTop: "-320px"
        },
        $behind: {
          $marginTop: "-30px"
        },
        $end: {
          $marginTop: "0px"
        }
      };

      // ***** Animation Parameters Initialization *****
      const rotateAxis = 180;
      const duration = 0.5;

      // ***** Variables Initialization *****
      let extraCardsBackgroundColor: string | null = colors.$lightWhite;
      let bodyBackgroundColor: string | null = colors.$white;

      // ***** Function : updateBalance : Start *****
      const updateBalance = (updatedValue: number) => {
        const counter = { val: 0 };
        const balanceElement = document.getElementById("balance-counter");
        if (!balanceElement) return;

        gsap.to(counter, {
          duration: duration,
          val: updatedValue,
          roundProps: "val",
          onUpdate: function() {
            balanceElement.textContent = counter.val.toString();
          }
        });
      };

      // ***** Function : setAnimationForExtraCards : Start *****
      const setAnimationForExtraCards = () => {
        if (!bodyBackgroundColor || !extraCardsBackgroundColor) return;
        
        // CSS 변수를 사용하여 색상 변경
        const containerElement = document.querySelector(".card-stack-container") as HTMLElement;
        const cardStackElement = document.querySelector(".card-stack") as HTMLElement;
        const extraCards = document.querySelectorAll(".card-1, .card-2, .card-3, .card-4, .card-5, .card-6");
        
        if (containerElement) {
          containerElement.style.backgroundColor = bodyBackgroundColor;
        }
        if (cardStackElement) {
          cardStackElement.style.backgroundColor = extraCardsBackgroundColor;
        }
        extraCards.forEach((card) => {
          if (extraCardsBackgroundColor) {
            (card as HTMLElement).style.backgroundColor = extraCardsBackgroundColor;
          }
        });

        // 기존 애니메이션 클리어
        animateExtraCards.clear();
        
        animateExtraCards
          .to(".card-1", {
            rotateX: rotateAxis,
            duration: duration
          }, 0)
          .set(".card-1", { rotateX: 0 })
          .to(".card-2", {
            rotateX: rotateAxis,
            duration: duration
          }, 0)
          .set(".card-2", { rotateX: 0 })
          .to(".card-3", {
            rotateX: rotateAxis,
            duration: duration
          }, 0)
          .set(".card-3", { rotateX: 0 })
          .to(".card-4", {
            rotateX: rotateAxis,
            duration: duration
          }, 0)
          .set(".card-4", { rotateX: 0 })
          .to(".card-5", {
            rotateX: rotateAxis,
            duration: duration
          }, 0)
          .set(".card-5", { rotateX: 0 })
          .to(".card-6", {
            rotateX: rotateAxis,
            duration: duration
          }, 0)
          .set(".card-6", { rotateX: 0 });
        
        // 애니메이션 즉시 실행
        animateExtraCards.play();
      };

      // ***** Function : setAnimationForCard1 : Start *****
      const setAnimationForCard1 = () => {
        const slide2Element = document.querySelector(".slide-2") as HTMLElement;
        const slide3Element = document.querySelector(".slide-3") as HTMLElement;
        const slide2MarginTop = slide2Element?.style.marginTop || getComputedStyle(slide2Element).marginTop;
        const slide3MarginTop = slide3Element?.style.marginTop || getComputedStyle(slide3Element).marginTop;

        animateCard1
          .to(".slide-1", duration, {
            ease: "back.inOut(1.7)",
            translateY: -200,
            width: 270
          })
          .set(".slide-1", { zIndex: 2 });

        if (slide2MarginTop === cardPositions.$end.$marginTop) {
          animateCard1
            .set(".slide-2", { zIndex: 1 })
            .to(".slide-2", duration/2, { ease: "back.inOut(1.7)", marginTop: -30, width: 240 });
        }
        if (slide3MarginTop === cardPositions.$end.$marginTop) {
          animateCard1
            .set(".slide-3", { zIndex: 1 })
            .to(".slide-3", duration/2, { ease: "back.inOut(1.7)", marginTop: -30, width: 240 });
        }
        animateCard1
          .to(".slide-1", {
            ease: "back",
            translateY: 0,
            marginTop: 0
          })
          .set(".slide-1", { marginTop: 0, zIndex: 3 });
      };

      // ***** Function : setAnimationForCard2 : Start *****
      const setAnimationForCard2 = () => {
        const slide1Element = document.querySelector(".slide-1") as HTMLElement;
        const slide3Element = document.querySelector(".slide-3") as HTMLElement;
        const slide1MarginTop = slide1Element?.style.marginTop || getComputedStyle(slide1Element).marginTop;
        const slide3MarginTop = slide3Element?.style.marginTop || getComputedStyle(slide3Element).marginTop;

        animateCard2
          .to(".slide-2", duration, {
            ease: "back.inOut(1.7)",
            translateY: -200,
            width: 270
          })
          .set(".slide-2", { zIndex: 2 });

        if (slide1MarginTop === cardPositions.$end.$marginTop) {
          animateCard2
            .set(".slide-1", { zIndex: 1 })
            .to(".slide-1", duration/2, { ease: "back.inOut(1.7)", marginTop: -30, width: 240 });
        }
        if (slide3MarginTop === cardPositions.$end.$marginTop) {
          animateCard2
            .set(".slide-3", { zIndex: 1 })
            .to(".slide-3", duration/2, { ease: "back.inOut(1.7)", marginTop: -30, width: 240 });
        }
        animateCard2
          .to(".slide-2", {
            ease: "back",
            translateY: 0,
            marginTop: 0
          })
          .set(".slide-2", { marginTop: 0, zIndex: 3 });
      };

      // ***** Function : setAnimationForCard3 : Start *****
      const setAnimationForCard3 = () => {
        const slide1Element = document.querySelector(".slide-1") as HTMLElement;
        const slide2Element = document.querySelector(".slide-2") as HTMLElement;
        const slide1MarginTop = slide1Element?.style.marginTop || getComputedStyle(slide1Element).marginTop;
        const slide2MarginTop = slide2Element?.style.marginTop || getComputedStyle(slide2Element).marginTop;

        animateCard3
          .to(".slide-3", duration, {
            ease: "back.inOut(1.7)",
            translateY: -200,
            width: 270
          })
          .set(".slide-3", { zIndex: 2 });

        if (slide1MarginTop === cardPositions.$end.$marginTop) {
          animateCard3
            .set(".slide-1", { zIndex: 1 })
            .to(".slide-1", duration/2, { ease: "back.inOut(1.7)", marginTop: -30, width: 240 });
        }
        if (slide2MarginTop === cardPositions.$end.$marginTop) {
          animateCard3
            .set(".slide-2", { zIndex: 1 })
            .to(".slide-2", duration/2, { ease: "back.inOut(1.7)", marginTop: -30, width: 240 });
        }
        animateCard3
          .to(".slide-3", {
            ease: "back",
            translateY: 0,
            marginTop: 0
          })
          .set(".slide-3", { marginTop: 0, zIndex: 3 });
      };

      // ***** Function : setCurrentCardAnimation : Start *****
      const setCurrentCardAnimation = () => {
        const slide1Element = document.querySelector(".slide-1") as HTMLElement;
        const slide2Element = document.querySelector(".slide-2") as HTMLElement;
        const slide3Element = document.querySelector(".slide-3") as HTMLElement;
        const slide1MarginTop = slide1Element?.style.marginTop || getComputedStyle(slide1Element).marginTop;
        const slide2MarginTop = slide2Element?.style.marginTop || getComputedStyle(slide2Element).marginTop;
        const slide3MarginTop = slide3Element?.style.marginTop || getComputedStyle(slide3Element).marginTop;

        if (slide1MarginTop === cardPositions.$behind.$marginTop) {
          animateCurrentCard
            .set(".slide-1", { zIndex: 2 }, 0)
            .to(".slide-1", {
              ease: "back",
              marginTop: 0,
              width: 270
            }, 0);
        }
        if (slide2MarginTop === cardPositions.$behind.$marginTop) {
          animateCurrentCard
            .set(".slide-2", { zIndex: 2 }, 0)
            .to(".slide-2", {
              ease: "back",
              marginTop: 0,
              width: 270
            }, 0);
        }
        if (slide3MarginTop === cardPositions.$behind.$marginTop) {
          animateCurrentCard
            .set(".slide-3", { zIndex: 2 }, 0)
            .to(".slide-3", {
              ease: "back",
              marginTop: 0,
              width: 270
            }, 0);
        }
        if (slide1MarginTop === cardPositions.$top.$marginTop) {
          animateCurrentCard
            .set(".slide-1", { zIndex: 1 }, 0)
            .to(".slide-1", {
              ease: "back",
              marginTop: -30,
              width: 240
            }, 0);
        }
        if (slide2MarginTop === cardPositions.$top.$marginTop) {
          animateCurrentCard
            .set(".slide-2", { zIndex: 1 }, 0)
            .to(".slide-2", {
              ease: "back",
              marginTop: -30,
              width: 240
            }, 0);
        }
        if (slide3MarginTop === cardPositions.$top.$marginTop) {
          animateCurrentCard
            .set(".slide-3", { zIndex: 1 }, 0)
            .to(".slide-3", {
              ease: "back",
              marginTop: -30,
              width: 240
            }, 0);
        }
      };

      // ***** Event Handlers : Start *****
      const slide1Element = document.querySelector(".slide-1");
      const slide2Element = document.querySelector(".slide-2");
      const slide3Element = document.querySelector(".slide-3");

      slide1Element?.addEventListener("click", function(this: HTMLElement) {
        const marginTop = this.style.marginTop || getComputedStyle(this).marginTop;
        if (marginTop === cardPositions.$behind.$marginTop) {
          setAnimationForCard1();
          animateCard1.play();
        }
        if (marginTop === cardPositions.$end.$marginTop) {
          selectCard
            .to(".slide-1", {
              ease: "back",
              translateY: -320
            })
            .set(".slide-1", { translateY: 0, marginTop: -320 })
            .restart();
          const balanceElement = document.querySelector(".balance") as HTMLElement;
          if (balanceElement) balanceElement.style.color = colors.$white;
          const leftMentElement = document.querySelector(".left-ment") as HTMLElement;
          if (leftMentElement) {
            leftMentElement.style.color = "white";
            const h2Element = leftMentElement.querySelector("h2") as HTMLElement;
            const pElement = leftMentElement.querySelector("p") as HTMLElement;
            if (h2Element) h2Element.style.color = "white";
            if (pElement) pElement.style.color = "white";
          }
          updateBalance(balance.$card1);
          setCurrentCardAnimation();
          extraCardsBackgroundColor = colors.$lightBlack;
          bodyBackgroundColor = colors.$black;
          setAnimationForExtraCards();
        }
      });

      slide2Element?.addEventListener("click", function(this: HTMLElement) {
        const marginTop = this.style.marginTop || getComputedStyle(this).marginTop;
        if (marginTop === cardPositions.$behind.$marginTop) {
          setAnimationForCard2();
          animateCard2.play();
        }
        if (marginTop === cardPositions.$end.$marginTop) {
          selectCard
            .to(".slide-2", {
              ease: "back",
              translateY: -320
            })
            .set(".slide-2", { translateY: 0, marginTop: -320 })
            .restart();
          const balanceElement = document.querySelector(".balance") as HTMLElement;
          if (balanceElement) balanceElement.style.color = colors.$black;
          const leftMentElement = document.querySelector(".left-ment") as HTMLElement;
          if (leftMentElement) {
            leftMentElement.style.color = "black";
            const h2Element = leftMentElement.querySelector("h2") as HTMLElement;
            const pElement = leftMentElement.querySelector("p") as HTMLElement;
            if (h2Element) h2Element.style.color = "black";
            if (pElement) pElement.style.color = "black";
          }
          updateBalance(balance.$card2);
          setCurrentCardAnimation();
          extraCardsBackgroundColor = colors.$lightWhite;
          bodyBackgroundColor = colors.$white;
          setAnimationForExtraCards();
        }
      });

      slide3Element?.addEventListener("click", function(this: HTMLElement) {
        const marginTop = this.style.marginTop || getComputedStyle(this).marginTop;
        if (marginTop === cardPositions.$behind.$marginTop) {
          setAnimationForCard3();
          animateCard3.play();
        }
        if (marginTop === cardPositions.$end.$marginTop) {
          selectCard
            .to(".slide-3", {
              ease: "back",
              translateY: -320
            })
            .set(".slide-3", { translateY: 0, marginTop: -320 })
            .restart();
          const balanceElement = document.querySelector(".balance") as HTMLElement;
          if (balanceElement) balanceElement.style.color = colors.$white;
          const leftMentElement = document.querySelector(".left-ment") as HTMLElement;
          if (leftMentElement) {
            leftMentElement.style.color = "white";
            const h2Element = leftMentElement.querySelector("h2") as HTMLElement;
            const pElement = leftMentElement.querySelector("p") as HTMLElement;
            if (h2Element) h2Element.style.color = "white";
            if (pElement) pElement.style.color = "white";
          }
          updateBalance(balance.$card3);
          setCurrentCardAnimation();
          extraCardsBackgroundColor = colors.$lightBlue;
          bodyBackgroundColor = colors.$blue;
          setAnimationForExtraCards();
        }
      });

      // ***** Clearing Timelines : Start *****
      animateExtraCards.eventCallback("onComplete", () => {
        animateExtraCards.clear();
      });
      animateCurrentCard.eventCallback("onComplete", () => {
        animateCurrentCard.clear();
      });
      selectCard.eventCallback("onComplete", () => {
        selectCard.clear();
      });
      animateCard1.eventCallback("onComplete", () => {
        animateCard1.clear();
      });
      animateCard2.eventCallback("onComplete", () => {
        animateCard2.clear();
      });
      animateCard3.eventCallback("onComplete", () => {
        animateCard3.clear();
      });

      // 초기 배경색 적용 (slide-2 상태)
      if (typeof window !== 'undefined') {
        const containerElement = document.querySelector(".card-stack-container") as HTMLElement;
        const cardStackElement = document.querySelector(".card-stack") as HTMLElement;
        const extraCards = document.querySelectorAll(".card-1, .card-2, .card-3, .card-4, .card-5, .card-6");
        const slide2Element = document.querySelector(".slide-2") as HTMLElement;
      
        if (containerElement) {
          containerElement.style.backgroundColor = bodyBackgroundColor;
        }
        if (cardStackElement) {
          cardStackElement.style.backgroundColor = extraCardsBackgroundColor;
        }
        extraCards.forEach((card) => {
          if (extraCardsBackgroundColor) {
            (card as HTMLElement).style.backgroundColor = extraCardsBackgroundColor;
          }
        });
        
        // slide-2를 초기에 위로 올리기
        if (slide2Element) {
          slide2Element.style.marginTop = "-320px";
        }

        // 왼쪽 멘트 애니메이션 (스크롤 기반)
        const leftMentElement = document.querySelector(".left-ment") as HTMLElement;
        if (leftMentElement) {
          // 초기 상태 설정 (2번 카드이므로 검정 글자)
          leftMentElement.style.color = "black";
          const h2Element = leftMentElement.querySelector("h2") as HTMLElement;
          const pElement = leftMentElement.querySelector("p") as HTMLElement;
          if (h2Element) h2Element.style.color = "black";
          if (pElement) pElement.style.color = "black";
          
          // 초기 상태 설정
          gsap.set(leftMentElement, {
            opacity: 0,
            x: -100
          });
          
          // Intersection Observer로 스크롤 감지
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // 화면에 보이면 애니메이션 실행
                gsap.to(leftMentElement, {
                  opacity: 1,
                  x: 0,
                  duration: 1.5,
                  ease: "power3.out"
                });
                // 한 번만 실행되도록 observer 해제
                observer.unobserve(leftMentElement);
              }
            });
          }, {
            threshold: 0.3 // 30% 보이면 실행
          });
          
          observer.observe(leftMentElement);
        }
      }
      }
    };

    initGSAP();
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden flex items-center justify-center relative">
      {/* 왼쪽 멘트 */}
      <div className="left-ment absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
        <h2 className="text-3xl font-bold mb-2 leading-tight text-gray-300">
          원하는 카드로 언제 어디서나 기부하세요
        </h2>
        <p className="text-2xl text-gray-300">
          투명하고 안전한 블록체인 기반 기부
        </p>
      </div>
      <style jsx>{`
        /* ***** Colors - Start ***** */
        :root {
          --black: #111;
          --light-black: #242224;
          --blue: #1b2f69;
          --light-blue: #27408f;
          --white: #fff;
          --light-white: #dae4ee;
        }

        /* ***** Dimensions - Start ***** */
        .card-stack-width { width: 300px; }
        .card-stack-height { height: 550px; }
        .card-width { width: calc(300px - 30px); }
        .card-height { height: 200px; }

        /* ***** Global Styles - Start ***** */
        .card-stack-container * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .card-stack-container {
          background-color: var(--white);
          overflow: hidden;
          width: 100%;
          height: 100vh;
          position: relative;
        }

        .center {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .extra-cards {
          position: absolute;
          width: calc(300px - 30px);
          height: 200px;
          background-color: var(--light-white);
          border-radius: 10px;
        }

        .card {
          width: calc(300px - 30px);
          height: 200px;
          border-radius: 10px;
        }

        /* ***** Specific Styles - Start ***** */
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .card-1 {
          position: absolute;
          width: calc(300px - 30px);
          height: 200px;
          background-color: var(--light-white);
          border-radius: 10px;
          top: 10px;
          left: -150px;
          transform: rotate(-20deg);
        }

        .card-2 {
          position: absolute;
          width: calc(300px - 30px);
          height: 200px;
          background-color: var(--light-white);
          border-radius: 10px;
          top: calc(270px - 20px);
          left: -100px;
          transform: rotate(-20deg);
        }

        .card-3 {
          position: absolute;
          width: calc(300px - 30px);
          height: 200px;
          background-color: var(--light-white);
          border-radius: 10px;
          top: calc(540px - 50px);
          left: -50px;
          transform: rotate(-20deg);
        }

        .card-4 {
          position: absolute;
          width: calc(300px - 30px);
          height: 200px;
          background-color: var(--light-white);
          border-radius: 10px;
          bottom: 10px;
          right: -150px;
          transform: rotate(-20deg);
        }

        .card-5 {
          position: absolute;
          width: calc(300px - 30px);
          height: 200px;
          background-color: var(--light-white);
          border-radius: 10px;
          bottom: calc(270px - 20px);
          right: -100px;
          transform: rotate(-20deg);
        }

        .card-6 {
          position: absolute;
          width: calc(300px - 30px);
          height: 200px;
          background-color: var(--light-white);
          border-radius: 10px;
          bottom: calc(540px - 50px);
          right: -50px;
          transform: rotate(-20deg);
          overflow: hidden;
        }

        .card-stack {
          display: flex;
          justify-content: center;
          width: 300px;
          height: 550px;
          background-color: var(--light-white);
          border-radius: 20px;
          transform: rotate(-20deg);
        }

        .balance {
          position: absolute;
          width: 100%;
          top: 230px;
          left: 40px;
          font-size: 11px;
          color: var(--black);
        }

        .balance span {
          font-size: 18px;
        }

        .swiper-container {
          display: flex;
          width: calc(300px - 30px);
          height: 200px;
          justify-content: center;
          align-self: flex-end !important;
          margin-bottom: 15px !important;
        }

        .slide {
          position: absolute;
          width: calc(300px - 30px);
          height: 200px;
          border-radius: 10px;
          font-size: 18px;
          padding: 30px;
          cursor: pointer;
          outline: none;
        }

        .bank-name {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 12px;
          padding-left: 15px !important;
          padding-right: 15px !important;
          padding-top: 10px !important;
        }

        .bank-name span {
          font-size: 10px;
          color: grey;
        }

        .bank-name img {
          margin: -15px -10px 0 0;
        }

        .slide img {
          margin: 10px 0;
        }

        .card-chip {
          text-align: right;
        }

        .card-chip img {
          margin-left: 10px;
        }

        .card-number {
          font-size: 15px;
          padding-left: 15px !important;
          padding-right: 15px !important;
        }

        .personal-info {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 12px;
          padding-left: 15px !important;
          padding-right: 15px !important;
        }

        .slide-3 {
          width: calc(270px - 30px);
          margin-top: -30px;
          background: rgb(72, 111, 233);
          z-index: 1;
          color: var(--white);
        }

        .slide-3 span {
          color: var(--white);
          opacity: 0.5;
        }

        .slide-2 {
          width: calc(285px - 15px);
          background-color: rgb(255, 255, 255);
          color: var(--black);
          z-index: 3;
        }

        .slide-2 span {
          color: grey;
        }

        .slide-1 {
          margin-top: -320px;
          z-index: 2;
          color: #fff;
          background-color: rgb(0, 0, 0);
        }

        /* ***** Media Queries - Start ***** */
        @media screen and (max-width: 768px) {
          .card-1,
          .card-2,
          .card-3,
          .card-4,
          .card-5,
          .card-6 {
            display: none;
          }
        }
        
        @media screen and (max-width: 1200px) {
          .card-1,
          .card-2,
          .card-3,
          .card-4,
          .card-5,
          .card-6 {
            left: -50px;
            right: -50px;
          }
        }
      `}</style>

      <div className="card-stack-container">
        <div className="extra-cards-stack">
          <div className="card-1"></div>
          <div className="card-2"></div>
          <div className="card-3"></div>
          <div className="card-4"></div>
          <div className="card-5"></div>
          <div className="card-6"></div>
        </div>
        <div className="container">
          <div className="card-stack">
            <div className="balance">
              <p>Balance:</p>
              <span>$ <span id="balance-counter">250000</span></span>
            </div>
            <div className="swiper-container">
              <div className="slide slide-1">
                <div className="bank-name">
                  <p> majoongbank | <span>Universal Bank</span></p>
                  <img src="https://img.icons8.com/bubbles/50/000000/visa.png" alt="Visa" />
                </div>
                <div className="card-chip">
                  <img src="https://img.icons8.com/bubbles/50/000000/sim-card-chip.png" alt="Chip" />
                </div>
                <div className="card-number">4505 7389 6378 5628</div>
                <div className="personal-info">
                  <p>Pack Ji Hyun</p>
                  <p>07/2027</p>
                </div>
              </div>
              <div className="slide slide-2">
                <div className="bank-name">
                  <p> majoongbank | <span>Town Bank</span></p>
                  <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" />
                </div>
                <div className="card-chip">
                  <img src="https://img.icons8.com/nolan/50/sim-card-chip.png" alt="Chip" />
                </div>
                <div className="card-number">4729 7837 9829 7828</div>
                <div className="personal-info">
                  <p>Yun Hye Jin</p>
                  <p>05/2026</p>
                </div>
              </div>
              <div className="slide slide-3">
                <div className="bank-name">
                  <p> majoongbank | <span>Gold Card</span></p>
                  <img src="https://img.icons8.com/bubbles/50/000000/visa.png" alt="Visa" />
                </div>
                <div className="card-chip">
                  <img src="https://img.icons8.com/bubbles/50/000000/sim-card-chip.png" alt="Chip" />
                </div>
                <div className="card-number">4183 9737 1283 0837</div>
                <div className="personal-info">
                  <p>Kin Na Keong</p>
                  <p>05/2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
