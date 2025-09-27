"use client";

import SkyWithCloudsAndStars from '@/components/common/SkyWithCloudsAndStars';

export default function SkyWithCloudsAndStarsPage() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <SkyWithCloudsAndStars />
      
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-shadow-lg">
            Sky with Clouds & Stars
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-shadow-md opacity-90">
            마우스를 움직여보세요
          </p>
        </div>
      </div>
    </div>
  );
}
