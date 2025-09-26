// src/app/support/[farm_uuid]/[horseNo]/[wreportId]/page.tsx
"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FarmService } from "@/services/farmService";
import { Card, CardContent } from "@/components/ui/card";
import { getUserRole } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, AlertTriangle } from "lucide-react";

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
import Breadcrumbs from "@/components/common/Breadcrumb";

type PageProps = { 
  params: Promise<{ 
    farm_uuid: string; 
    horseNo: string;
    wreportId: string;
  }>
};

// 주간 보고서 상세 타입 정의 (API 응답 구조에 맞게 수정)
type WeeklyReportDetail = {
  frontImage?: string;
  leftSideImage?: string;
  rightSideImage?: string;
  stableImage?: string;
  aiSummary?: string;
  content?: string;
  uploadedAt?: string;
};

type Farm = {
  id: string;
  farm_name: string;
  total_score: number;
  image_url?: string;
  name?: string;
  address?: string;
  farm_phone?: string;
  area?: number | string;
  horse_count?: number;
  description?: string;
};

export default function WeeklyReportDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { farm_uuid, horseNo, wreportId } = use(params);
  
  const [farm, setFarm] = useState<Farm | null>(null);
  const [report, setReport] = useState<WeeklyReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 농장 정보 조회
  const fetchFarm = useCallback(async () => {
    try {
      const data = await FarmService.getFarm(farm_uuid);
      console.log('농장 정보 조회 성공:', data);
      setFarm(data);
    } catch (e) {
      console.error('농장 정보 조회 실패:', e);
    }
  }, [farm_uuid]);

  // 주간 보고서 상세 조회
  const fetchReportDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('주간 보고서 상세 조회 시작:', { horseNo, wreportId });
      const response = await FarmService.getHorseWeeklyReportDetail(horseNo, parseInt(wreportId));
      console.log('주간 보고서 상세 조회 성공:', response);
      setReport(response.result);
    } catch (e: unknown) {
      console.error('주간 보고서 상세 조회 실패:', e);
      const errorMessage = e instanceof Error ? e.message : "주간 보고서를 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [horseNo, wreportId]);

  useEffect(() => {
    fetchFarm();
    fetchReportDetail();
  }, [fetchFarm, fetchReportDetail]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">주간 보고서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">보고서를 찾을 수 없습니다</h3>
          <p className="text-gray-500 mb-4">요청하신 주간 보고서가 존재하지 않습니다.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-1 p-2">
      {/* 브레드크럼과 돌아가기 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <Breadcrumbs items={[
          { label: getUserRole() === 'FARMER' ? "전체목장" : "목장후원", href: "/support" }, 
          { label: farm?.farm_name || "농장", href: `/support/${farm_uuid}` },
          { label: `말 ${horseNo}번`, href: `/support/${farm_uuid}/${horseNo}` },
          { label: `주간 보고서 ${wreportId}` }
        ]} />
        
        <Button 
          onClick={() => router.back()} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          말 상세 페이지로 돌아가기
        </Button>
      </div>

      {/* 헤더 */}
      <div className="mb-4">
        
         <div className="bg-white rounded-lg shadow-sm border px-3 py-3">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                 <Calendar className="w-8 h-8 text-blue-600" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-gray-900">
                   주간 보고서 상세
                 </h1>
                 <p className="text-gray-600">
                   말 번호: {horseNo} | 업로드일: {report.uploadedAt ? formatDate(report.uploadedAt) : '정보 없음'}
                 </p>
               </div>
             </div>
             <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
               <AlertTriangle className="w-4 h-4" />
               신고하기
             </Button>
           </div>
         </div>
      </div>
 
      {/* 보고서 내용 */}
      <div className="space-y-6">
        {/* 이미지 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
           {/* 앞면 이미지 */}
           {report.frontImage && (
             <Card>
               <CardContent className="p-3 py-0">
                 <h3 className="text-sm font-medium mb-2">앞면</h3>
                 <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
                   <Image
                     src={report.frontImage}
                     alt="앞면 사진"
                     fill
                     className="object-contain"
                   />
                 </div>
               </CardContent>
             </Card>
           )}

           {/* 왼쪽 측면 이미지 */}
           {report.leftSideImage && (
             <Card>
               <CardContent className="p-3 py-0">
                 <h3 className="text-sm font-medium mb-2">왼쪽</h3>
                 <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
                   <Image
                     src={report.leftSideImage}
                     alt="왼쪽 측면 사진"
                     fill
                     className="object-contain"
                   />
                 </div>
               </CardContent>
             </Card>
           )}

           {/* 오른쪽 측면 이미지 */}
           {report.rightSideImage && (
             <Card>
               <CardContent className="p-3 py-0">
                 <h3 className="text-sm font-medium mb-2">오른쪽</h3>
                 <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
                   <Image
                     src={report.rightSideImage}
                     alt="오른쪽 측면 사진"
                     fill
                     className="object-contain"
                   />
                 </div>
               </CardContent>
             </Card>
           )}

           {/* 마구간 이미지 */}
           {report.stableImage && (
             <Card>
               <CardContent className="p-3 py-0">
                 <h3 className="text-sm font-medium mb-2">마구간</h3>
                 <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
                   <Image
                     src={report.stableImage}
                     alt="마구간 사진"
                     fill
                     className="object-contain"
                   />
                 </div>
               </CardContent>
             </Card>
           )}
         </div>

        {/* AI 요약 */}
        {report.aiSummary && (
          <Card className="mb-4">
            <CardContent className="p-6 py-0">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                AI 요약
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {report.aiSummary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 특이사항 */}
        {report.content && (
          <Card>
            <CardContent className="p-6 py-0">
              <h2 className="text-lg font-semibold mb-4">특이사항</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.content}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
