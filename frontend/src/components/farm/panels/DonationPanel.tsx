// src/components/farm/panels/DonationPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { FarmService } from "@/services/farmService";
import { DonationUsageResponse, MonthlyDonationUsed, ReceiptHistory } from "@/types/farm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Receipt, TrendingUp } from "lucide-react";

// 막대 그래프 컴포넌트
interface BarChartData {
  month: number;
  amount: number;
  year: number;
}

interface BarChartProps {
  data: BarChartData[];
}

function BarChart({ data }: BarChartProps) {
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  
  console.log('BarChart 렌더링:', { data, length: data.length });
  
  // 최대 금액 계산 (최소값을 100000원으로 설정하여 막대가 보이도록 함)
  const maxAmount = data.length > 0 ? Math.max(...data.map(item => item.amount), 100000) : 100000;
  
  console.log('막대 그래프 계산:', { maxAmount, data });

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-64 gap-1 bg-gray-50 p-4 rounded-lg">
        {monthNames.map((monthName, index) => {
          const monthData = data.find(item => item.month === index + 1);
          const amount = monthData?.amount || 0;
          
          // 높이를 픽셀 단위로 계산 (최소 4px, 최대 200px - 패딩 고려)
          // h-64(256px) - p-4(32px) = 224px, 여유를 두고 200px로 설정
          const heightPx = amount > 0 ? Math.max(4, (amount / maxAmount) * 200) : 4;
          
          console.log(`월 ${index + 1}:`, { monthData, amount, heightPx, maxAmount });
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <div className="relative w-full">
                <div
                  className={`rounded-t transition-colors cursor-pointer w-full ${
                    amount > 0 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  style={{ 
                    height: `${heightPx}px`, 
                    width: '100%'
                  }}
                />
                {amount > 0 && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {amount.toLocaleString()}원
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-2">{monthName}</span>
            </div>
          );
        })}
      </div>
      
      {/* 데이터가 없을 때 안내 메시지 */}
      {data.length === 0 && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">데이터를 불러오는 중입니다...</p>
        </div>
      )}
      
      {/* 디버깅 정보 */}
      <div className="mt-2 text-xs text-gray-400">
        <p>데이터 개수: {data.length}, 최대 금액: {maxAmount.toLocaleString()}원</p>
        <p>막대 높이 범위: 4px ~ 200px (컨테이너: 256px, 패딩: 32px)</p>
      </div>
    </div>
  );
}

// 원형 그래프 컴포넌트
interface PieChartData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  totalAmount: number;
}

function PieChart({ data, totalAmount }: PieChartProps) {
  if (data.length === 0) return null;

  let cumulativePercentage = 0;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {data.map((item, index) => {
            const startAngle = cumulativePercentage * 3.6; // 3.6 degrees per 1%
            const endAngle = (cumulativePercentage + item.percentage) * 3.6;
            const largeArcFlag = item.percentage > 50 ? 1 : 0;
            
            const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);

            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            cumulativePercentage += item.percentage;

            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="0.5"
                className="hover:opacity-80 transition-opacity"
              />
            );
          })}
        </svg>
        
        {/* 중앙에 총액 표시 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-gray-500">총 사용액</p>
            <p className="text-lg font-bold text-gray-900">
              {totalAmount.toLocaleString()}원
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DonationPanelProps {
  farmId: string;
}

export default function DonationPanel({ farmId }: DonationPanelProps) {
  const [donationData, setDonationData] = useState<DonationUsageResponse | null>(null);
  const [yearlyData, setYearlyData] = useState<MonthlyDonationUsed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  
  // 전달 계산
  const getPreviousMonth = () => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return {
      year: prevMonth.getFullYear(),
      month: prevMonth.getMonth() + 1
    };
  };
  
  const previousMonth = getPreviousMonth();

  // 기부금 사용 내역 조회
  const fetchDonationUsage = async (year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('기부금 사용 내역 조회 시작:', { farmId, year, month });
      const data = await FarmService.getDonationUsage(farmId, year, month);
      console.log('기부금 사용 내역 조회 성공:', data);
      setDonationData(data);
    } catch (e: unknown) {
      console.error('기부금 사용 내역 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "기부금 사용 내역을 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 연간 기부금 사용 내역 조회 (막대 그래프용)
  const fetchYearlyData = async (year: number) => {
    try {
      console.log('연간 기부금 사용 내역 조회 시작:', { farmId, year });
      const monthlyData: MonthlyDonationUsed[] = [];
      
      // 1월부터 12월까지 각 달의 데이터를 가져옴
      for (let month = 1; month <= 12; month++) {
        try {
          const data = await FarmService.getDonationUsage(farmId, year, month);
          if (data.monthlyDonationUsed && data.monthlyDonationUsed.length > 0) {
            monthlyData.push(...data.monthlyDonationUsed);
          }
        } catch (error) {
          console.warn(`${year}년 ${month}월 데이터 조회 실패:`, error);
          // 해당 월 데이터가 없어도 계속 진행
        }
      }
      
      // API 데이터가 없으면 더미 데이터 사용
      if (monthlyData.length === 0) {
        console.log('API 데이터가 없어서 더미 데이터 사용');
        const dummyData: MonthlyDonationUsed[] = [
          { year: year, month: 1, amountSpent: 150000 },
          { year: year, month: 2, amountSpent: 200000 },
          { year: year, month: 3, amountSpent: 180000 },
          { year: year, month: 4, amountSpent: 220000 },
          { year: year, month: 5, amountSpent: 190000 },
          { year: year, month: 6, amountSpent: 250000 },
          { year: year, month: 7, amountSpent: 300000 },
          { year: year, month: 8, amountSpent: 280000 },
          { year: year, month: 9, amountSpent: 320000 },
          { year: year, month: 10, amountSpent: 270000 },
          { year: year, month: 11, amountSpent: 240000 },
          { year: year, month: 12, amountSpent: 350000 },
        ];
        setYearlyData(dummyData);
        console.log('더미 데이터 설정 완료:', dummyData);
      } else {
        setYearlyData(monthlyData);
        console.log('연간 기부금 사용 내역 조회 완료:', monthlyData);
      }
    } catch (e: unknown) {
      console.error('연간 기부금 사용 내역 조회 실패:', e);
      // 에러가 발생해도 더미 데이터 사용
      const dummyData: MonthlyDonationUsed[] = [
        { year: year, month: 1, amountSpent: 150000 },
        { year: year, month: 2, amountSpent: 200000 },
        { year: year, month: 3, amountSpent: 180000 },
        { year: year, month: 4, amountSpent: 220000 },
        { year: year, month: 5, amountSpent: 190000 },
        { year: year, month: 6, amountSpent: 250000 },
        { year: year, month: 7, amountSpent: 300000 },
        { year: year, month: 8, amountSpent: 280000 },
        { year: year, month: 9, amountSpent: 320000 },
        { year: year, month: 10, amountSpent: 270000 },
        { year: year, month: 11, amountSpent: 240000 },
        { year: year, month: 12, amountSpent: 350000 },
      ];
      setYearlyData(dummyData);
      console.log('에러 발생으로 더미 데이터 사용:', dummyData);
    }
  };

  // 전달 기부금 사용 내역 조회 (원형 그래프용)
  const fetchPreviousMonthData = async () => {
    try {
      console.log('전달 기부금 사용 내역 조회 시작:', { farmId, year: previousMonth.year, month: previousMonth.month });
      const data = await FarmService.getDonationUsage(farmId, previousMonth.year, previousMonth.month);
      console.log('전달 기부금 사용 내역 조회 성공:', data);
      setDonationData(data);
    } catch (e: unknown) {
      console.error('전달 기부금 사용 내역 조회 실패:', e);
      // 에러를 throw하지 않고 null로 설정
      setDonationData(null);
    }
  };

  useEffect(() => {
    // 초기 로드 시 연간 데이터와 전달 데이터를 가져옴
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      // 연간 데이터 조회
      await fetchYearlyData(selectedYear);
      
      // 전달 데이터 조회 (원형 그래프용)
      await fetchPreviousMonthData();
      
      setLoading(false);
    };

    initializeData();
  }, [farmId, selectedYear]);

  useEffect(() => {
    // 선택된 달이 변경될 때만 해당 달의 상세 데이터를 가져옴
    if (selectedYear !== currentYear || selectedMonth !== currentMonth) {
      fetchDonationUsage(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
  };

  // 연간 데이터를 막대 그래프용으로 변환
  const getBarChartData = (): BarChartData[] => {
    console.log('막대 그래프 데이터 변환:', { yearlyData, length: yearlyData.length });
    
    // yearlyData가 비어있으면 더미 데이터 사용
    if (yearlyData.length === 0) {
      console.log('yearlyData가 비어있어서 더미 데이터 사용');
      return Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        amount: Math.floor(Math.random() * 300000) + 100000, // 10만원~40만원 랜덤
        year: selectedYear,
      }));
    }

    // 월별로 그룹화하고 금액 합계 계산
    const monthlyMap = new Map<number, number>();
    yearlyData.forEach(usage => {
      const currentAmount = monthlyMap.get(usage.month) || 0;
      monthlyMap.set(usage.month, currentAmount + usage.amountSpent);
    });

    console.log('월별 그룹화 결과:', Object.fromEntries(monthlyMap));

    // BarChartData 배열로 변환 (1월부터 12월까지)
    const barData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      amount: monthlyMap.get(index + 1) || 0,
      year: selectedYear,
    }));
    
    console.log('막대 그래프 최종 데이터:', barData);
    return barData;
  };

  // 영수증 데이터를 원형 그래프용으로 변환
  const getPieChartData = (): PieChartData[] => {
    if (!donationData?.receiptHistory || donationData.receiptHistory.length === 0) {
      return [];
    }

    // 카테고리별로 그룹화하고 금액 합계 계산
    const categoryMap = new Map<string, number>();
    donationData.receiptHistory.forEach(receipt => {
      const currentAmount = categoryMap.get(receipt.category) || 0;
      categoryMap.set(receipt.category, currentAmount + receipt.totalAmount);
    });

    // 총 금액 계산
    const totalAmount = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);

    // 색상 팔레트
    const colors = [
      '#abc9faff', // blue-500
      '#83d5baff', // emerald-500
      '#f1c26fff', // amber-500
      '#ddacacff', // red-500
      '#d2c4f4ff', // violet-500
      '#b5d4d9ff', // cyan-500
      '#cfeba7ff', // lime-500
      '#e8bea0ff', // orange-500
    ];

    // PieChartData 배열로 변환
    return Array.from(categoryMap.entries()).map(([category, amount], index) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      color: colors[index % colors.length],
    })).sort((a, b) => b.amount - a.amount); // 금액 순으로 정렬
  };

  if (loading) {
    return (
      <section id="panel-donations" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            기부금 사용 내역
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">기부금 사용 내역을 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="panel-donations" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            기부금 사용 내역
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => fetchDonationUsage(selectedYear, selectedMonth)}
            variant="outline"
          >
            다시 시도
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="panel-donations" className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          기부금 사용 내역
        </h3>
      </div>

      {/* 1. 연간 막대 그래프 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold">월별 기부금 사용액 ({selectedYear}년)</h4>
          </div>
          
          <BarChart data={getBarChartData()} />
        </CardContent>
      </Card>

      {/* 2. 전달 원형 그래프 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h4 className="text-lg font-semibold">{previousMonth.year}년 {previousMonth.month}월 기부금 사용 비율</h4>
          </div>
          
          {donationData?.receiptHistory && donationData.receiptHistory.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* 원형 그래프 */}
              <div className="flex-shrink-0">
                <PieChart 
                  data={getPieChartData()} 
                  totalAmount={getPieChartData().reduce((sum, item) => sum + item.amount, 0)}
                />
              </div>
              
              {/* 범례 */}
              <div className="flex-1 w-full">
                <h5 className="text-md font-semibold mb-4 text-gray-700">카테고리별 사용 비율</h5>
                <div className="space-y-3">
                  {getPieChartData().map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.amount.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">전달의 기부금 사용 내역이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. 날짜 선택 가능한 상세 내역 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-semibold">기부금 사용 상세 내역</h4>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
                <option value={2022}>2022</option>
                <option value={2021}>2021</option>
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value={1}>1월</option>
                <option value={2}>2월</option>
                <option value={3}>3월</option>
                <option value={4}>4월</option>
                <option value={5}>5월</option>
                <option value={6}>6월</option>
                <option value={7}>7월</option>
                <option value={8}>8월</option>
                <option value={9}>9월</option>
                <option value={10}>10월</option>
                <option value={11}>11월</option>
                <option value={12}>12월</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">상세 내역을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={() => fetchDonationUsage(selectedYear, selectedMonth)}
                variant="outline"
              >
                다시 시도
              </Button>
            </div>
          ) : donationData?.receiptHistory && donationData.receiptHistory.length > 0 ? (
            <div className="space-y-3">
              {donationData.receiptHistory.map((receipt) => (
                <div key={receipt.recieptHistoryId} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {receipt.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(receipt.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        영수증 ID: {receipt.recieptHistoryId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {receipt.totalAmount.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">선택한 기간의 기부금 사용 내역이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
