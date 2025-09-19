// src/components/farm/panels/DonationPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { FarmService } from "@/services/farmService";
import { DonationUsageResponse, MonthlyDonationUsed, ReceiptHistory, ReceiptDetail } from "@/types/farm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Receipt, Eye, ChevronDown, ChevronUp } from "lucide-react";
import DonationUsageChart, { DonationUsageItem } from "./DonationUsageChart";
import { MonthlyBarChart } from "./DonationUsageChart";

// 막대 그래프 데이터 타입
interface BarChartData {
  month: number;
  amount: number;
  year: number;
}

interface DonationPanelProps {
  farmId: string;
}

export default function DonationPanel({ farmId }: DonationPanelProps) {
  const [donationData, setDonationData] = useState<DonationUsageResponse | null>(null);
  const [selectedMonthData, setSelectedMonthData] = useState<DonationUsageResponse | null>(null);
  const [yearlyData, setYearlyData] = useState<MonthlyDonationUsed[]>([]);
  const [allYearData, setAllYearData] = useState<DonationUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [currentYear] = useState(new Date().getFullYear());
  const [currentMonth] = useState(new Date().getMonth() + 1);
  
  // 상세 조회를 위한 상태
  const [expandedReceipts, setExpandedReceipts] = useState<Set<number>>(new Set());
  const [receiptDetails, setReceiptDetails] = useState<Map<number, ReceiptDetail>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // 데이터 캐싱을 위한 상태
  const [dataCache, setDataCache] = useState<Map<string, DonationUsageResponse>>(new Map());
  const [yearlyCache, setYearlyCache] = useState<Map<number, MonthlyDonationUsed[]>>(new Map());
  
  // 로딩 상태를 세분화
  const [loadingStates, setLoadingStates] = useState({
    yearly: false,
    monthly: false,
    details: false
  });
  
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

  // 기부금 사용 내역 조회 (선택된 월용) - 캐싱 적용
  const fetchDonationUsage = async (year: number, month: number | 'all') => {
    const cacheKey = month === 'all' ? `${year}-all` : `${year}-${month}`;
    
    // 캐시에서 먼저 확인
    if (dataCache.has(cacheKey)) {
      console.log('캐시에서 데이터 로드:', cacheKey);
      const cachedData = dataCache.get(cacheKey)!;
      setSelectedMonthData(cachedData);
      if (month === 'all') {
        setAllYearData(cachedData);
      }
      return;
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, monthly: true }));
      setError(null);
      
      console.log('기부금 사용 내역 조회 시작:', { farmId, year, month });
      
      let data: DonationUsageResponse;
      if (month === 'all') {
        // 전체 년도 조회 - 모든 월의 데이터를 수집
        console.log('전체 년도 데이터 수집 시작:', year);
        const allReceipts: ReceiptHistory[] = [];
        const allMonthlyData: MonthlyDonationUsed[] = [];
        
        // 1월부터 12월까지 각 달의 데이터를 가져옴
        for (let m = 1; m <= 12; m++) {
          try {
            console.log(`${year}년 ${m}월 데이터 조회 중...`);
            const monthData = await FarmService.getDonationUsage(farmId, year, m);
            
            if (monthData.receiptHistory && monthData.receiptHistory.length > 0) {
              console.log(`${year}년 ${m}월 영수증 ${monthData.receiptHistory.length}개 추가`);
              allReceipts.push(...monthData.receiptHistory);
            }
            
            if (monthData.monthlyDonationUsed && monthData.monthlyDonationUsed.length > 0) {
              allMonthlyData.push(...monthData.monthlyDonationUsed);
            }
          } catch (error) {
            console.warn(`${year}년 ${m}월 데이터 조회 실패:`, error);
            // 해당 월 데이터가 없어도 계속 진행
          }
        }
        
        // 전체 데이터 구성
        data = {
          monthlyDonationUsed: allMonthlyData,
          receiptHistory: allReceipts
        };
        
        console.log('전체 년도 데이터 수집 완료:', {
          totalReceipts: allReceipts.length,
          totalMonthlyData: allMonthlyData.length
        });
        
        setAllYearData(data);
      } else {
        // 특정 월 조회
        data = await FarmService.getDonationUsage(farmId, year, month);
      }
      
      console.log('기부금 사용 내역 조회 성공:', data);
      
      // 캐시에 저장
      setDataCache(prev => new Map(prev).set(cacheKey, data));
      setSelectedMonthData(data);
    } catch (e: unknown) {
      console.error('기부금 사용 내역 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "기부금 사용 내역을 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, monthly: false }));
    }
  };

  // 연간 기부금 사용 내역 조회 (막대 그래프용) - 캐싱 적용
  const fetchYearlyData = async (year: number) => {
    // 캐시에서 먼저 확인
    if (yearlyCache.has(year)) {
      console.log('연간 데이터 캐시에서 로드:', year);
      setYearlyData(yearlyCache.get(year)!);
      return;
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, yearly: true }));
      console.log('연간 기부금 사용 내역 조회 시작:', { farmId, year });
      const monthlyData: MonthlyDonationUsed[] = [];
      
      // 1월부터 12월까지 각 달의 데이터를 가져옴
      for (let month = 1; month <= 12; month++) {
        try {
          console.log(`${year}년 ${month}월 데이터 조회 중...`);
          const data = await FarmService.getDonationUsage(farmId, year, month);
          console.log(`${year}년 ${month}월 API 응답:`, data);
          
          if (data.monthlyDonationUsed && data.monthlyDonationUsed.length > 0) {
            console.log(`${year}년 ${month}월 데이터 추가:`, data.monthlyDonationUsed);
            monthlyData.push(...data.monthlyDonationUsed);
          } else {
            console.log(`${year}년 ${month}월 데이터 없음`);
          }
        } catch (error) {
          console.warn(`${year}년 ${month}월 데이터 조회 실패:`, error);
          // 해당 월 데이터가 없어도 계속 진행
        }
      }
      
      console.log('연간 데이터 수집 완료:', { 
        totalMonths: monthlyData.length, 
        data: monthlyData 
      });
      
      // 캐시에 저장
      setYearlyCache(prev => new Map(prev).set(year, monthlyData));
      setYearlyData(monthlyData);
      console.log('연간 기부금 사용 내역 조회 완료:', monthlyData);
    } catch (e: unknown) {
      console.error('연간 기부금 사용 내역 조회 실패:', e);
      setYearlyData([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, yearly: false }));
    }
  };

  // 전달 기부금 사용 내역 조회 (원형 그래프용) - 캐싱 적용
  const fetchPreviousMonthData = async () => {
    const cacheKey = `${previousMonth.year}-${previousMonth.month}`;
    
    // 캐시에서 먼저 확인
    if (dataCache.has(cacheKey)) {
      console.log('전달 데이터 캐시에서 로드:', cacheKey);
      setDonationData(dataCache.get(cacheKey)!);
      return;
    }
    
    try {
      console.log('전달 기부금 사용 내역 조회 시작:', { farmId, year: previousMonth.year, month: previousMonth.month });
      const data = await FarmService.getDonationUsage(farmId, previousMonth.year, previousMonth.month);
      console.log('전달 기부금 사용 내역 조회 성공:', data);
      
      // 캐시에 저장
      setDataCache(prev => new Map(prev).set(cacheKey, data));
      setDonationData(data);
    } catch (e: unknown) {
      console.error('전달 기부금 사용 내역 조회 실패:', e);
      // 에러를 throw하지 않고 null로 설정
      setDonationData(null);
    }
  };


  useEffect(() => {
    // 초기 로드 시 필요한 데이터만 가져옴
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      // 항상 연간 데이터를 먼저 가져옴 (막대그래프용)
      await fetchYearlyData(selectedYear);
      
      // 전체 선택이면 연간 데이터 조회, 아니면 기존 로직
      if (selectedMonth === 'all') {
        // 전체 선택 시 연간 데이터 조회
        await fetchDonationUsage(selectedYear, 'all');
      } else {
        // 특정 월 선택 시 해당 월 데이터 조회
        await Promise.all([
          fetchPreviousMonthData(),
          fetchDonationUsage(selectedYear, selectedMonth)
        ]);
      }
      
      setLoading(false);
    };

    initializeData();
  }, [farmId, selectedYear, selectedMonth]);


  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setCurrentPage(1); // 페이지 리셋
  };

  const handleMonthChange = (month: number | 'all') => {
    setSelectedMonth(month);
    setCurrentPage(1); // 페이지 리셋
  };

  // 기부금 사용 내역 상세 조회
  const fetchReceiptDetail = async (usageId: number) => {
    try {
      setLoadingDetails(prev => new Set(prev).add(usageId));
      
      console.log('기부금 사용 내역 상세 조회 시작:', { farmId, usageId });
      const response = await FarmService.getReceiptDetail(farmId, usageId);
      console.log('기부금 사용 내역 상세 조회 성공:', response);
      
      setReceiptDetails(prev => new Map(prev).set(usageId, response.result));
    } catch (e: unknown) {
      console.error('기부금 사용 내역 상세 조회 실패:', e);
      // 에러가 발생해도 상세 정보는 표시하지 않음
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(usageId);
        return newSet;
      });
    }
  };

  // 기부금 사용 내역 카드 클릭 핸들러
  const handleReceiptClick = (usageId: number) => {
    const isExpanded = expandedReceipts.has(usageId);
    
    if (isExpanded) {
      // 접기
      setExpandedReceipts(prev => {
        const newSet = new Set(prev);
        newSet.delete(usageId);
        return newSet;
      });
    } else {
      // 펼치기
      setExpandedReceipts(prev => new Set(prev).add(usageId));
      
      // 상세 정보가 없으면 조회
      if (!receiptDetails.has(usageId)) {
        fetchReceiptDetail(usageId);
      }
    }
  };

  // 연간 데이터를 막대 그래프용으로 변환
  const getBarChartData = (): BarChartData[] => {
    console.log('막대 그래프 데이터 변환 시작:', { 
      yearlyData, 
      length: yearlyData.length,
      selectedYear 
    });
    
    // yearlyData가 비어있으면 빈 배열 반환
    if (!yearlyData || yearlyData.length === 0) {
      console.log('yearlyData가 비어있음, 빈 막대그래프 데이터 반환');
      return Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        amount: 0,
        year: selectedYear,
      }));
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
      year: selectedYear,
    }));
    
    console.log('막대 그래프 최종 데이터:', barData);
    return barData;
  };


  // 영수증 데이터를 차트용으로 변환 (선택된 월용)
  const getSelectedMonthDonationUsageData = (): DonationUsageItem[] => {
    // 실제 데이터가 있으면 사용
    if (selectedMonthData?.receiptHistory && selectedMonthData.receiptHistory.length > 0) {
      // 카테고리별로 그룹화하고 금액 합계 및 건수 계산
      const categoryMap = new Map<string, { amount: number; count: number }>();
      selectedMonthData.receiptHistory.forEach(receipt => {
        const current = categoryMap.get(receipt.category) || { amount: 0, count: 0 };
        categoryMap.set(receipt.category, {
          amount: current.amount + receipt.totalAmount,
          count: current.count + 1
        });
      });

      // 총 금액 계산
      const totalAmount = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.amount, 0);

      // 색상 팔레트 (파란색 계열)
      const colors = [
        '#3B82F6', // blue-500
        '#60A5FA', // blue-400  
        '#93C5FD', // blue-300
        '#DBEAFE', // blue-100
        '#1E40AF', // blue-800
        '#1D4ED8', // blue-700
        '#2563EB', // blue-600
        '#1E3A8A', // blue-900
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

  // 전체 기부금 사용 내역을 차트용으로 변환
  const getAllDonationUsageData = (): DonationUsageItem[] => {
    // 전체 선택 시에는 allYearData 사용, 아니면 selectedMonthData 사용
    const dataToUse = isAllSelected ? allYearData : selectedMonthData;
    
    if (dataToUse?.receiptHistory && dataToUse.receiptHistory.length > 0) {
      // 카테고리별로 그룹화하고 금액 합계 및 건수 계산
      const categoryMap = new Map<string, { amount: number; count: number }>();
      dataToUse.receiptHistory.forEach(receipt => {
        const current = categoryMap.get(receipt.category) || { amount: 0, count: 0 };
        categoryMap.set(receipt.category, {
          amount: current.amount + receipt.totalAmount,
          count: current.count + 1
        });
      });

      // 총 금액 계산
      const totalAmount = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.amount, 0);

      // 색상 팔레트 (파란색 계열)
      const colors = [
        '#3B82F6', // blue-500
        '#60A5FA', // blue-400  
        '#93C5FD', // blue-300
        '#DBEAFE', // blue-100
        '#1E40AF', // blue-800
        '#1D4ED8', // blue-700
        '#2563EB', // blue-600
        '#1E3A8A', // blue-900
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

  // 전체 로딩 상태 (초기 로드 시에만)
  const isInitialLoading = loading && !yearlyData.length && !selectedMonthData;

  if (isInitialLoading) {
    return (
      <section id="panel-donations" className="space-y-4">
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

  // 전체 선택 여부 확인
  const isAllSelected = selectedMonth === 'all';
  
  // 원형 그래프용 데이터와 제목 결정
  const chartData = isAllSelected ? getAllDonationUsageData() : getSelectedMonthDonationUsageData();
  const chartTitle = isAllSelected
    ? `${selectedYear}년 전체 기부금 사용 비율`
    : `${selectedYear}년 ${selectedMonth}월 기부금 사용 비율`;
  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

  // 상세 내역용 데이터 결정 (전체 선택 시 allYearData, 아니면 selectedMonthData)
  const detailData = isAllSelected ? allYearData : selectedMonthData;
  
  // 페이지네이션 계산 (최근순 정렬)
  const sortedReceipts = detailData?.receiptHistory?.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];
  const totalItems = sortedReceipts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedReceipts.slice(startIndex, endIndex);
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 확장된 영수증들을 초기화
    setExpandedReceipts(new Set());
  };

  return (
    <section id="panel-donations" className="space-y-6">

      {/* 1. 연간 막대 그래프 */}
      <MonthlyBarChart 
        data={getBarChartData()} 
        title={`월별 기부금 사용액 (${selectedYear}년)`}
      />

      {/* 2. 원형 그래프와 테이블 */}
      <DonationUsageChart 
        data={chartData}
        totalAmount={totalAmount}
        title={chartTitle}
      />

      {/* 3. 날짜 선택 가능한 상세 내역 */}
      <Card>
        <CardContent className="p-4 py-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-semibold">
                {isAllSelected
                  ? `${selectedYear}년 전체 기부금 사용 내역`
                  : `${selectedYear}년 ${selectedMonth}월 기부금 사용 상세 내역`
                }
              </h4>
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
                onChange={(e) => handleMonthChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">전체</option>
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
          
          {loadingStates.details ? (
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
          ) : detailData?.receiptHistory && detailData.receiptHistory.length > 0 ? (
            <div className="space-y-3">
              {currentItems.map((receipt) => {
                const usageId = receipt.recieptHistoryId; // API에서는 usageId로 사용
                const isExpanded = expandedReceipts.has(usageId);
                const isLoading = loadingDetails.has(usageId);
                const detail = receiptDetails.get(usageId);
                
                return (
                  <div key={receipt.recieptHistoryId} className="border rounded-lg overflow-hidden">
                    {/* 기본 카드 */}
                    <div 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleReceiptClick(usageId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {receipt.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(receipt.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {receipt.totalAmount.toLocaleString()}원
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 상세 내용 */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
                            <span className="text-sm text-gray-600">상세 정보를 불러오는 중...</span>
                          </div>
                        ) : detail ? (
                          <div className="space-y-4">
                            {/* 상세 정보 헤더 */}
                            <div className="flex items-center gap-2 mb-3">
                              <Eye className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-gray-900">상세 내역</span>
                            </div>

                            {/* 매장 정보 */}
                            <div className="mb-4 bg-white p-4 rounded border">
                              <h5 className="text-sm font-medium text-gray-700 mb-3">매장 정보</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-xs text-gray-500">매장명</span>
                                  <p className="text-sm font-medium text-gray-900">{detail.storeName}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">매장번호</span>
                                  <p className="text-sm font-medium text-gray-900">{detail.storeNumber}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">주소</span>
                                  <p className="text-sm font-medium text-gray-900">{detail.address}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">거래일시</span>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(detail.transactionAt).toLocaleString('ko-KR')}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* AI 요약 */}
                            {detail.aiSummary && (
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-1">AI 요약</h5>
                                <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                                  {detail.aiSummary}
                                </p>
                              </div>
                            )}

                            {/* 상세 내용 */}
                            {detail.content && (
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-1">상세 내용</h5>
                                <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                                  {detail.content}
                                </p>
                              </div>
                            )}

                            {/* 구매 항목 목록 */}
                            {detail.detailList && detail.detailList.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">구매 항목</h5>
                                <div className="bg-white rounded border overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-gray-600">항목명</th>
                                          <th className="px-3 py-2 text-center text-gray-600">수량</th>
                                          <th className="px-3 py-2 text-right text-gray-600">단가</th>
                                          <th className="px-3 py-2 text-right text-gray-600">금액</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {detail.detailList.map((item, index) => (
                                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-3 py-2 text-gray-900">{item.item}</td>
                                            <td className="px-3 py-2 text-center text-gray-600">{item.count}</td>
                                            <td className="px-3 py-2 text-right text-gray-600">
                                              {item.pricePerItem.toLocaleString()}원
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium text-gray-900">
                                              {item.amount.toLocaleString()}원
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 총액 요약 */}
                            <div className="flex justify-end pt-3 border-t">
                              <div className="text-right">
                                <p className="text-sm text-gray-600">총 사용 금액</p>
                                <p className="text-lg font-bold text-purple-600">
                                  {detail.totalAmount.toLocaleString()}원
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">상세 정보를 불러올 수 없습니다.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    {startIndex + 1}-{Math.min(endIndex, totalItems)} / {totalItems}개
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      이전
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // 페이지 번호 표시 로직 (최대 5개까지만 표시)
                        if (totalPages <= 5) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        } else {
                          // 현재 페이지 주변 2페이지씩만 표시
                          const startPage = Math.max(1, currentPage - 2);
                          const endPage = Math.min(totalPages, currentPage + 2);
                          
                          if (page === 1 || page === totalPages || (page >= startPage && page <= endPage)) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            );
                          } else if (page === startPage - 1 || page === endPage + 1) {
                            return <span key={page} className="text-gray-400">...</span>;
                          }
                          return null;
                        }
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      다음
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {isAllSelected
                  ? `${selectedYear}년의 기부금 사용 내역이 없습니다.`
                  : `${selectedYear}년 ${selectedMonth}월의 기부금 사용 내역이 없습니다.`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
