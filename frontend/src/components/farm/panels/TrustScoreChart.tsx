// src/components/farm/panels/TrustScoreChart.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ScoreHistory } from "@/types/farm";

interface TrustScoreChartProps {
  scoreHistory: ScoreHistory[];
  selectedYear: number;
  currentScore: number;
  createdAt?: string; // 목장 생성일
}

// 점수에 따른 색상 결정
const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

// 선 그래프용 데이터 변환 (년도별 전체 데이터)
const getLineChartData = (scoreHistory: ScoreHistory[], selectedYear: number, createdAt?: string) => {
  // 1월부터 12월까지 모든 월의 데이터를 생성
  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const monthData = scoreHistory.find(item => item.month === month);
    
    // 신뢰도 데이터가 있으면 해당 점수 사용
    if (monthData) {
      return {
        month: `${month}월`,
        score: monthData.avgScore,
        year: selectedYear
      };
    }
    
    // 신뢰도 데이터가 없고, 생성일이 있는 경우
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const createdYear = createdDate.getFullYear();
      const createdMonth = createdDate.getMonth() + 1; // getMonth()는 0부터 시작
      
      // 생성된 년도와 월이 현재 선택된 년도와 월과 정확히 일치하는 경우에만 38.2 표시
      if (createdYear === selectedYear && month === createdMonth) {
        return {
          month: `${month}월`,
          score: 38.2,
          year: selectedYear
        };
      }
    }
    
    // 그 외의 경우는 null (데이터 없음)
    return {
      month: `${month}월`,
      score: null,
      year: selectedYear
    };
  });

  return monthlyData;
};

export default function TrustScoreChart({ scoreHistory, selectedYear, currentScore, createdAt }: TrustScoreChartProps) {
  const lineChartData = getLineChartData(scoreHistory, selectedYear, createdAt);

  return (
    <Card>
      <CardContent className="p-6 py-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold">{selectedYear}년 신뢰도 평균 변화</h4>
            <span className="text-sm text-red-500 font-medium">기준 38.2°C</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">현재 신뢰도</p>
            <p className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>
              {currentScore.toFixed(1)}점
            </p>
          </div>
        </div>
        
        {scoreHistory.length > 0 || (createdAt && lineChartData.some(item => item.score !== null)) ? (
          <div className="space-y-4">
            {/* 선 그래프 */}
            <div className="h-59">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `${value}점`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value?.toFixed(1) || 'N/A'}점`, '신뢰도']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <ReferenceLine 
                    y={38} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 text-gray-400 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8" />
            </div>
            <p className="text-gray-500">해당 연도의 신뢰도 내역이 없습니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
