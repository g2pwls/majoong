"use client";

import { useState, useEffect } from "react";

interface DonationProgressChartProps {
  monthTotalAmount: number;
  purposeTotalAmount: number;
}

export default function DonationProgressChart({ 
  monthTotalAmount, 
  purposeTotalAmount 
}: DonationProgressChartProps) {
  // 디버깅을 위한 콘솔 로그
  console.log('DonationProgressChart props:', { monthTotalAmount, purposeTotalAmount });
  
  // 진행률 계산 (0-100%)
  const progressPercentage = purposeTotalAmount > 0 
    ? Math.min((monthTotalAmount / purposeTotalAmount) * 100, 100)
    : 0;

  // 애니메이션을 위한 상태
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // 컴포넌트가 마운트되면 애니메이션 시작
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setAnimatedPercentage(progressPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  // 금액 포맷팅 함수
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="bg-white rounded-lg p-4 border">
      {/* 데스크톱 레이아웃 */}
      <div className="hidden sm:block">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">이번 달 모금액</h3>
            <span className="text-gray-700">
              {formatAmount(monthTotalAmount)}원 / {formatAmount(purposeTotalAmount)}원
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {progressPercentage >= 100 ? (
              <span className="text-green-600 font-medium">🎉 목표 달성!</span>
            ) : (
              <span>
                목표까지 {formatAmount(purposeTotalAmount - monthTotalAmount)}원 남음
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 레이아웃 */}
      <div className="sm:hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">이번 달 모금액</h3>
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-700">
            {formatAmount(monthTotalAmount)}원 / {formatAmount(purposeTotalAmount)}원
          </span>
          <div className="text-sm text-gray-600">
            {progressPercentage >= 100 ? (
              <span className="text-green-600 font-medium">🎉 목표 달성!</span>
            ) : (
              <span>
                목표까지 {formatAmount(purposeTotalAmount - monthTotalAmount)}원 남음
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
          <div 
            className={`bg-[#7B6A53] h-full rounded-full transition-all duration-1000 ease-out ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              width: `${animatedPercentage}%`,
              transform: isVisible ? 'translateX(0)' : 'translateX(-100%)'
            }}
          />
        </div>
        <span className="text-gray-600 font-medium transition-all duration-1000 ease-out">
          {Math.round(animatedPercentage)}%
        </span>
      </div>
    </div>
  );
}
