"use client";

import Link from "next/link";

export default function IntroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 구름 애니메이션 배경 */}
      <div className="clouds">
        <div className="clouds-1"></div>
        <div className="clouds-3"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            마중
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            카카오톡으로 간편하게 시작하세요
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            로그인하기
          </Link>
          
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            둘러보기
          </Link>
          
          <p className="text-sm text-gray-500">
            서비스 이용을 위해 로그인이 필요합니다
          </p>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css?family=Oswald');

        /* Animation & keyframes */
        @keyframes clouds-loop-1 {
          to { background-position: -1000px 0; }
        }

        @keyframes clouds-loop-3 {
          to { background-position: -1579px 0; }
        }

        /* 하늘색 그라데이션 배경 */
        .min-h-screen {
          background: linear-gradient(#8FD9FB, #82C8E5);
        }

        .clouds {
          opacity: 0.9;
          pointer-events: none;
          position: absolute;
          overflow: hidden;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
        }  
          
        .clouds-1,
        .clouds-3 {
          background-repeat: repeat-x;
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 500px;
        }

        .clouds-1 {
          background-image: url('https://s.cdpn.io/15514/clouds_2.png');
          animation: clouds-loop-1 20s infinite linear;
        }

        .clouds-3 {
          background-image: url('https://s.cdpn.io/15514/clouds_3.png');
          animation: clouds-loop-3 17s infinite linear;
        }
      `}</style>
    </div>
  );
}
