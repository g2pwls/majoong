"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FarmService } from "@/services/farmService";
import { MonthlyReportDetail } from "@/types/farm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Star, FileText, ChevronLeft, ChevronRight, Flag } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);

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

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePageChange('prev');
      } else if (event.key === 'ArrowRight') {
        handlePageChange('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, isFlipping]);

  // 보고서 내용을 페이지별로 나누는 함수 (페이지 높이 기준)
  const splitContentIntoPages = (content: string) => {
    if (!content) return [];
    
    console.log('=== 문단 분할 디버깅 시작 ===');
    console.log('원본 내용:', content.substring(0, 200) + '...');
    
    // 페이지 높이 기준으로 분할
    const pages = [];
    const paragraphs = content.split(/(<\/p>|<\/div>|<\/br>|<\/h[1-6]>)/);
    
    console.log('분할된 문단들:', paragraphs.length);
    console.log('문단 내용들:', paragraphs.map((p, i) => `${i}: ${p.substring(0, 50)}...`));
    
    let currentPage = '';
    let currentParagraphCount = 0;
    
    // 페이지당 최대 문단 수 (페이지 높이에 맞게 조정)
    const maxParagraphsPerPage = 2; // 더 적게 설정하여 페이지 분할 강화
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      if (!paragraph || paragraph.trim() === '') continue;
      
      // 문단이 완전한지 확인 (닫는 태그가 있는지)
      const isCompleteParagraph = paragraph.includes('</p>') || 
                                 paragraph.includes('</div>') || 
                                 paragraph.includes('</h1>') || 
                                 paragraph.includes('</h2>') || 
                                 paragraph.includes('</h3>') || 
                                 paragraph.includes('</h4>') || 
                                 paragraph.includes('</h5>') || 
                                 paragraph.includes('</h6>') ||
                                 paragraph.includes('</br>');
      
      console.log(`문단 ${i}: 완전한 문단? ${isCompleteParagraph}, 내용: ${paragraph.substring(0, 30)}...`);
      
      if (isCompleteParagraph) {
        currentPage += paragraph;
        currentParagraphCount++;
        console.log(`현재 페이지 문단 수: ${currentParagraphCount}`);
        
        // 페이지가 가득 찼으면 새 페이지 시작
        if (currentParagraphCount >= maxParagraphsPerPage) {
          if (currentPage.trim()) {
            console.log(`페이지 ${pages.length + 1} 완성:`, currentPage.substring(0, 100) + '...');
            pages.push(currentPage);
            currentPage = '';
            currentParagraphCount = 0;
          }
        }
      } else {
        // 완전하지 않은 문단은 현재 페이지에 추가
        currentPage += paragraph;
        console.log(`불완전한 문단 추가: ${paragraph.substring(0, 30)}...`);
      }
    }
    
    // 마지막 페이지 추가
    if (currentPage.trim()) {
      console.log(`마지막 페이지 완성:`, currentPage.substring(0, 100) + '...');
      pages.push(currentPage);
    }
    
    console.log('최종 페이지 수:', pages.length);
    console.log('=== 문단 분할 디버깅 끝 ===');
    
    // 페이지가 없거나 1개뿐이면 강제로 분할
    if (pages.length <= 1) {
      console.log('강제 페이지 분할 실행');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // 500자씩 강제로 나누기
      const chunkSize = 500;
      const chunks = [];
      
      for (let i = 0; i < textContent.length; i += chunkSize) {
        const chunk = textContent.substring(i, i + chunkSize);
        chunks.push(`<p>${chunk}</p>`);
      }
      
      console.log('강제 분할된 청크 수:', chunks.length);
      return chunks;
    }
    
    return pages;
  };

  const contentPages = report ? splitContentIntoPages(report.content) : [];
  const totalPages = Math.max(1, Math.ceil(contentPages.length / 2)); // 2페이지씩 보여줌
  
  // 디버깅을 위한 로그
  console.log('=== 페이지 높이 기준 분할 디버깅 ===');
  console.log('원본 내용 길이:', report?.content?.length || 0);
  console.log('분할된 페이지 수:', contentPages.length);
  console.log('각 페이지 문단 수:', contentPages.map((page, index) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = page;
    const paragraphs = tempDiv.textContent?.split(/\n\s*\n/) || [];
    return `${index + 1}페이지: ${paragraphs.length}문단`;
  }));
  console.log('전체 페이지 수:', totalPages);
  console.log('현재 페이지:', currentPage);
  console.log('왼쪽 페이지 내용:', contentPages[(currentPage - 1) * 2]?.substring(0, 100) + '...');
  console.log('오른쪽 페이지 내용:', contentPages[(currentPage - 1) * 2 + 1]?.substring(0, 100) + '...');

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    
    setTimeout(() => {
      if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else if (direction === 'next' && currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      }
      setIsFlipping(false);
    }, 300);
  };

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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
      {/* 브레드크럼과 소식지 목록으로 돌아가기 버튼 */}
      <div className="py-4 flex items-center justify-between">
        <Breadcrumbs items={[
          { label: getUserRole() === 'FARMER' ? "전체목장" : "목장후원", href: "/support" }, 
          { label: farm.farm_name, href: `/support/${farm_uuid}` },
          { label: "월간 소식지", href: `/support/${farm_uuid}?tab=newsletter` },
          { label: `${report.year}년 ${report.month}월 보고서` }
        ]} />
        
        <button
          onClick={() => router.push(`/support/${farm_uuid}?tab=newsletter`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          소식지 목록으로 돌아가기
        </button>
      </div>

      {/* 책 스타일 보고서 내용 */}
      <div className="mt-0">
        <div className="flex max-w-6xl mx-auto perspective-1000 gap-0.5 focus-within:outline-none md:flex-row flex-col md:gap-0.5 gap-4">
          {/* 첫 번째 페이지 (표지 또는 내용) */}
          <div className={`flex-1 h-[600px] md:h-[650px] max-h-[600px] md:max-h-[700px] relative overflow-hidden transition-transform duration-300 ease-in-out ${
            currentPage === 0 
              ? 'bg-gradient-to-br from-slate-50 to-slate-200 border-r-2 border-slate-300' 
              : 'bg-white border-l border-gray-300'
          } ${isFlipping ? '-rotate-y-5' : ''} shadow-lg`}>
            <div className={`p-6 md:p-8 h-full overflow-y-hidden flex flex-col ${
              currentPage === 0 ? 'justify-center items-center' : ''
            }`}>
              {currentPage === 0 ? (
                // 표지 페이지
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    {report.year}년 {report.month}월
                  </h1>
                  <h2 className="text-2xl font-semibold text-gray-600 mb-8">
                    월간 소식지
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <FileText className="h-6 w-6" />
                    <span className="text-lg">{farm.farm_name}</span>
                  </div>
                  
                  {/* 썸네일 이미지 */}
                  {report.thumbnail && (
                    <div className="mt-8">
                      <Image
                        src={report.thumbnail}
                        alt={`${report.year}년 ${report.month}월 보고서 썸네일`}
                        width={400}
                        height={300}
                        className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                </div>
              ) : (
                // 내용 페이지 (왼쪽) - 2페이지부터 시작
                <div className="space-y-4">
                  <div className="text-center border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {report.year}년 {report.month}월 소식
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      페이지 {(currentPage - 1) * 2 + 1}
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none flex-1 overflow-y-auto">
                    <div 
                      className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: contentPages[(currentPage - 1) * 2 + 1] || '내용이 없습니다.' 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 두 번째 페이지 (내용) */}
          <div className={`flex-1 h-[600px] md:h-[650px] max-h-[600px] md:max-h-[700px] bg-white border-l border-gray-300 relative overflow-hidden transition-transform duration-300 ease-in-out shadow-lg ${isFlipping ? '-rotate-y-5' : ''}`}>
            <div className="p-6 md:p-8 h-full overflow-y-hidden flex flex-col">
              {currentPage === 0 ? (
                // 첫 번째 내용 페이지 (오른쪽) - 2페이지 왼쪽 내용을 여기에 표시
                <div className="space-y-6">
                  <div className="text-center border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {report.year}년 {report.month}월 소식
                      </h3>
                      <button
                        onClick={() => !isReportSubmitted && setShowReportModal(true)}
                        disabled={isReportSubmitted}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          isReportSubmitted 
                            ? 'text-green-600 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-800 hover:underline'
                        }`}
                        title={isReportSubmitted ? "신고완료" : "신고하기"}
                      >
                        <Flag className="h-4 w-4" />
                        {isReportSubmitted ? '신고완료' : '신고하기'}
                      </button>
                    </div>
                    <div className="flex= justify-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>생성일: {new Date(report.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none flex-1 overflow-y-auto">
                    <div 
                      className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: contentPages[0] || '' 
                      }}
                    />
                  </div>
                </div>
              ) : (
                // 일반 내용 페이지 (오른쪽) - 2페이지부터 시작
                <div className="space-y-4">
                  <div className="text-center border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {report.year}년 {report.month}월 소식
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      페이지 {(currentPage - 1) * 2 + 2}
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none flex-1 overflow-y-auto">
                    <div 
                      className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: contentPages[(currentPage - 1) * 2 + 2] || '내용이 없습니다.' 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 페이지 네비게이션 */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 0 || isFlipping}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            이전 페이지
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{currentPage + 1} / {totalPages}</span>
          </div>
          
          <Button
            onClick={() => handlePageChange('next')}
            disabled={currentPage >= totalPages - 1 || isFlipping}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            다음 페이지
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>


      {/* 신고 확인 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {!isReportSubmitted ? (
                // 신고 확인 화면
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <Flag className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    신고하시겠습니까?
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    이 보고서를 신고하시겠습니까?<br />
                    신고된 내용은 검토 후 조치됩니다.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        setIsReportSubmitted(true);
                        // 3초 후 자동으로 신고 페이지로 이동
                        setTimeout(() => {
                          setShowReportModal(false);
                          router.push(`/support/${farm_uuid}/report/${reportId}`);
                        }, 3000);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      신고하기
                    </button>
                  </div>
                </>
              ) : (
                // 신고 완료 화면
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    신고가 완료되었습니다
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    신고해주셔서 감사합니다.<br />
                    검토 후 조치하겠습니다.<br />
                    <span className="text-xs text-gray-400">이 창은 잠시 후 닫힙니다...</span>
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setShowReportModal(false);
                        router.push(`/support/${farm_uuid}/report/${reportId}`);
                      }}
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      닫기
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
