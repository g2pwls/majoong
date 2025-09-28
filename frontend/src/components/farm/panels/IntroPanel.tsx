"use client";

import { useEffect, useState, useCallback } from "react";
import HorseRegistrySection from "@/components/farm/edit/HorseRegistrySection";
import TrustScoreChart from "./TrustScoreChart";
import DonationProgressChart from "./DonationProgressChart";
import DonationUsageChart, { DonationUsageItem } from "./DonationUsageChart";
import { MonthlyBarChart } from "./DonationUsageChart";
import { Farm } from "@/types/farm";
import { FarmService } from "@/services/farmService";
import { ScoreHistory, DonationUsageResponse, MonthlyDonationUsed, ReceiptHistory } from "@/types/farm";

export default function IntroPanel({ farm, isMyFarm = false }: { farm: Farm; isMyFarm?: boolean }) {
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  
  // 기부금 사용 내역 관련 상태
  const [yearlyData, setYearlyData] = useState<MonthlyDonationUsed[]>([]);
  const [allYearData, setAllYearData] = useState<DonationUsageResponse | null>(null);
  const [loadingDonationData, setLoadingDonationData] = useState(true);
  const [donationError, setDonationError] = useState<string | null>(null);

  // 디버깅을 위한 콘솔 로그
  console.log('IntroPanel farm data:', farm);

  // 신뢰도 내역 조회 (현재 년도)
  const fetchScoreHistory = useCallback(async () => {
    if (!farm?.id) return;
    
    const currentYear = new Date().getFullYear();
    
    try {
      console.log('신뢰도 내역 조회 시작:', { farmUuid: farm.farmUuid, year: currentYear });
      const response = await FarmService.getScoreHistory(farm.farmUuid, currentYear);
      console.log('신뢰도 내역 조회 성공:', response);
      setScoreHistory(response.result);
    } catch (e: unknown) {
      console.error('신뢰도 내역 조회 실패:', e);
    }
  }, [farm?.id, farm.farmUuid]);

  // 연간 기부금 사용 내역 조회 (막대 그래프용)
  const fetchYearlyDonationData = useCallback(async () => {
    if (!farm?.farmUuid) return;
    
    try {
      setLoadingDonationData(true);
      setDonationError(null);
      
      const currentYear = new Date().getFullYear();
      console.log('연간 기부금 사용 내역 조회 시작:', { farmUuid: farm.farmUuid, year: currentYear });
      
      const allMonthlyData: MonthlyDonationUsed[] = [];
      
      // 1월부터 12월까지 각 달의 데이터를 가져옴
      for (let month = 1; month <= 12; month++) {
        try {
          console.log(`${currentYear}년 ${month}월 데이터 조회 중...`);
          const data = await FarmService.getDonationUsage(farm.farmUuid, currentYear, month);
          console.log(`${currentYear}년 ${month}월 API 응답:`, data);
          
          if (data.monthlyDonationUsed && data.monthlyDonationUsed.length > 0) {
            console.log(`${currentYear}년 ${month}월 데이터 추가:`, data.monthlyDonationUsed);
            allMonthlyData.push(...data.monthlyDonationUsed);
          } else {
            console.log(`${currentYear}년 ${month}월 데이터 없음`);
          }
        } catch (error) {
          console.warn(`${currentYear}년 ${month}월 데이터 조회 실패:`, error);
          // 해당 월 데이터가 없어도 계속 진행
        }
      }
      
      console.log('연간 데이터 수집 완료:', { 
        totalMonths: allMonthlyData.length, 
        data: allMonthlyData 
      });
      
      setYearlyData(allMonthlyData);
      
      // 전체 년도 데이터도 수집 (원형 그래프용)
      const allReceipts: ReceiptHistory[] = [];
      for (let month = 1; month <= 12; month++) {
        try {
          const data = await FarmService.getDonationUsage(farm.farmUuid, currentYear, month);
          if (data.receiptHistory && data.receiptHistory.length > 0) {
            allReceipts.push(...data.receiptHistory);
          }
        } catch (error) {
          console.warn(`${currentYear}년 ${month}월 영수증 데이터 조회 실패:`, error);
        }
      }
      
      setAllYearData({
        monthlyDonationUsed: allMonthlyData,
        receiptHistory: allReceipts
      });
      
    } catch (e: unknown) {
      console.error('연간 기부금 사용 내역 조회 실패:', e);
      setDonationError('기부금 사용 내역을 불러오는 중 오류가 발생했어요.');
      setYearlyData([]);
    } finally {
      setLoadingDonationData(false);
    }
  }, [farm?.farmUuid]);

  // 연간 데이터를 막대 그래프용으로 변환
  const getBarChartData = () => {
    console.log('막대 그래프 데이터 변환 시작:', { 
      yearlyData, 
      length: yearlyData.length
    });
    
    // yearlyData가 비어있으면 빈 배열 반환
    if (!yearlyData || yearlyData.length === 0) {
      console.log('yearlyData가 비어있음, 빈 막대그래프 데이터 반환');
      return [];
    }
    
    // 월별로 그룹화 (누적하지 않고 마지막 값만 사용)
    const monthlyMap = new Map<number, number>();
    yearlyData.forEach(usage => {
      console.log('월별 데이터 처리:', { month: usage.month, amountSpent: usage.amountSpent });
      monthlyMap.set(usage.month, usage.amountSpent);
    });

    console.log('월별 그룹화 결과:', Object.fromEntries(monthlyMap));

    // BarChartData 배열로 변환 (1월부터 12월까지, 데이터가 없으면 0)
    const barData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      amount: monthlyMap.get(index + 1) || 0,
      year: new Date().getFullYear(),
    }));
    
    console.log('막대 그래프 최종 데이터:', barData);
    return barData;
  };

  // 전체 기부금 사용 내역을 차트용으로 변환
  const getAllDonationUsageData = (): DonationUsageItem[] => {
    if (allYearData?.receiptHistory && allYearData.receiptHistory.length > 0) {
      // 카테고리별로 그룹화하고 금액 합계 및 건수 계산
      const categoryMap = new Map<string, { amount: number; count: number }>();
      allYearData.receiptHistory.forEach(receipt => {
        const current = categoryMap.get(receipt.category) || { amount: 0, count: 0 };
        categoryMap.set(receipt.category, {
          amount: current.amount + receipt.totalAmount,
          count: current.count + 1
        });
      });

      // 총 금액 계산
      const totalAmount = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.amount, 0);

      // 색상 팔레트 (브라운 계열)
      const colors = [
        '#4D3A2C', // 다크 브라운
        '#7B6A53', // 미디엄 브라운
        '#91745A', // 라이트 브라운
        '#D3CAB8', // 연한 브라운
        '#D5BFA8', // 크림 브라운
        '#837A5E', // 올리브 브라운
      ];

      // DonationUsageItem 배열로 변환
      return Array.from(categoryMap.entries()).map(([category, data], index) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        color: colors[index % colors.length],
      })).sort((a, b) => b.amount - a.amount); // 금액 순으로 정렬
    }

    // 실제 데이터가 없으면 빈 배열 반환
    return [];
  };

  useEffect(() => {
    // 신뢰도 데이터 가져오기
    fetchScoreHistory();
    // 기부금 사용 내역 데이터 가져오기
    fetchYearlyDonationData();
  }, [fetchScoreHistory, fetchYearlyDonationData]);

  return (
    <section id="panel-intro" className="flex flex-col">
      
      {/* 목장 소개 섹션 */}
      {farm?.description && (
        <div className="mb-2">
          <div className="bg-gray-50 rounded-lg px-4 py-2 border">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {farm.description}
            </p>
          </div>
        </div>
      )}

      {/* 기부 모금 진행률 차트 */}
      <div className="mb-2">
        <DonationProgressChart 
          monthTotalAmount={farm?.month_total_amount || 0}
          purposeTotalAmount={farm?.purpose_total_amount || 0}
        />
      </div>

      {/* 신뢰도 평균 변화 표 */}
      <div className="mb-4">
        <TrustScoreChart 
          scoreHistory={scoreHistory}
          selectedYear={new Date().getFullYear()}
          currentScore={farm?.total_score || 0}
          createdAt={farm?.created_at}
        />
      </div>

      {/* 월별 기부금 사용액 막대 그래프 */}
      <div className="mb-4">
        <MonthlyBarChart 
          data={getBarChartData()} 
          title={`월별 기부금 사용액 (${new Date().getFullYear()}년)`}
        />
      </div>

      {/* 기부금 사용 비율 원형 그래프 */}
      <div className="mb-4">
        <DonationUsageChart 
          data={loadingDonationData ? [] : getAllDonationUsageData()}
          totalAmount={loadingDonationData ? 0 : getAllDonationUsageData().reduce((sum, item) => sum + item.amount, 0)}
          title={`기부금 사용 비율 (${new Date().getFullYear()}년 전체)`}
          isLoading={loadingDonationData}
          loadingMessage="기부금 사용 비율을 불러오는 중..."
        />
      </div>

      <div className="flex flex-col">
        {/* Horse registry section */}
        <HorseRegistrySection 
          farmUuid={farm?.farmUuid || ""} 
          onHorseRegistered={0}
          isMyFarm={isMyFarm}
        />
      </div>
    </section>
  );
}

