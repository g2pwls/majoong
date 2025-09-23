// src/components/farm/panels/TrustPanel.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { FarmService } from "@/services/farmService";
import { ScoreHistory, ScoreHistoryItem } from "@/types/farm";
import { Button } from "@/components/ui/button";
import { Calendar, Shield } from "lucide-react";
import TrustScoreChart from "./TrustScoreChart";

interface TrustPanelProps {
  farmId: string;
  currentScore?: number;
}

export default function TrustPanel({ farmId, currentScore }: TrustPanelProps) {
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [scoreHistoryList, setScoreHistoryList] = useState<ScoreHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // null이면 전체, 숫자면 해당 월
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 신뢰도 내역 조회 (월별 평균)
  const fetchScoreHistory = useCallback(async (year: number, month?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('신뢰도 내역 조회 시작:', { farmId, year, month });
      const response = await FarmService.getScoreHistory(farmId, year, month);
      console.log('신뢰도 내역 조회 성공:', response);
      setScoreHistory(response.result);
    } catch (e: unknown) {
      console.error('신뢰도 내역 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "신뢰도 내역을 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  // 신뢰도 목록 조회 (상세 내역)
  const fetchScoreHistoryList = useCallback(async (year?: number, month?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('신뢰도 목록 조회 시작:', { farmId, year, month });
      const response = await FarmService.getScoreHistoryList(farmId, year, month);
      console.log('신뢰도 목록 조회 성공:', response);
      setScoreHistoryList(response.result);
    } catch (e: unknown) {
      console.error('신뢰도 목록 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "신뢰도 목록을 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  // 년도 변경 시 그래프 데이터와 상세 내역 조회
  useEffect(() => {
    fetchScoreHistory(selectedYear);
    fetchScoreHistoryList(selectedYear, selectedMonth || undefined);
  }, [farmId, selectedYear, fetchScoreHistory, fetchScoreHistoryList, selectedMonth]);

  // 월 변경 시 상세 내역만 다시 조회
  useEffect(() => {
    if (selectedMonth !== null) {
      fetchScoreHistoryList(selectedYear, selectedMonth);
    } else {
      fetchScoreHistoryList(selectedYear);
    }
  }, [selectedMonth, fetchScoreHistoryList, selectedYear]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedMonth(null); // 년도 변경 시 월 선택 초기화
    setCurrentPage(1); // 년도 변경 시 첫 페이지로 리셋
  };

  const handleMonthChange = (month: number | null) => {
    setSelectedMonth(month);
    setCurrentPage(1); // 월 변경 시 첫 페이지로 리셋
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  // 현재 점수 계산 (최신 데이터 기준)
  const getCurrentScore = () => {
    if (currentScore !== undefined) return currentScore;
    if (scoreHistory.length > 0) {
      const latestScore = scoreHistory[scoreHistory.length - 1];
      return latestScore.avgScore;
    }
    return 0;
  };

  // 점수에 따른 색상 결정
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };


  // 카테고리별 점수 매핑
  const getCategoryScore = (category: string) => {
    const categoryScores: { [key: string]: number } = {
      'farm_photo': 1,
      'horse_photo': 5,
      'receipt': 1,
      'not_uploaded': -5
    };
    return categoryScores[category] || 0;
  };

  // 정렬된 신뢰도 상세 내역 (최신순)
  const getSortedScoreHistoryList = () => {
    return [...scoreHistoryList].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // 페이지네이션된 데이터
  const getPaginatedData = () => {
    const sortedData = getSortedScoreHistoryList();
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sortedData.slice(startIndex, endIndex);
    
    return { currentItems, totalItems, totalPages };
  };


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

  const currentScoreValue = getCurrentScore();

  return (
    <section id="panel-trust" className="space-y-4">
      {/* 신뢰도 내역 차트 */}
      <TrustScoreChart 
        scoreHistory={scoreHistory}
        selectedYear={selectedYear}
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
              value={selectedMonth || ''}
              onChange={(e) => handleMonthChange(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="">전체</option>
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
        
        {(() => {
          const { currentItems, totalItems, totalPages } = getPaginatedData();
          return totalItems > 0 ? (
            <>
              <div className="space-y-3">
                {currentItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {item.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-row items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {getCategoryScore(item.category) > 0 ? '+' : ''}{getCategoryScore(item.category)}점
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
                <div className="flex items-center justify-between mt-6">
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
                {selectedMonth 
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
