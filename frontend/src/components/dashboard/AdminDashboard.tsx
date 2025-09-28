'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FarmService } from "@/services/farmService";
import { getFarmerDonationHistory } from "@/services/userService";
import { ScoreHistory, DonationUsageResponse, MonthlyDonationUsed, ReceiptHistory, Farm } from "@/types/farm";
import { VaultHistoryDto } from "@/types/user";

interface AdminDashboardProps {
  farmData?: {
    farmUuid: string;
    farmName: string;
    profileImage: string;
    totalScore: number;
    address: string;
    phoneNumber: string;
    horseCount: number;
    monthTotalAmount: number;
    purposeTotalAmount: number;
    month_total_amount: number;
    purpose_total_amount: number;
    area: number;
    description: string;
    monthlyScores: unknown[];
    horses: unknown[];
    ownerName: string;
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ farmData }) => {
  const [isDarkMode] = useState(false);
  
  // 실제 데이터 상태
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [yearlyData, setYearlyData] = useState<MonthlyDonationUsed[]>([]);
  const [allYearData, setAllYearData] = useState<DonationUsageResponse | null>(null);
  const [loadingDonationData, setLoadingDonationData] = useState(true);
  const [donationError, setDonationError] = useState<string | null>(null);
  
  // 최근 기부 내역 상태
  const [recentDonations, setRecentDonations] = useState<VaultHistoryDto[]>([]);
  const [loadingRecentDonations, setLoadingRecentDonations] = useState(true);
  
  // 요약 정보 상태
  const [totalDonation, setTotalDonation] = useState(0);
  const [usedAmount, setUsedAmount] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  // 디버깅을 위한 콘솔 로그
  console.log('AdminDashboard farmData:', farmData);
  console.log('monthTotalAmount:', farmData?.monthTotalAmount);
  console.log('purposeTotalAmount:', farmData?.purposeTotalAmount);

  // 신뢰도 내역 조회
  const fetchScoreHistory = useCallback(async () => {
    if (!farmData?.farmUuid) return;
    
    const currentYear = new Date().getFullYear();
    
    try {
      const response = await FarmService.getScoreHistory(farmData.farmUuid, currentYear);
      setScoreHistory(response.result);
    } catch (e: unknown) {
      console.error('신뢰도 내역 조회 실패:', e);
    }
  }, [farmData?.farmUuid]);

  // 최근 기부 내역 조회
  const fetchRecentDonations = useCallback(async () => {
    if (!farmData?.farmUuid) return;
    
    try {
      setLoadingRecentDonations(true);
      const response = await getFarmerDonationHistory({
        page: 0,
        size: 20, // 더 많이 가져와서 필터링
        startDate: '',
        endDate: ''
      });
      
      if (response.isSuccess && response.result.vaultHistoryResponseDtos) {
        // 기부 내역만 필터링하고 최대 4개만 가져오기
        const donationOnly = response.result.vaultHistoryResponseDtos.content
          .filter(donation => donation.type === 'DONATION')
          .slice(0, 4);
        setRecentDonations(donationOnly);
        
        // 요약 정보 설정
        setTotalDonation(response.result.totalDonation);
        setUsedAmount(response.result.usedAmount);
        setCurrentBalance(response.result.currentBalance);
      }
    } catch (e: unknown) {
      console.error('최근 기부 내역 조회 실패:', e);
    } finally {
      setLoadingRecentDonations(false);
    }
  }, [farmData?.farmUuid]);

  // 연간 기부금 사용 내역 조회
  const fetchYearlyDonationData = useCallback(async () => {
    if (!farmData?.farmUuid) return;
    
    try {
      setLoadingDonationData(true);
      setDonationError(null);
      
      const currentYear = new Date().getFullYear();
      const allMonthlyData: MonthlyDonationUsed[] = [];
      
      // 1월부터 12월까지 각 달의 데이터를 가져옴
      for (let month = 1; month <= 12; month++) {
        try {
          const data = await FarmService.getDonationUsage(farmData.farmUuid, currentYear, month);
          if (data.monthlyDonationUsed && data.monthlyDonationUsed.length > 0) {
            allMonthlyData.push(...data.monthlyDonationUsed);
          }
        } catch (error) {
          console.warn(`${currentYear}년 ${month}월 데이터 조회 실패:`, error);
        }
      }
      
      setYearlyData(allMonthlyData);
      
      // 전체 년도 데이터도 수집 (원형 그래프용)
      const allReceipts: ReceiptHistory[] = [];
      for (let month = 1; month <= 12; month++) {
        try {
          const data = await FarmService.getDonationUsage(farmData.farmUuid, currentYear, month);
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
  }, [farmData?.farmUuid]);

  // 신뢰도 데이터를 차트용으로 변환
  const getTrustScoreData = () => {
    if (scoreHistory.length === 0) {
      // 데이터가 없으면 1월부터 12월까지 빈 데이터 생성
      return Array.from({ length: 12 }, (_, index) => ({
        month: `${index + 1}월`,
        score: null
      }));
    }

    // 1월부터 12월까지 모든 월의 데이터를 생성
    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthData = scoreHistory.find(item => item.month === month);
      
      return {
        month: `${month}월`,
        score: monthData ? monthData.avgScore : null
      };
    });
  };

  // 월별 기부금 사용액 데이터 변환
  const getMonthlyUsageData = () => {
    if (!yearlyData || yearlyData.length === 0) {
      return Array.from({ length: 12 }, (_, index) => ({
        month: `${index + 1}월`,
        amount: 0
      }));
    }
    
    // 월별로 그룹화
    const monthlyMap = new Map<number, number>();
    yearlyData.forEach(usage => {
      monthlyMap.set(usage.month, usage.amountSpent);
    });

    // 1월부터 12월까지 데이터 생성
    return Array.from({ length: 12 }, (_, index) => ({
      month: `${index + 1}월`,
      amount: monthlyMap.get(index + 1) || 0
    }));
  };

  // 기부금 사용 비율 데이터 변환
  const getDonationUsageData = () => {
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

      // 색상 팔레트
      const colors = [
        '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', 
        '#1E40AF', '#1D4ED8', '#2563EB', '#1E3A8A'
      ];

      // DonationUsageItem 배열로 변환
      return Array.from(categoryMap.entries()).map(([category, data], index) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        color: colors[index % colors.length],
      })).sort((a, b) => b.amount - a.amount);
    }

    return [];
  };

  useEffect(() => {
    if (farmData?.farmUuid) {
      fetchScoreHistory();
      fetchYearlyDonationData();
      fetchRecentDonations();
    }
  }, [farmData?.farmUuid, fetchScoreHistory, fetchYearlyDonationData, fetchRecentDonations]);


  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="py-4">
                 {/* 헤더 */}
                 <div className="mb-8 mt-5">
                   <div className="text-center">
                     <h1 className="text-4xl font-bold text-gray-900 mb-4">
                       어서오세요 {farmData?.ownerName || '목장주'} 목장주님!
                     </h1>
                     <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
                   </div>
                 </div>

        {/* 바로가기 버튼 섹션 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-9 border border-blue-100">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">빠른 접근</h2>
            <p className="text-gray-600">자주 사용하는 기능에 빠르게 접근하세요</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 내 목장 조회 */}
            <button
              onClick={() => window.location.href = `/support/${farmData?.farmUuid}`}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left border border-gray-200 hover:border-blue-300 hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  내 목장 조회
                </h3>
                <p className="text-gray-600 text-sm">
                  목장 정보와 상태를 확인하세요
                </p>
              </div>
            </button>

            {/* 운영 보고 */}
            <button
              onClick={() => window.location.href = `/support/${farmData?.farmUuid}/report`}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left border border-gray-200 hover:border-green-300 hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  운영 보고
                </h3>
                <p className="text-gray-600 text-sm">
                  목장 운영 현황을 보고하고<br />
                  후원금 사용 내역을 증빙하세요
                </p>
              </div>
            </button>

            {/* 마이페이지 */}
            <button
              onClick={() => window.location.href = '/mypage'}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left border border-gray-200 hover:border-orange-300 hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  마이페이지
                </h3>
                <p className="text-gray-600 text-sm">
                  개인 정보와 설정을 관리하세요
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 통계 및 분석 섹션 */}
        <div className="space-y-8">
          {/* 섹션 헤더 */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">목장 운영 현황</h2>
            <p className="text-gray-600">실시간 데이터와 통계로 목장 운영을 한눈에 파악하세요</p>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-4 rounded-full"></div>
          </div>
          {/* 첫 번째 행: 이번달 모금액, 최근 기부 내역, 요약 정보 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* 이번달 모금액 */}
             <Card>
               <CardContent className="p-4 py-1">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-semibold">이번달 모금액</h3>
                   <button
                     onClick={() => window.location.href = `/support/${farmData?.farmUuid}`}
                     className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                   >
                     보러가기 →
                   </button>
                 </div>
                 <div className="flex flex-col items-center space-y-6">
                   {/* 물이 차오르는 원형 진행률 차트 */}
                   <div className="relative w-48 h-48">
                     {/* 외곽 원형 테두리 */}
                     <div className="absolute inset-0 rounded-full border-10 border-gray-300"></div>
                     
                     {/* 물이 차오르는 애니메이션 컨테이너 - 테두리 안쪽에만 */}
                     <div className="absolute inset-3 rounded-full overflow-hidden">
                       <div 
                         className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-2000 ease-out"
                         style={{
                           height: `${farmData?.purposeTotalAmount && farmData.purposeTotalAmount > 0 
                             ? Math.min(((farmData?.monthTotalAmount || 0) / farmData.purposeTotalAmount) * 100, 100)
                             : 0}%`,
                           animation: 'waterRise 2s ease-out'
                         }}
                       >
                         {/* 물결 효과 - 파도 애니메이션 */}
                         <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-t from-blue-300 to-transparent opacity-60 animate-wave"></div>
                         <div className="absolute top-2 left-0 right-0 h-2 bg-gradient-to-t from-blue-200 to-transparent opacity-40 animate-wave-delayed"></div>
                         <div className="absolute top-1 left-0 right-0 h-1 bg-gradient-to-t from-blue-100 to-transparent opacity-30 animate-wave-slow"></div>
                       </div>
                     </div>
                     
                     {/* 중앙 텍스트 */}
                     <div className="absolute inset-0 flex items-center justify-center z-10">
                       <div className="text-center">
                         <div className="text-3xl font-bold text-gray-900">
                           {farmData?.purposeTotalAmount && farmData.purposeTotalAmount > 0 
                             ? Math.min(((farmData?.monthTotalAmount || 0) / farmData.purposeTotalAmount) * 100, 100).toFixed(0)
                             : 0}%
                         </div>
                         <div className="text-m font-bold text-gray-900">달성</div>
                       </div>
                     </div>
                   </div>
                   
                   {/* 금액 정보 */}
                   <div className="text-center space-y-3">
                     <div className="text-2xl font-bold text-gray-900">
                       {(farmData?.monthTotalAmount || 0).toLocaleString()}원
                     </div>
                     <div className="text-sm text-gray-500">
                       목표: {(farmData?.purposeTotalAmount || 0).toLocaleString()}원
                     </div>
                     {farmData?.purposeTotalAmount && farmData.purposeTotalAmount > 0 && (
                       <div className="text-sm text-gray-600">
                         남은 금액: {Math.max(farmData.purposeTotalAmount - (farmData?.monthTotalAmount || 0), 0).toLocaleString()}원
                       </div>
                     )}
                   </div>
                 </div>
                 
                 {/* CSS 애니메이션 스타일 */}
                 <style dangerouslySetInnerHTML={{
                   __html: `
                     @keyframes waterRise {
                       0% {
                         height: 0%;
                       }
                       100% {
                         height: ${farmData?.purposeTotalAmount && farmData.purposeTotalAmount > 0 
                           ? Math.min(((farmData?.monthTotalAmount || 0) / farmData.purposeTotalAmount) * 100, 100)
                           : 0}%;
                       }
                     }
                     
                     @keyframes wave {
                       0%, 100% {
                         transform: translateX(0) scaleY(1);
                       }
                       25% {
                         transform: translateX(-2px) scaleY(1.1);
                       }
                       50% {
                         transform: translateX(2px) scaleY(0.9);
                       }
                       75% {
                         transform: translateX(-1px) scaleY(1.05);
                       }
                     }
                     
                     .animate-wave {
                       animation: wave 3s ease-in-out infinite;
                     }
                     
                     .animate-wave-delayed {
                       animation: wave 3s ease-in-out infinite 0.5s;
                     }
                     
                     .animate-wave-slow {
                       animation: wave 4s ease-in-out infinite 1s;
                     }
                   `
                 }} />
               </CardContent>
             </Card>

             {/* 최근 기부 내역 */}
             <Card>
               <CardContent className="p-4 py-1">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold">최근 기부 내역</h3>
                   <button
                     onClick={() => window.location.href = '/mypage'}
                     className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                   >
                     보러가기 →
                   </button>
                 </div>
                 {loadingRecentDonations ? (
                   <div className="text-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                     <p className="text-gray-600">기부 내역을 불러오는 중...</p>
                   </div>
                 ) : recentDonations.length === 0 ? (
                   <div className="text-center py-8">
                     <p className="text-gray-500">최근 기부 내역이 없습니다.</p>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {recentDonations.map((donation, index) => (
                       <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-8 border-blue-500">
                         <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-sm font-medium text-gray-900">
                               {donation.donatorName || '익명'}
                             </span>
                             <span className="text-xs text-gray-500">
                               {new Date(donation.donationDate).toLocaleDateString('ko-KR', {
                                 month: 'short',
                                 day: 'numeric'
                               })}
                             </span>
                           </div>
                           <div className="text-xs text-gray-600">
                             기부
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="text-sm font-semibold text-green-600">
                             +{donation.donationAmount.toLocaleString()}원
                           </div>
                           <div className="text-xs text-gray-500">
                             잔액: {donation.balance.toLocaleString()}원
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* 요약 정보 */}
             <Card>
               <CardContent className="p-4 py-1">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold">요약 정보</h3>
                   <button
                     onClick={() => window.location.href = '/mypage'}
                     className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                   >
                     보러가기 →
                   </button>
                 </div>
                 <div className="space-y-4">
                   {/* 누적 후원금 */}
                   <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                         <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                         </svg>
                       </div>
                       <div>
                         <div className="text-sm font-medium text-gray-900">누적 후원금</div>
                         <div className="text-xs text-gray-600">총 받은 기부금</div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-lg font-bold text-green-600">
                         {totalDonation.toLocaleString()}원
                       </div>
                     </div>
                   </div>

                   {/* 누적 정산 금액 */}
                   <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                         <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                         </svg>
                       </div>
                       <div>
                         <div className="text-sm font-medium text-gray-900">누적 정산 금액</div>
                         <div className="text-xs text-gray-600">사용한 기부금</div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-lg font-bold text-orange-600">
                         {usedAmount.toLocaleString()}원
                       </div>
                     </div>
                   </div>

                   {/* 현재 잔액 */}
                   <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                         <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                         </svg>
                       </div>
                       <div>
                         <div className="text-sm font-medium text-gray-900">현재 잔액</div>
                         <div className="text-xs text-gray-600">사용 가능한 금액</div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-lg font-bold text-blue-600">
                         {currentBalance.toLocaleString()}원
                       </div>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

          </div>

          {/* 두 번째 행: 신뢰도 평균 변화, 월별 기부금 사용액 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* 2025년 신뢰도 평균 변화 */}
             <Card>
               <CardContent className="p-4 py-1">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold">{new Date().getFullYear()}년 신뢰도 평균 변화</h3>
                   <button
                     onClick={() => window.location.href = `/support/${farmData?.farmUuid}?tab=trust`}
                     className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                   >
                     보러가기 →
                   </button>
                 </div>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={getTrustScoreData()}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis 
                         dataKey="month" 
                         tick={{ fontSize: 12 }}
                         axisLine={{ stroke: '#e5e7eb' }}
                         tickLine={{ stroke: '#e5e7eb' }}
                       />
                       <YAxis 
                         domain={[30, 80]}
                         tick={{ fontSize: 12 }}
                         axisLine={{ stroke: '#e5e7eb' }}
                         tickLine={{ stroke: '#e5e7eb' }}
                         tickFormatter={(value) => `${value}점`}
                       />
                       <Tooltip 
                         formatter={(value: number) => [`${value}점`, '신뢰도']}
                         labelFormatter={(label) => `${label}`}
                         contentStyle={{
                           backgroundColor: '#fff',
                           border: '1px solid #e5e7eb',
                           borderRadius: '8px',
                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                         }}
                       />
                       <Line 
                         type="monotone" 
                         dataKey="score" 
                         stroke="#3B82F6" 
                         strokeWidth={3}
                         dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                         activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                       />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>

             {/* 월별 기부금 사용액 */}
             <Card>
               <CardContent className="p-4 py-1">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold">월별 기부금 사용액 ({new Date().getFullYear()}년)</h3>
                   <button
                     onClick={() => window.location.href = `/support/${farmData?.farmUuid}?tab=donations`}
                     className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                   >
                     보러가기 →
                   </button>
                 </div>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={getMonthlyUsageData()} margin={{ top: 15, right: 20, left: 15, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis 
                         dataKey="month" 
                         tick={{ fontSize: 12 }}
                         axisLine={{ stroke: '#e5e7eb' }}
                         tickLine={{ stroke: '#e5e7eb' }}
                       />
                       <YAxis 
                         tick={{ fontSize: 12 }}
                         axisLine={{ stroke: '#e5e7eb' }}
                         tickLine={{ stroke: '#e5e7eb' }}
                         tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                       />
                       <Tooltip 
                         formatter={(value: number) => [`${value.toLocaleString()}원`, '사용금액']}
                         labelFormatter={(label) => `월: ${label}`}
                         contentStyle={{
                           backgroundColor: '#fff',
                           border: '1px solid #e5e7eb',
                           borderRadius: '8px',
                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                         }}
                       />
                       <Bar 
                         dataKey="amount" 
                         fill="#10B981" 
                         radius={[4, 4, 0, 0]}
                         className="hover:opacity-80 transition-opacity"
                       />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
          </div>

          {/* 세 번째 행: 기부금 사용 비율 */}
          <div>
             <Card className="w-full">
               <CardContent className="p-4 py-1">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold">기부금 사용 비율 ({new Date().getFullYear()}년 전체)</h3>
                   <button
                     onClick={() => window.location.href = `/support/${farmData?.farmUuid}?tab=donations`}
                     className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                   >
                     보러가기 →
                   </button>
                 </div>
                 {loadingDonationData ? (
                   <div className="text-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                     <p className="text-gray-600">기부금 사용 비율을 불러오는 중...</p>
                   </div>
                 ) : getDonationUsageData().length === 0 ? (
                   <div className="text-center py-8">
                     <p className="text-gray-500">사용 내역이 없습니다.</p>
                   </div>
                 ) : (
                   <div className="flex flex-col lg:flex-row gap-6">
                     {/* 원형 그래프 */}
                     <div className="flex-shrink-0 w-full lg:w-64">
                       <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie
                               data={getDonationUsageData()}
                               cx="50%"
                               cy="50%"
                               innerRadius={40}
                               outerRadius={80}
                               paddingAngle={2}
                               dataKey="amount"
                             >
                               {getDonationUsageData().map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                             </Pie>
                             <Tooltip 
                               formatter={(value: number) => [`${value.toLocaleString()}원`, '사용금액']}
                               labelFormatter={(label) => `카테고리: ${label}`}
                             />
                           </PieChart>
                         </ResponsiveContainer>
                       </div>
                     </div>
                     
                     {/* 테이블 */}
                     <div className="flex-1">
                       <div className="overflow-x-auto">
                         <table className="w-full text-sm">
                           <thead>
                             <tr className="border-b">
                               <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">항목</th>
                               <th className="text-center py-2 px-3 font-medium text-gray-700 text-sm">건수</th>
                               <th className="text-right py-2 px-3 font-medium text-gray-700 text-sm">사용금액(원)</th>
                               <th className="text-right py-2 px-3 font-medium text-gray-700 text-sm">비율</th>
                             </tr>
                           </thead>
                           <tbody>
                             {getDonationUsageData().map((item, index) => (
                               <tr key={index} className="border-b hover:bg-gray-50">
                                 <td className="py-2 px-3">
                                   <div className="flex items-center gap-2">
                                     <div 
                                       className="w-3 h-3 rounded-full flex-shrink-0" 
                                       style={{ backgroundColor: item.color }}
                                     />
                                     <span className="font-medium text-gray-900 text-sm">{item.category}</span>
                                   </div>
                                 </td>
                                 <td className="text-center py-2 px-3 text-gray-600 text-sm">
                                   {item.count}건
                                 </td>
                                 <td className="text-right py-2 px-3 font-medium text-gray-900 text-sm">
                                   {item.amount.toLocaleString()}
                                 </td>
                                 <td className="text-right py-2 px-3 font-medium text-gray-900 text-sm">
                                   {item.percentage.toFixed(1)}%
                                 </td>
                               </tr>
                             ))}
                             {/* 합계 행 */}
                             <tr className="border-t-2 border-gray-300 bg-gray-50">
                               <td className="py-2 px-3 font-semibold text-gray-900 text-sm">합계</td>
                               <td className="text-center py-2 px-3 font-semibold text-gray-900 text-sm">
                                 {getDonationUsageData().reduce((sum, item) => sum + item.count, 0)}건
                               </td>
                               <td className="text-right py-2 px-3 font-semibold text-gray-900 text-sm">
                                 {getDonationUsageData().reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                               </td>
                               <td className="text-right py-2 px-3 font-semibold text-gray-900 text-sm">
                                 100.0%
                               </td>
                             </tr>
                           </tbody>
                         </table>
                       </div>
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
