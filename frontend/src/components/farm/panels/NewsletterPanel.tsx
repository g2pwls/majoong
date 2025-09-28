// src/components/farm/panels/NewsletterPanel.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FarmService } from "@/services/farmService";
import { MonthlyReport } from "@/types/farm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";
import Image from "next/image";

// 책 너비 스타일 매핑
const getBookWidthStyle = (index: number) => {
  const widths = [
    '3.5rem', // report-0
    '3.2rem', // report-1
    '3.8rem', // report-2
    '3rem',   // report-3
    '3.5rem', // report-4
    '3.2rem', // report-5
  ];
  return { width: widths[index % 6] };
};

// 책 스타일 클래스 매핑
const getBookStyleClass = (index: number) => {
  const styleClasses = [
    'text-orange-600', // report-0
    'text-gray-200', // report-1
    'text-gray-800', // report-2
    'text-yellow-100', // report-3
    'text-red-200', // report-4
    'text-gray-700', // report-5
  ];
  return styleClasses[index % 6];
};

// 책 그라데이션 배경 생성
const getBookGradientBackground = (index: number) => {
  const gradients = [
    'radial-gradient(ellipse at top, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.75)), radial-gradient(ellipse at bottom, rgba(70, 70, 70, 0.5), transparent)',
    'radial-gradient(ellipse at top, rgba(50, 10, 87, 0.55), rgba(0, 0, 0, 0.75)), radial-gradient(ellipse at bottom, rgba(70, 70, 70, 0.5), transparent)',
    'radial-gradient(ellipse at top, rgba(189, 147, 189, 0.55), rgba(0, 0, 0, 0.85)), radial-gradient(ellipse at bottom, rgba(185, 154, 154, 0.5), transparent)',
    'radial-gradient(ellipse at top, rgba(2, 95, 18, 0.55), rgba(0, 0, 0, 0.75)), radial-gradient(ellipse at bottom, rgba(70, 70, 70, 0.5), transparent)',
    'radial-gradient(ellipse at top, rgba(94, 15, 6, 0.76), rgba(0, 0, 0, 0.75)), radial-gradient(ellipse at bottom, rgba(70, 70, 70, 0.5), transparent)',
    'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.63), rgba(0, 0, 0, 0.75)), radial-gradient(ellipse at bottom, rgba(70, 70, 70, 0.5), transparent)',
  ];
  return gradients[index % 6];
};

interface NewsletterPanelProps {
  farmUuid: string;
}

