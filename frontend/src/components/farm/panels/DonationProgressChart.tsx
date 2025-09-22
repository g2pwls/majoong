"use client";

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

  // 금액 포맷팅 함수
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="bg-white rounded-lg p-4 border">
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

      {/* 진행률 바 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
          <div 
            className="bg-red-500 h-full rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-gray-600 font-medium">
          {Math.round(progressPercentage)}%
        </span>
      </div>
    </div>
  );
}
