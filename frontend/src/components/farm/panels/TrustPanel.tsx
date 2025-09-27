// src/components/farm/panels/TrustPanel.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { FarmService } from "@/services/farmService";
import { ScoreHistory, ScoreHistoryItem } from "@/types/farm";
import { Button } from "@/components/ui/button";
import { Calendar, Shield } from "lucide-react";
import TrustScoreChart from "./TrustScoreChart";

interface TrustPanelProps {
  farmUuid: string;
  currentScore?: number;
}

export default function TrustPanel({ farmUuid, currentScore }: TrustPanelProps) {
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [scoreHistoryList, setScoreHistoryList] = useState<ScoreHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // null이면 전체, 숫자면 해당 월
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // 목장 정보와 동적 년도/월 범위
  const [farmCreatedAt, setFarmCreatedAt] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);

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
  }, [farmUuid]);

  // 신뢰도 내역 조회 (월별 평균)
  const fetchScoreHistory = useCallback(async (year: number | 'all', month?: number) => {
    try {
      if (year === 'all') {
        // 전체 년도 조회 - 모든 년도의 데이터를 수집
        console.log('전체 년도 신뢰도 내역 조회 시작:', { farmUuid });
        const allScoreHistory: ScoreHistory[] = [];
        
        // 목장 생성일부터 현재까지 각 년도의 데이터를 가져옴
        const createdDate = farmCreatedAt ? new Date(farmCreatedAt) : new Date('2021-01-01');
        const currentDate = new Date();
        for (let y = createdDate.getFullYear(); y <= currentDate.getFullYear(); y++) {
          try {
            console.log(`${y}년 신뢰도 내역 조회 중...`);
            const response = await FarmService.getScoreHistory(farmUuid, y, month);
            if (response.result && response.result.length > 0) {
              console.log(`${y}년 신뢰도 내역 ${response.result.length}개 추가`);
              allScoreHistory.push(...response.result);
            }
          } catch (error) {
            console.warn(`${y}년 신뢰도 내역 조회 실패:`, error);
            // 해당 년도 데이터가 없어도 계속 진행
          }
        }
        
        console.log('전체 년도 신뢰도 내역 수집 완료:', { totalHistory: allScoreHistory.length });
        setScoreHistory(allScoreHistory);
      } else {
        console.log('신뢰도 내역 조회 시작:', { farmUuid, year, month });
        const response = await FarmService.getScoreHistory(farmUuid, year, month);
        console.log('신뢰도 내역 조회 성공:', response);
        setScoreHistory(response.result);
      }
    } catch (e: unknown) {
      console.error('신뢰도 내역 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "신뢰도 내역을 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    }
  }, [farmUuid, farmCreatedAt]);

  // 신뢰도 목록 조회 (상세 내역)
  const fetchScoreHistoryList = useCallback(async (year?: number | 'all', month?: number) => {
    try {
      if (year === 'all') {
        // 전체 년도 조회 - 모든 년도의 데이터를 수집
        console.log('전체 년도 신뢰도 목록 조회 시작:', { farmUuid });
        const allScoreHistoryList: ScoreHistoryItem[] = [];
        
        // 목장 생성일부터 현재까지 각 년도의 데이터를 가져옴
        const createdDate = farmCreatedAt ? new Date(farmCreatedAt) : new Date('2021-01-01');
        const currentDate = new Date();
        for (let y = createdDate.getFullYear(); y <= currentDate.getFullYear(); y++) {
          try {
            console.log(`${y}년 신뢰도 목록 조회 중...`);
            const response = await FarmService.getScoreHistoryList(farmUuid, y, month);
            if (response.result && response.result.length > 0) {
              console.log(`${y}년 신뢰도 목록 ${response.result.length}개 추가`);
              allScoreHistoryList.push(...response.result);
            }
          } catch (error) {
            console.warn(`${y}년 신뢰도 목록 조회 실패:`, error);
            // 해당 년도 데이터가 없어도 계속 진행
          }
        }
        
        console.log('전체 년도 신뢰도 목록 수집 완료:', { totalHistoryList: allScoreHistoryList.length });
        setScoreHistoryList(allScoreHistoryList);
      } else {
        console.log('신뢰도 목록 조회 시작:', { farmUuid, year, month });
        const response = await FarmService.getScoreHistoryList(farmUuid, year, month);
        console.log('신뢰도 목록 조회 성공:', response);
        setScoreHistoryList(response.result);
      }
    } catch (e: unknown) {
      console.error('신뢰도 목록 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "신뢰도 목록을 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    }
  }, [farmUuid, farmCreatedAt]);

  // 컴포넌트 초기화 및 데이터 로딩
  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 목장 정보 먼저 가져오기
        await fetchFarmInfo();
        
        if (!isMounted) return;
        
        // 신뢰도 내역과 목록을 병렬로 조회
        await Promise.all([
          fetchScoreHistory(selectedYear),
          fetchScoreHistoryList(selectedYear, selectedMonth || undefined)
        ]);
      } catch (error) {
        console.error('데이터 초기화 실패:', error);
        if (isMounted) {
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initializeData();
    
    return () => {
      isMounted = false;
    };
  }, [farmUuid, selectedYear, selectedMonth]);

  // 월 변경 시 상세 내역만 다시 조회
  useEffect(() => {
    if (selectedMonth !== null) {
      fetchScoreHistoryList(selectedYear, selectedMonth);
    } else {
      fetchScoreHistoryList(selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
    setSelectedMonth(null); // 년도 변경 시 월 선택 초기화
    setCurrentPage(1); // 년도 변경 시 첫 페이지로 리셋
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

  const handleMonthChange = (month: number | null) => {
    setSelectedMonth(month);
    setCurrentPage(1); // 월 변경 시 첫 페이지로 리셋
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  // 현재 점수 계산 (최신 데이터 기준) - 메모이제이션
  const currentScoreValue = useMemo(() => {
    if (currentScore !== undefined) return currentScore;
    if (scoreHistory.length > 0) {
      const latestScore = scoreHistory[scoreHistory.length - 1];
      return latestScore.avgScore;
    }
    return 0;
  }, [currentScore, scoreHistory]);

  // 점수에 따른 색상 결정 - 메모이제이션
  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }, []);

  // 카테고리 ID를 한글 이름으로 매핑 - 메모이제이션
  const categoryNameMap = useMemo(() => ({
    "farm_photo": "목장 사진 업로드",
    "horse_photo": "전체 말 사진 업로드",
    "receipt": "영수증 증빙",
    "not_uploaded": "미업로드"
  }), []);

  const getCategoryName = (category: string) => {
    return categoryNameMap[category as keyof typeof categoryNameMap] || category;
  };



  // 정렬된 신뢰도 상세 내역 (최신순) - 메모이제이션
  const sortedScoreHistoryList = useMemo(() => {
    return [...scoreHistoryList].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [scoreHistoryList]);

  // 페이지네이션된 데이터 - 메모이제이션
  const paginatedData = useMemo(() => {
    const totalItems = sortedScoreHistoryList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sortedScoreHistoryList.slice(startIndex, endIndex);
    
    return { currentItems, totalItems, totalPages };
  }, [sortedScoreHistoryList, currentPage, itemsPerPage]);


  if (loading) {
    return (
      <section id="panel-trust" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            신뢰도 내역
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">신뢰도 내역을 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="panel-trust" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            신뢰도 내역
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => fetchScoreHistory(selectedYear)}
            variant="outline"
          >
            다시 시도
          </Button>
        </div>
      </section>
    );
  }


  return (
    <section id="panel-trust" className="space-y-4">
      {/* 신뢰도 내역 차트 */}
      <TrustScoreChart 
        scoreHistory={scoreHistory}
        selectedYear={selectedYear === 'all' ? new Date().getFullYear() : selectedYear}
        currentScore={currentScoreValue}
      />
      
      {/* 신뢰도 상세 목록 */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <h4 className="text-lg font-semibold">
              신뢰도 상세 내역 {selectedMonth ? `(${selectedMonth}월)` : ''}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">전체</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedMonth || ''}
              onChange={(e) => handleMonthChange(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="">전체</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>
        </div>
        
        {(() => {
          const { currentItems, totalItems, totalPages } = paginatedData;
          return totalItems > 0 ? (
            <>
              <div className="space-y-3">
                {currentItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {getCategoryName(item.category)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-row items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {item.delta > 0 ? '+' : ''}{item.delta}점
                          </p>
                        </div>
                        <div className="text-right flex flex-row items-center">
                          <p className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                            {item.score.toFixed(1)}
                          </p>
                          <p className="text-sm text-gray-500">점</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 mt-6">
                  <div className="text-sm text-gray-500">
                    총 {totalItems}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}개 표시
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      이전
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      다음
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {selectedYear === 'all' 
                  ? '신뢰도 상세 내역이 없습니다.'
                  : selectedMonth 
                    ? `${selectedYear}년 ${selectedMonth}월의 신뢰도 상세 내역이 없습니다.`
                    : `${selectedYear}년의 신뢰도 상세 내역이 없습니다.`
                }
              </p>
            </div>
          );
        })()}
      </div>
      
    </section>
  );
}
