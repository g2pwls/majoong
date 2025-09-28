'use client';

import { useEffect, useState } from 'react';
import CloudEffect from '@/components/common/CloudEffect';

export default function AboveTheSkyPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트된 후 약간의 지연을 두고 로드 상태를 true로 설정
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D 구름 효과 배경 */}
      <CloudEffect />
      
      {/* 콘텐츠 레이어 */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="text-center text-white z-10 max-w-4xl mx-auto px-4">
          {/* <h1 className="text-6xl md:text-8xl font-bold mb-6 text-shadow-lg">
            Above The Sky
          </h1> */}
          <p className="text-xl md:text-2xl mb-8 text-shadow-md opacity-90">
            이제는 자유롭게 달릴 시간 <br />
            퇴역마의 새로운 시작을 마중합니다
          </p>
        </div>
      </div>

      {/* 추가 장식 요소 */}
      <div className="absolute top-10 left-10 text-white/60 text-sm">
        <p>마우스를 움직여보세요</p>
      </div>
      
      <div className="absolute bottom-10 right-10 text-white/60 text-sm">
        <p>WebGL 3D 렌더링</p>
      </div>

      <style jsx>{`
        .text-shadow-lg {
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        }
        .text-shadow-md {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
