// src/components/farm/panels/NewsletterPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { FarmService } from "@/services/farmService";
import { MonthlyReport } from "@/types/farm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Star } from "lucide-react";

interface NewsletterPanelProps {
  farmId: string;
}

export default function NewsletterPanel({ farmId }: NewsletterPanelProps) {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 월간 보고서 조회
  const fetchMonthlyReports = async (year: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await FarmService.getMonthlyReports(farmId, year);
      setReports(response.result);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "월간 보고서를 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReports(selectedYear);
  }, [farmId, selectedYear]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  if (loading) {
    return (
      <section id="panel-newsletter" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            월간 소식지
          </h3>
        </div>
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            월간 소식지
          </h3>
        </div>
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
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          월간 소식지
        </h3>
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
        </div>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">해당 연도의 월간 보고서가 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report.reportId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* 썸네일 이미지 */}
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {report.thumbnail ? (
                      <img
                        src={report.thumbnail}
                        alt={`${report.year}년 ${report.month}월 보고서`}
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
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{report.score}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>보고서 ID: {report.reportId}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      // TODO: 보고서 상세 보기 구현
                      console.log('보고서 상세 보기:', report.reportId);
                    }}
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
