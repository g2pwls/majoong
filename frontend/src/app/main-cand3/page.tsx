'use client';

import React from 'react';
import Carousel from '@/components/ui/Carousel';

const MainCand3Page: React.FC = () => {
  return (
    <>
      <style jsx global>{`
        body {
          font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", "Roboto", "Helvetica Neue", Arial, sans-serif;
          background: #4D3A2C;
          margin: 0;
          padding: 0;
        }
      `}</style>
      
      <div style={{ height: '100vh', overflow: 'hidden' }}>
        <Carousel useApiData={true} />
      </div>
    </>
  );
};

export default MainCand3Page;
