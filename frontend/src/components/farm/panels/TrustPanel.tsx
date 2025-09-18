// src/components/farm/panels/TrustPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { FarmService } from "@/services/farmService";
import { ScoreHistoryResponse, ScoreHistory, ScoreHistoryListResponse, ScoreHistoryItem } from "@/types/farm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Shield, TrendingUp, Star } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<'chart' | 'list'>('chart');

  // 신뢰도 내역 조회 (월별 평균)
  const fetchScoreHistory = async (year: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('신뢰도 내역 조회 시작:', { farmId, year });
      const response = await FarmService.getScoreHistory(farmId, year);
      console.log('신뢰도 내역 조회 성공:', response);
      setScoreHistory(response.result);
    } catch (e: unknown) {
      console.error('신뢰도 내역 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "신뢰도 내역을 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 신뢰도 목록 조회 (상세 내역)
  const fetchScoreHistoryList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('신뢰도 목록 조회 시작:', { farmId });
      const response = await FarmService.getScoreHistoryList(farmId);
      console.log('신뢰도 목록 조회 성공:', response);
      setScoreHistoryList(response.result);
    } catch (e: unknown) {
      console.error('신뢰도 목록 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "신뢰도 목록을 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'chart') {
      fetchScoreHistory(selectedYear);
    } else {
      fetchScoreHistoryList();
    }
  }, [farmId, selectedYear, activeTab]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleTabChange = (tab: 'chart' | 'list') => {
    setActiveTab(tab);
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

  // 점수에 따른 배경 색상 결정
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          신뢰도 내역
        </h3>
        <div className="flex items-center gap-2">
          {activeTab === 'chart' && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => handleTabChange('chart')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'chart'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          월별 차트
        </button>
        <button
          onClick={() => handleTabChange('list')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="h-4 w-4 inline mr-2" />
          상세 목록
        </button>
      </div>

      {/* 신뢰도 내역 차트 */}
      {activeTab === 'chart' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h4 className="text-lg font-semibold">{selectedYear}년 신뢰도 변화</h4>
            </div>
            
            {scoreHistory.length > 0 ? (
              <div className="space-y-4">
                {/* 월별 점수 표시 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {scoreHistory.map((score, index) => (
                    <div key={index} className="text-center">
                      <div className={`p-3 rounded-lg ${getScoreBgColor(score.avgScore)}`}>
                        <p className="text-sm text-gray-600">{score.month}월</p>
                        <p className={`text-xl font-bold ${getScoreColor(score.avgScore)}`}>
                          {score.avgScore.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 간단한 차트 (막대 그래프) */}
                <div className="mt-6">
                  <div className="flex items-end justify-between h-32 gap-1">
                    {scoreHistory.map((score, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-full rounded-t ${getScoreBgColor(score.avgScore)}`}
                          style={{ height: `${(score.avgScore / 100) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-1">{score.month}월</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">해당 연도의 신뢰도 내역이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 신뢰도 상세 목록 */}
      {activeTab === 'list' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-semibold">신뢰도 상세 내역</h4>
            </div>
            
            {scoreHistoryList.length > 0 ? (
              <div className="space-y-3">
                {scoreHistoryList.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {item.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          소스 ID: {item.sourceId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                          {item.score.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-500">점</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">신뢰도 상세 내역이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* 현재 신뢰도 점수 */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getScoreBgColor(currentScoreValue)}`}>
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium">현재 신뢰도</span>
            </div>
            <div className="mt-4">
              <p className={`text-4xl font-bold ${getScoreColor(currentScoreValue)}`}>
                {currentScoreValue.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 mt-1">점</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