export default function NewsletterPanel({ farmUuid }: NewsletterPanelProps) {
  const router = useRouter();
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  
  // 목장 정보와 동적 년도 범위
  const [farmCreatedAt, setFarmCreatedAt] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // 목장 정보 가져오기 및 년도 범위 설정
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
      }
    } catch (error) {
      console.error('목장 정보 조회 실패:', error);
    }
  }, [farmUuid]);

  // 월간 보고서 조회
  const fetchMonthlyReports = useCallback(async (year: number | 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      if (year === 'all') {
        // 전체 년도 조회 - 모든 년도의 데이터를 수집
        console.log('전체 년도 월간 보고서 조회 시작:', { farmUuid });
        const allReports: MonthlyReport[] = [];
        
        // 목장 생성일부터 현재까지 각 년도의 데이터를 가져옴
        const createdDate = farmCreatedAt ? new Date(farmCreatedAt) : new Date('2021-01-01');
        const currentDate = new Date();
        for (let y = createdDate.getFullYear(); y <= currentDate.getFullYear(); y++) {
          try {
            console.log(`${y}년 월간 보고서 조회 중...`);
            const response = await FarmService.getMonthlyReports(farmUuid, y);
            if (response.result && response.result.length > 0) {
              console.log(`${y}년 월간 보고서 ${response.result.length}개 추가`);
              allReports.push(...response.result);
            }
          } catch (error) {
            console.warn(`${y}년 월간 보고서 조회 실패:`, error);
            // 해당 년도 데이터가 없어도 계속 진행
          }
        }
        
        console.log('전체 년도 월간 보고서 수집 완료:', { totalReports: allReports.length });
        
        // 최신순으로 정렬 (년도 내림차순, 월 내림차순)
        const sortedReports = allReports.sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year; // 년도 내림차순
          }
          return b.month - a.month; // 월 내림차순
        });
        
        setReports(sortedReports);
      } else {
        console.log('월간 보고서 조회 시작:', { farmUuid, year });
        const response = await FarmService.getMonthlyReports(farmUuid, year);
        console.log('월간 보고서 조회 성공:', response);
        
        // 최신순으로 정렬 (월 내림차순)
        const sortedReports = response.result.sort((a, b) => b.month - a.month);
        setReports(sortedReports);
      }
    } catch (e: unknown) {
      console.error('월간 보고서 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "월간 보고서를 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [farmUuid]);

  useEffect(() => {
    const initializeData = async () => {
      // 목장 정보 먼저 가져오기
      await fetchFarmInfo();
      // 월간 보고서 조회
      await fetchMonthlyReports(selectedYear);
    };
    
    initializeData();
  }, [farmUuid, selectedYear, fetchMonthlyReports, fetchFarmInfo]);

  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
  };

  const handleBookClick = (reportId: number, index: number) => {
    // 바로 리포트 페이지로 이동
    router.push(`/support/${farmUuid}/report/${reportId}`);
  };

  if (loading) {
    return (
      <section id="panel-newsletter" className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">월간 보고서를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="panel-newsletter" className="space-y-4">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => fetchMonthlyReports(selectedYear)}
            variant="outline"
          >
            다시 시도
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="panel-newsletter" className="space-y-4">
      <div className="flex items-center justify-between">
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
              <option value="all">전체 연도</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
        </div>
      </div>

    {reports.length === 0 ? (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {selectedYear === 'all' 
              ? '월간 보고서가 없습니다.' 
              : '해당 연도의 월간 보고서가 없습니다.'
            }
          </p>
        </CardContent>
      </Card>
    ) : (
      <div className="flex justify-center pt-8 min-h-[300px] rounded-xl p-8">
        <div className="flex justify-center flex-wrap gap-2 max-w-full">
          {reports.map((report, index) => (
            <div 
              key={report.reportId} 
              className="
                overflow-hidden h-72 m-px cursor-pointer 
                transition-all duration-300 ease-in-out
                grayscale-[15%] rounded
                bg-gray-500 shadow-[0_0.5rem_1rem_0rem_rgba(0,0,0,0.4)]
                border-t border-solid
                hover:shadow-[0_0.5rem_3rem_-0.5rem_rgba(0,0,0,0.4)]
                hover:z-10 hover:-mt-4 hover:scale-[1.03]
              "
              onClick={() => handleBookClick(report.reportId, index)}
              style={{
                ...getBookWidthStyle(index),
                borderImage: 'linear-gradient(to right, #333, #333 15%, antiquewhite 30%, antiquewhite 70%, #333 85%, #333) 1'
              }}
            >
              <div 
                className={`
                  flex h-full w-full justify-center items-center
                  relative
                  shadow-[inset_-0.35rem_0_0.5rem_rgba(0,0,0,0.4),inset_0.35rem_0_0.5rem_rgba(0,0,0,0.4)]
                  ${getBookStyleClass(index)}
                `}
                style={{
                  writingMode: 'vertical-rl',
                  backgroundImage: report.thumbnail 
                    ? `url(${report.thumbnail})` 
                    : getBookGradientBackground(index),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <h1 
                  className="text-sm font-bold text-white text-center m-0 p-3 tracking-wider"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'upright',
                    textShadow: '0 0 0.5rem rgba(0, 0, 0, 0.8)'
                  }}
                >
                  {report.year}년 {report.month}월
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    </section>
  );
}
