// src/components/farm/panels/DonationPanel.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { FarmService } from "@/services/farmService";
import { DonationUsageResponse, MonthlyDonationUsed, ReceiptHistory, ReceiptDetail } from "@/types/farm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Receipt, Eye, ChevronDown, ChevronUp, Image as ImageIcon, Flag } from "lucide-react";
import DonationUsageChart, { DonationUsageItem } from "./DonationUsageChart";
import { MonthlyBarChart } from "./DonationUsageChart";

// 막대 그래프 데이터 타입
interface BarChartData {
  month: number;
  amount: number;
  year: number;
}

interface DonationPanelProps {
  farmUuid: string;
}

export default function DonationPanel({ farmUuid }: DonationPanelProps) {
  const [selectedMonthData, setSelectedMonthData] = useState<DonationUsageResponse | null>(null);
  const [yearlyData, setYearlyData] = useState<MonthlyDonationUsed[]>([]);
  const [allYearData, setAllYearData] = useState<DonationUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  
  // 목장 정보와 동적 년도/월 범위
  const [farmCreatedAt, setFarmCreatedAt] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  
  // 상세 조회를 위한 상태
  const [expandedReceipts, setExpandedReceipts] = useState<Set<number>>(new Set());
  const [receiptDetails, setReceiptDetails] = useState<Map<number, ReceiptDetail>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());
  
  // 이미지 모달 상태
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // 신고 모달 상태
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  
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
  
  // 로딩 진행률 표시를 위한 상태
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
    message: ''
  });
  
  // 목장 정보 가져오기 및 년도/월 범위 설정
  const fetchFarmInfo = useCallback(async () => {
    try {
      const farmInfo = await FarmService.getFarm(farmUuid);
      if (farmInfo.created_at) {
        setFarmCreatedAt(farmInfo.created_at);
        
        // 목장 생성일부터 현재까지의 년도 범위 생성
        const createdDate = new Date(farmInfo.created_at);
        const currentDate = new Date();
        const years = [];
        
        for (let year = createdDate.getFullYear(); year <= currentDate.getFullYear(); year++) {
          years.push(year);
        }
        setAvailableYears(years);
        
        // 현재 년도가 선택된 년도와 같으면 생성일 이후부터 현재 월까지, 아니면 1-12월
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
        const months = [];
        
        if (selectedYear === currentYear && createdDate.getFullYear() === currentYear) {
          // 같은 년도면 생성일 이후부터 현재 월까지
          for (let month = createdDate.getMonth() + 1; month <= currentMonth; month++) {
            months.push(month);
          }
        } else if (selectedYear === createdDate.getFullYear()) {
          // 생성년도면 생성일 이후부터 12월까지 (미래가 아닌 경우)
          for (let month = createdDate.getMonth() + 1; month <= 12; month++) {
            months.push(month);
          }
        } else if (selectedYear === currentYear) {
          // 현재 년도면 1월부터 현재 월까지
          for (let month = 1; month <= currentMonth; month++) {
            months.push(month);
          }
        } else {
          // 다른 년도면 1-12월
          for (let month = 1; month <= 12; month++) {
            months.push(month);
          }
        }
        
        setAvailableMonths(months);
      }
    } catch (error) {
      console.error('목장 정보 조회 실패:', error);
    }
  }, [farmUuid, selectedYear]);

  // 기부금 사용 내역 조회 (선택된 월용) - 캐싱 적용
  const fetchDonationUsage = useCallback(async (year: number | 'all', month: number | 'all') => {
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
      
      console.log('기부금 사용 내역 조회 시작:', { farmUuid, year, month });
      
      let data: DonationUsageResponse;
      if (year === 'all') {
        // 전체 년도 조회 - 모든 년도의 데이터를 수집
        console.log('전체 년도 데이터 수집 시작');
        const allReceipts: ReceiptHistory[] = [];
        const allMonthlyData: MonthlyDonationUsed[] = [];
        
        // 목장 생성일부터 현재까지 각 년도의 데이터를 가져옴
        const createdDate = farmCreatedAt ? new Date(farmCreatedAt) : new Date('2021-01-01');
        const currentDate = new Date();
        // 모든 년월에 대한 API 호출을 병렬로 처리
        const apiPromises: Promise<DonationUsageResponse | null>[] = [];
        const yearMonthPairs: { year: number; month: number }[] = [];
        
        for (let y = createdDate.getFullYear(); y <= currentDate.getFullYear(); y++) {
          if (month === 'all') {
            // 전체 년도 + 전체 월 조회 - 실제 데이터 범위만 조회
            const startMonth = y === createdDate.getFullYear() ? createdDate.getMonth() + 1 : 1;
            const endMonth = y === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
            
            for (let m = startMonth; m <= endMonth; m++) {
              yearMonthPairs.push({ year: y, month: m });
              apiPromises.push(
                FarmService.getDonationUsage(farmUuid, y, m)
                  .catch(error => {
                    console.warn(`${y}년 ${m}월 데이터 조회 실패:`, error);
                    return null;
                  })
              );
            }
          } else {
            // 전체 년도 + 특정 월 조회 - 해당 월이 실제 범위 내에 있는지 확인
            const startMonth = y === createdDate.getFullYear() ? createdDate.getMonth() + 1 : 1;
            const endMonth = y === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
            
            if (month >= startMonth && month <= endMonth) {
              yearMonthPairs.push({ year: y, month });
              apiPromises.push(
                FarmService.getDonationUsage(farmUuid, y, month)
                  .catch(error => {
                    console.warn(`${y}년 ${month}월 데이터 조회 실패:`, error);
                    return null;
                  })
              );
            }
          }
        }
        
        console.log(`총 ${apiPromises.length}개의 상세 데이터 API 호출을 병렬로 실행합니다.`);
        
        // 모든 API 호출을 병렬로 실행
        const results = await Promise.all(apiPromises);
        
        // 결과 처리
        results.forEach((monthData, index) => {
          if (monthData) {
            const { year, month } = yearMonthPairs[index];
            
            if (monthData.receiptHistory && monthData.receiptHistory.length > 0) {
              console.log(`${year}년 ${month}월 영수증 ${monthData.receiptHistory.length}개 추가`);
              allReceipts.push(...monthData.receiptHistory);
            }
            
            if (monthData.monthlyDonationUsed && monthData.monthlyDonationUsed.length > 0) {
              allMonthlyData.push(...monthData.monthlyDonationUsed);
            }
          }
        });
        
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
      } else if (month === 'all') {
        // 특정 년도 + 전체 월 조회 - 실제 데이터 범위만 조회
        console.log('전체 년도 데이터 수집 시작:', year);
        const allReceipts: ReceiptHistory[] = [];
        const allMonthlyData: MonthlyDonationUsed[] = [];
        
        // 목장 생성일과 현재 날짜를 고려하여 해당 년도의 실제 월 범위 계산
        const createdDate = farmCreatedAt ? new Date(farmCreatedAt) : new Date('2021-01-01');
        const currentDate = new Date();
        
        const startMonth = year === createdDate.getFullYear() ? createdDate.getMonth() + 1 : 1;
        const endMonth = year === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
        
        // 해당 년도의 모든 월에 대한 API 호출을 병렬로 처리
        const apiPromises: Promise<DonationUsageResponse | null>[] = [];
        const monthNumbers: number[] = [];
        
        for (let m = startMonth; m <= endMonth; m++) {
          monthNumbers.push(m);
          apiPromises.push(
            FarmService.getDonationUsage(farmUuid, year, m)
              .catch(error => {
                console.warn(`${year}년 ${m}월 데이터 조회 실패:`, error);
                return null;
              })
          );
        }
        
        console.log(`${year}년 ${apiPromises.length}개월 상세 데이터를 병렬로 조회합니다.`);
        
        // 모든 API 호출을 병렬로 실행
        const results = await Promise.all(apiPromises);
        
        // 결과 처리
        results.forEach((monthData, index) => {
          if (monthData) {
            const month = monthNumbers[index];
            
            if (monthData.receiptHistory && monthData.receiptHistory.length > 0) {
              console.log(`${year}년 ${month}월 영수증 ${monthData.receiptHistory.length}개 추가`);
              allReceipts.push(...monthData.receiptHistory);
            }
            
            if (monthData.monthlyDonationUsed && monthData.monthlyDonationUsed.length > 0) {
              allMonthlyData.push(...monthData.monthlyDonationUsed);
            }
          }
        });
        
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
        // 특정 년도 + 특정 월 조회
        data = await FarmService.getDonationUsage(farmUuid, year, month);
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
  }, [farmUuid, dataCache, farmCreatedAt]);

  // 연간 기부금 사용 내역 조회 (막대 그래프용) - 캐싱 적용
  const fetchYearlyData = useCallback(async (year: number | 'all') => {
    // 캐시에서 먼저 확인 (전체 년도가 아닌 경우만)
    if (year !== 'all' && yearlyCache.has(year)) {
      console.log('연간 데이터 캐시에서 로드:', year);
      setYearlyData(yearlyCache.get(year)!);
      return;
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, yearly: true }));
      
      if (year === 'all') {
        // 전체 년도 조회 - 목장 생성일부터 현재까지의 실제 데이터만 조회
        console.log('전체 년도 연간 기부금 사용 내역 조회 시작:', { farmUuid });
        const allMonthlyData: MonthlyDonationUsed[] = [];
        
        // 목장 생성일부터 현재까지 각 년도의 데이터를 가져옴
        const createdDate = farmCreatedAt ? new Date(farmCreatedAt) : new Date('2021-01-01');
        const currentDate = new Date();
        
        // 모든 년월에 대한 API 호출을 병렬로 처리
        const apiPromises: Promise<DonationUsageResponse | null>[] = [];
        const yearMonthPairs: { year: number; month: number }[] = [];
        
        for (let y = createdDate.getFullYear(); y <= currentDate.getFullYear(); y++) {
          // 해당 년도의 시작 월과 끝 월 계산
          const startMonth = y === createdDate.getFullYear() ? createdDate.getMonth() + 1 : 1;
          const endMonth = y === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
          
          for (let month = startMonth; month <= endMonth; month++) {
            yearMonthPairs.push({ year: y, month });
            apiPromises.push(
              FarmService.getDonationUsage(farmUuid, y, month)
                .catch(error => {
                  console.warn(`${y}년 ${month}월 데이터 조회 실패:`, error);
                  return null; // 실패한 경우 null 반환
                })
            );
          }
        }
        
        console.log(`총 ${apiPromises.length}개의 API 호출을 병렬로 실행합니다.`);
        
        // 모든 API 호출을 병렬로 실행
        const results = await Promise.all(apiPromises);
        
        // 결과 처리
        results.forEach((data, index) => {
          if (data && data.monthlyDonationUsed && data.monthlyDonationUsed.length > 0) {
            const { year, month } = yearMonthPairs[index];
            console.log(`${year}년 ${month}월 데이터 추가:`, data.monthlyDonationUsed);
            allMonthlyData.push(...data.monthlyDonationUsed);
          }
        });
        
        console.log('전체 년도 연간 데이터 수집 완료:', { 
          totalMonths: allMonthlyData.length, 
          data: allMonthlyData 
        });
        
        setYearlyData(allMonthlyData);
      } else {
        console.log('연간 기부금 사용 내역 조회 시작:', { farmUuid, year });
        const monthlyData: MonthlyDonationUsed[] = [];
        
        // 목장 생성일과 현재 날짜를 고려하여 해당 년도의 실제 월 범위 계산
        const createdDate = farmCreatedAt ? new Date(farmCreatedAt) : new Date('2021-01-01');
        const currentDate = new Date();
        
        const startMonth = year === createdDate.getFullYear() ? createdDate.getMonth() + 1 : 1;
        const endMonth = year === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
        
        // 해당 년도의 모든 월에 대한 API 호출을 병렬로 처리
        const apiPromises: Promise<DonationUsageResponse | null>[] = [];
        const monthNumbers: number[] = [];
        
        for (let month = startMonth; month <= endMonth; month++) {
          monthNumbers.push(month);
          apiPromises.push(
            FarmService.getDonationUsage(farmUuid, year, month)
              .catch(error => {
                console.warn(`${year}년 ${month}월 데이터 조회 실패:`, error);
                return null; // 실패한 경우 null 반환
              })
          );
        }
        
        console.log(`${year}년 ${apiPromises.length}개월 데이터를 병렬로 조회합니다.`);
        
        // 모든 API 호출을 병렬로 실행
        const results = await Promise.all(apiPromises);
        
        // 결과 처리
        results.forEach((data, index) => {
          if (data && data.monthlyDonationUsed && data.monthlyDonationUsed.length > 0) {
            const month = monthNumbers[index];
            console.log(`${year}년 ${month}월 데이터 추가:`, data.monthlyDonationUsed);
            monthlyData.push(...data.monthlyDonationUsed);
          }
        });
        
        console.log('연간 데이터 수집 완료:', { 
          totalMonths: monthlyData.length, 
          data: monthlyData 
        });
        
        // 캐시에 저장
        setYearlyCache(prev => new Map(prev).set(year, monthlyData));
        setYearlyData(monthlyData);
        console.log('연간 기부금 사용 내역 조회 완료:', monthlyData);
      }
    } catch (e: unknown) {
      console.error('연간 기부금 사용 내역 조회 실패:', e);
      setYearlyData([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, yearly: false }));
    }
  }, [farmUuid, yearlyCache, farmCreatedAt]);



  // 초기 로딩 상태 관리
  const [isInitialized, setIsInitialized] = useState(false);

  // farmUuid 변경 시 초기화 상태 리셋
  useEffect(() => {
    setIsInitialized(false);
    setLoading(true);
  }, [farmUuid]);

  useEffect(() => {
    // 초기 로드 시 필요한 데이터만 가져옴
    const initializeData = async () => {
      if (isInitialized) return; // 이미 초기화되었으면 스킵
      
      setLoading(true);
      setError(null);
      
      try {
        // 병렬로 데이터 가져오기 (목장 정보는 먼저 가져와야 함)
        const farmInfoPromise = fetchFarmInfo();
        
        // 목장 정보를 기다린 후 연간 데이터와 상세 데이터를 병렬로 가져오기
        await farmInfoPromise;
        
        // 연간 데이터와 상세 데이터를 병렬로 가져오기
        const promises = [
          fetchYearlyData(selectedYear),
          selectedMonth === 'all' 
            ? fetchDonationUsage(selectedYear, 'all')
            : fetchDonationUsage(selectedYear, selectedMonth)
        ];
        
        await Promise.all(promises);
        
        setLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error('초기 데이터 로딩 실패:', error);
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeData();
  }, [farmUuid, isInitialized]); // farmUuid와 isInitialized를 의존성으로 유지

  // 년도/월 변경 시에만 데이터 재조회
  useEffect(() => {
    if (!isInitialized) return; // 초기화가 완료되지 않았으면 스킵
    
    const updateData = async () => {
      setLoadingStates(prev => ({ ...prev, monthly: true }));
      
      // 연간 데이터 업데이트
      await fetchYearlyData(selectedYear);
      
      // 상세 데이터 업데이트
      if (selectedMonth === 'all') {
        await fetchDonationUsage(selectedYear, 'all');
      } else {
        await fetchDonationUsage(selectedYear, selectedMonth);
      }
      
      setLoadingStates(prev => ({ ...prev, monthly: false }));
    };

    updateData();
  }, [selectedYear, selectedMonth, isInitialized]);


  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
    setCurrentPage(1); // 페이지 리셋
  };

  // 년도 변경 시 월 범위 업데이트
  useEffect(() => {
    if (farmCreatedAt) {
      const createdDate = new Date(farmCreatedAt);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
      const months = [];
      
      if (selectedYear === currentYear && createdDate.getFullYear() === currentYear) {
        // 같은 년도면 생성일 이후부터 현재 월까지
        for (let month = createdDate.getMonth() + 1; month <= currentMonth; month++) {
          months.push(month);
        }
      } else if (selectedYear === createdDate.getFullYear()) {
        // 생성년도면 생성일 이후부터 12월까지 (미래가 아닌 경우)
        for (let month = createdDate.getMonth() + 1; month <= 12; month++) {
          months.push(month);
        }
      } else if (selectedYear === currentYear) {
        // 현재 년도면 1월부터 현재 월까지
        for (let month = 1; month <= currentMonth; month++) {
          months.push(month);
        }
      } else {
        // 다른 년도면 1-12월
        for (let month = 1; month <= 12; month++) {
          months.push(month);
        }
      }
      
      setAvailableMonths(months);
    }
  }, [selectedYear, farmCreatedAt]);

  const handleMonthChange = (month: number | 'all') => {
    setSelectedMonth(month);
    setCurrentPage(1); // 페이지 리셋
  };

  // 기부금 사용 내역 상세 조회
  const fetchReceiptDetail = async (usageId: number) => {
    try {
      setLoadingDetails(prev => new Set(prev).add(usageId));
      
      console.log('기부금 사용 내역 상세 조회 시작:', { farmUuid, usageId });
      const response = await FarmService.getReceiptDetail(farmUuid, usageId);
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
      year: selectedYear === 'all' ? new Date().getFullYear() : selectedYear,
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
  const isInitialLoading = loading && !isInitialized;

  if (isInitialLoading) {
    return (
      <section id="panel-donations" className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">기부금 사용 내역을 불러오는 중...</p>
          {loadingProgress.total > 0 && (
            <div className="w-full max-w-xs mx-auto">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>{loadingProgress.message}</span>
                <span>{loadingProgress.current}/{loadingProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
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
  const chartTitle = selectedYear === 'all' 
    ? '기부금 사용 비율 (전체)'
    : isAllSelected
      ? `기부금 사용 비율 (${selectedYear}년 전체)`
      : `기부금 사용 비율 (${selectedYear}년 ${selectedMonth}월)`;
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
        title={`월별 기부금 사용액 (${selectedYear === 'all' ? '전체' : selectedYear + '년'})`}
      />

      {/* 2. 원형 그래프와 테이블 */}
      <DonationUsageChart 
        data={loadingStates.monthly ? [] : chartData}
        totalAmount={loadingStates.monthly ? 0 : totalAmount}
        title={chartTitle}
        isLoading={loadingStates.monthly}
        loadingMessage="기부금 사용 비율을 불러오는 중..."
      />

      {/* 3. 날짜 선택 가능한 상세 내역 */}
      <Card>
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-semibold">
                {selectedYear === 'all' 
                  ? '기부금 사용 상세 내역 (전체)'
                  : isAllSelected
                    ? `기부금 사용 상세 내역 (${selectedYear}년 전체)`
                    : `기부금 사용 상세 내역 (${selectedYear}년 ${selectedMonth}월)`
                }
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="pl-3 pr-8 py-1 border rounded-md text-sm appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.4rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="all">년</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="pl-3 pr-8 py-1 border rounded-md text-sm appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.4rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="all">월</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}월</option>
                ))}
              </select>
            </div>
          </div>
          
          {loadingStates.monthly ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">기부금 사용 상세 내역을 불러오는 중...</p>
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
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-purple-600" />
                                <span className="font-medium text-gray-900">상세 내역</span>
                              </div>
                              <button 
                                onClick={() => !isReportSubmitted && setShowReportModal(true)}
                                disabled={isReportSubmitted}
                                className={`flex items-center gap-1 text-sm transition-colors ${
                                  isReportSubmitted 
                                    ? 'text-green-600 cursor-not-allowed' 
                                    : 'text-red-600 hover:text-red-800 hover:underline'
                                }`}
                              >
                                <Flag className="h-4 w-4" />
                                {isReportSubmitted ? '신고완료' : '신고하기'}
                              </button>
                            </div>

                            {/* 매장 정보와 인증 이미지를 한 줄에 배치 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                              {/* 매장 정보 */}
                              <div className="bg-white p-4 rounded border">
                                <h5 className="text-sm font-medium text-gray-700 mb-3">매장 정보</h5>
                                <div className="space-y-3">
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

                              {/* 인증 이미지 */}
                              {detail.certificationImageUrl && (
                                <div className="bg-white p-4 rounded border">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">인증 이미지</h5>
                                  <div 
                                    className="relative cursor-pointer group"
                                    onClick={() => setSelectedImage(detail.certificationImageUrl)}
                                  >
                                    <img
                                      src={detail.certificationImageUrl}
                                      alt="인증 이미지"
                                      className="w-full h-48 object-cover rounded-lg border shadow-sm group-hover:shadow-md transition-shadow"
                                    />
                                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <ImageIcon className="h-8 w-8 text-white" />
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2 text-center">클릭하여 확대 보기</p>
                                </div>
                              )}
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
                <div className="flex flex-col items-center gap-4 mt-6 pt-4 border-t">
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
                {selectedYear === 'all' 
                  ? '기부금 사용 내역이 없습니다.'
                  : isAllSelected
                    ? `기부금 사용 내역이 없습니다. (${selectedYear}년)`
                    : `기부금 사용 내역이 없습니다. (${selectedYear}년 ${selectedMonth}월)`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="인증 이미지 확대"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 신고 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {!isReportSubmitted ? (
                // 신고 확인 화면
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <Flag className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    신고하시겠습니까?
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    이 기부 내역을 신고하시겠습니까?<br />
                    신고된 내용은 검토 후 조치됩니다.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        setIsReportSubmitted(true);
                        // 3초 후 자동으로 모달 닫기
                        setTimeout(() => {
                          setShowReportModal(false);
                        }, 3000);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      신고하기
                    </button>
                  </div>
                </>
              ) : (
                // 신고 완료 화면
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    신고가 완료되었습니다
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    신고해주셔서 감사합니다.<br />
                    검토 후 조치하겠습니다.<br />
                    <span className="text-xs text-gray-400">잠시 후 자동으로 닫힙니다...</span>
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setShowReportModal(false);
                      }}
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      확인
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
