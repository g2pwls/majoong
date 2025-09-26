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

  const handleViewReport = (reportId: number) => {
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
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">전체</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report.reportId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 py-0">
                <div className="space-y-3">
                  {/* 썸네일 이미지 */}
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {report.thumbnail ? (
                      <Image
                        src={report.thumbnail}
                        alt={`${report.year}년 ${report.month}월 보고서`}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* 보고서 정보 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">
                        {report.year}년 {report.month}월 보고서
                      </h4>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{report.score}</span>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewReport(report.reportId)}
                  >
                    보고서 보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
