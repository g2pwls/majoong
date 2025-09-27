"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FarmService } from "@/services/farmService";
import { MonthlyReportDetail } from "@/types/farm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Star, FileText } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumb";
import { getFarm, Farm } from "@/services/apiService";
import { getUserRole } from "@/services/authService";

type PageProps = { 
  params: Promise<{ 
    farm_uuid: string; 
    reportId: string; 
  }>
};

export default function MonthlyReportDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { farm_uuid, reportId } = use(params);
  
  const [farm, setFarm] = useState<Farm | null>(null);
  const [report, setReport] = useState<MonthlyReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 농장 정보 조회
  const fetchFarm = useCallback(async () => {
    try {
      const data = await getFarm(farm_uuid);
      console.log('농장 정보 조회 성공:', data);
      setFarm(data);
    } catch (e) {
      console.error('농장 정보 조회 실패:', e);
    }
  }, [farm_uuid]);

  // 월간 보고서 상세 조회
  const fetchReportDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('월간 보고서 상세 조회 시작:', { farm_uuid, reportId });
      const response = await FarmService.getMonthlyReportDetail(farm_uuid, parseInt(reportId));
      console.log('월간 보고서 상세 조회 성공:', response);
      setReport(response.result);
    } catch (e: unknown) {
      console.error('월간 보고서 상세 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "월간 보고서를 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [farm_uuid, reportId]);

  useEffect(() => {
    fetchFarm();
    fetchReportDetail();
  }, [fetchFarm, fetchReportDetail]);

  if (loading) {
    return (
      <div className="mx-auto  p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">월간 보고서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={fetchReportDetail}
            variant="outline"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!report || !farm) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">보고서를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-6xl px-0 p-4">
      {/* 브레드크럼 */}
      <Breadcrumbs items={[
        { label: getUserRole() === 'FARMER' ? "전체목장" : "목장후원", href: "/support" }, 
        { label: farm.farm_name, href: `/support/${farm_uuid}` },
        { label: "월간 소식지", href: `/support/${farm_uuid}?tab=newsletter` },
        { label: `${report.year}년 ${report.month}월 보고서` }
      ]} />

      {/* 보고서 내용 */}
      <div className="mt-4">
        {/* 소식지 목록으로 돌아가기 버튼 */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => router.push(`/support/${farm_uuid}?tab=newsletter`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            소식지 목록으로 돌아가기
          </Button>
        </div>

        {/* 보고서 내용 */}
        <section>
          <Card>
            <CardContent className="p-6">
              {/* 보고서 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    {report.year}년 {report.month}월 소식지
                  </h2>
                </div>

                {/* 신뢰도 점수 */}
                <div className="flex items-center gap-2 mb-6 p-4 bg-blue-50 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-semibold">신뢰도 점수</span>
                    <span className="text-2xl font-bold text-blue-600">{report.score}</span>
                </div>
              </div>

              {/* 썸네일 이미지 */}
              {report.thumbnail && (
                <div className="mb-6">
                  <Image
                    src={report.thumbnail}
                    alt={`${report.year}년 ${report.month}월 보고서 썸네일`}
                    width={800}
                    height={600}
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* 보고서 내용 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  보고서 내용
                </h3>
                <div className="prose max-w-none">
                  <div 
                    className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: report.content }}
                  />
                </div>
              </div>

              {/* 생성/수정 일시 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>생성일: {new Date(report.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
