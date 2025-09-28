'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CarShowroomSlider from "@/components/CarShowroomSlider";
import CardAnimation from "@/components/CardAnimation";
import CardStackAnimation from "@/components/CardStackAnimation";

export default function AboutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 로그인 상태 확인 (localStorage 또는 쿠키에서 토큰 확인)
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  const handleStartClick = () => {
    if (isLoggedIn) {
      router.push('/support');
    } else {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Introduction Section */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            마중은 말과 목장을 위한 투명한 후원 플랫폼입니다.
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-1">
            후원자와 목장을 연결하여 퇴역마들의 건강한 삶을 지원하고, 목장의 지속가능한 운영을 돕습니다.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            블록체인 기술을 통해 모든 후원 내역을 투명하게 기록하고, 기부 사용처를 실시간으로 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Car Showroom Slider */}
      <div className="w-full">
        <CarShowroomSlider />
      </div>

      {/* Card Stack Animation */}
      <div className="w-full overflow-hidden">
        <CardStackAnimation />
      </div>

      {/* Card Animation */}
      <div className="w-full">
        <CardAnimation />
      </div>
      
      <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              지금 바로 시작해보세요
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              투명하고 안전한 블록체인 기반 기부로 퇴역마들의 새로운 내일을 함께 만들어주세요.
            </p>
            <div className="cta-button-container">
              <button
                onClick={handleStartClick}
                className="cta-button inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <span className="mr-2"></span>
                {isLoggedIn ? '지금 시작하기' : '로그인하고 시작하기'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cta-button-container {
          position: relative;
          display: inline-block;
        }

        .cta-button {
          position: relative;
          overflow: hidden;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .cta-button:hover::before {
          left: 100%;
        }

        .cta-button:hover {
          animation: pulse 0.6s ease-in-out;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .cta-button-container::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
          border-radius: 50px;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .cta-button-container:hover::after {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
