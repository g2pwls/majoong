'use client';

import React from 'react';
import Carousel from '@/components/ui/Carousel';

const MainCand1Page: React.FC = () => {

  return (
    <>
      <style jsx global>{`
        body {
          font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", "Roboto", "Helvetica Neue", Arial, sans-serif;
          background: #4D3A2C;
          margin: 0;
          padding: 0;
        }
        
        .layout {
          position: absolute;
          z-index: 0;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .layout::before {
          content: '';
          position: absolute;
          z-index: 1;
          top: 0;
          left: 90px;
          width: 10px;
          height: 100%;
          border: 1px solid #fff;
          border-top: none;
          border-bottom: none;
          opacity: 0.15;
        }

        .box {
          position: absolute;
          bottom: 0;
          left: 30px;
          color: #fff;
          transform-origin: 0% 10%;
          transform: rotate(-90deg);
          font-size: 9px;
          line-height: 1.4;
          text-transform: uppercase;
          opacity: 0.4;
        }


        .cursor {
          position: fixed;
          z-index: 10;
          top: 0;
          left: 0;
          --size: 40px;
          width: var(--size);
          height: var(--size);
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin: calc(var(--size) * -0.5) 0 0 calc(var(--size) * -0.5);
          transition: transform 0.85s cubic-bezier(0, 0.02, 0, 1);
          display: none;
          pointer-events: none;
        }

        .cursor2 {
          --size: 2px;
          transition-duration: 0.7s;
        }

        @media (pointer: fine) {
          .cursor {
            display: block;
          }
        }
      `}</style>
      
      <div className="layout">
        {/* <div className="box">
          High-end, full-service<br />
          visual content creation<br />
          for lifestyle branding.
        </div> */}
      </div>

      <div className="cursor"></div>
      <div className="cursor cursor2"></div>

      {/* API 데이터를 사용하는 캐러셀 */}
      <Carousel useApiData={true} />
    </>
  );
};

export default MainCand1Page;
