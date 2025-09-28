'use client';

import React from 'react';
import HeroSection from '@/components/ui/HeroSection';

const MainCand2Page: React.FC = () => {
  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", "Roboto", "Helvetica Neue", Arial, sans-serif;
        }
      `}</style>
      
      <HeroSection />
    </>
  );
};

export default MainCand2Page;
