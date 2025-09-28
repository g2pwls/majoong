// src/app/support/[farm_uuid]/[horseNo]/page.tsx
"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Breadcrumbs from "@/components/common/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Trophy, MapPin, Phone } from "lucide-react";
import { FarmService } from "@/services/farmService";
import { HorseDetailResult } from "@/types/farm";
import { getUserRole } from "@/services/authService";

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
};

type PageProps = { 
  params: Promise<{ 
    farm_uuid: string; 
    horseNo: string; 
  }>
};

export default function HorseDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { farm_uuid, horseNo } = use(params);

  const [horse, setHorse] = useState<HorseDetailResult | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  
  // 목장 정보와 동적 년도/월 범위
  const [farmCreatedAt, setFarmCreatedAt] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);

  // 말 상세 정보 가져오기 (주간 보고서 포함)
  const fetchHorseDetail = useCallback(async (year: number | 'all', month: number | null) => {
    try {
      setLoading(true);
      setError(null);
      
      // 'all'이거나 null인 경우 현재 년월로 처리
      const targetYear = year === 'all' ? new Date().getFullYear() : year;
      const targetMonth = month || new Date().getMonth() + 1;
      
      const response = await FarmService.getHorseWeeklyReports(farm_uuid, horseNo, targetYear, targetMonth);
      setHorse(response.result);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "말 정보를 불러오는 중 오류가 발생했어요.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [farm_uuid, horseNo]);

  // 목장 정보 가져오기 및 년도/월 범위 설정
  const fetchFarmInfo = useCallback(async () => {
    try {
      const farmData = await FarmService.getFarm(farm_uuid);
      setFarm(farmData);
      
      if (farmData.created_at) {
        setFarmCreatedAt(farmData.created_at);
        
        // 목장 생성일부터 현재까지의 년도 범위 생성
        const createdDate = new Date(farmData.created_at);
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
    } catch (e: unknown) {
      console.error("Farm fetch error:", e);
    }
  }, [farm_uuid, selectedYear]);

  // 년도 변경 핸들러
  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
    setSelectedMonth(null); // 년도 변경 시 월 선택 초기화
  };

  // 월 변경 핸들러
  const handleMonthChange = (month: number | null) => {
    setSelectedMonth(month);
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

  useEffect(() => {
    fetchHorseDetail(selectedYear, selectedMonth);
    fetchFarmInfo();
  }, [fetchHorseDetail, fetchFarmInfo, selectedYear, selectedMonth]);

  const handleBack = () => {
    router.push(`/support/${farm_uuid}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">말 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-600 mb-4">{error || "말 정보를 찾을 수 없습니다."}</p>
          <Button onClick={handleBack}>목장으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
        {/* 브레드크럼 */}
        <Breadcrumbs
          items={[
            { label: getUserRole() === 'FARMER' ? "전체목장" : "목장후원", href: "/support" },
            { label: farm?.farm_name || "목장", href: `/support/${farm_uuid}` },
            { label: `${horse.horseNumber} ${horse.horseName}` },
          ]}
        />

        {/* 메인 콘텐츠 */}
        <div className="flex flex-row items-center justify-between mt-4">
          <h1 className="text-3xl font-bold"><span className="text-red-600">{horse.horseNumber}</span> {horse.horseName}</h1>
            <div className="mt-0">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                목장으로 가기
              </Button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* 왼쪽: 말 사진 */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {horse.horseImageUrl ? (
                  <Image
                    src={horse.horseImageUrl}
                    alt={horse.horseName}
                    width={400}
                    height={256}
                    className="w-full h-64 object-contain"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">말 사진 없음</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border py-0">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{farm?.farm_name || "목장명 없음"}</span>
                  </div>
                  
                  {farm?.farm_phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{farm.farm_phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 말 정보 */}
          <div className="space-y-6">
            {/* 말 기본 정보 */}
            <Card className="min-h-[430px]">
              <CardContent className="p-6">
                {/* 전체 2열 그리드 (모바일 1열) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* 출생일: 상단 전폭 */}
                  <div className="md:col-span-2 flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>출생일: {horse.birth || "-"}</span>
                  </div>

                  {/* 좌측: 말 상세 정보 */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">말 상세 정보</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">성별</label>
                        <p className="text-lg">{horse.gender || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">모색</label>
                        <p className="text-lg">{horse.color || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">품종</label>
                        <p className="text-lg">{horse.breed || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">생산국</label>
                        <p className="text-lg">{horse.countryOfOrigin || "-"}</p>
                      </div>
                    </div>
                  </section>

                  {/* 우측: 경주 기록 */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      경주 기록
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">출주횟수</label>
                        <p className="text-lg font-semibold">{horse.raceCount || 0}회</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">일착횟수</label>
                        <p className="text-lg font-semibold text-yellow-600">{horse.firstPlaceCount || 0}회</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">이착횟수</label>
                        <p className="text-lg font-semibold text-gray-600">{horse.secondPlaceCount || 0}회</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">상금</label>
                        <p className="text-lg font-semibold text-green-600">
                          {horse.totalPrize ? `${horse.totalPrize.toLocaleString()}원` : "0원"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* 하단 추가 정보: 전폭 */}
                  <div className="md:col-span-2 mt-2 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">최초출주일</label>
                        <p className="text-lg">{horse.firstRaceDate || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">최종출주</label>
                        <p className="text-lg">{horse.lastRaceDate || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">경주마불용일</label>
                        <p className="text-lg">{horse.retireDate || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
                    {/* 주간 소식 섹션 */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">주간 소식</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedYear === 'all' 
                        ? '전체 기간의 주간 보고서를 확인하세요'
                        : selectedMonth 
                          ? `${selectedYear}년 ${selectedMonth}월의 주간 보고서를 확인하세요`
                          : `${selectedYear}년의 주간 보고서를 확인하세요`
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <select
                      value={selectedYear}
                      onChange={(e) => handleYearChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="pl-3 pr-8 py-2 border rounded-md text-sm appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.4rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em'
                      }}
                    >
                      <option value="all">년</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <select
                      value={selectedMonth || ''}
                      onChange={(e) => handleMonthChange(e.target.value ? parseInt(e.target.value) : null)}
                      className="pl-3 pr-8 py-2 border rounded-md text-sm appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.4rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em'
                      }}
                    >
                      <option value="">월</option>
                      {availableMonths.map(month => (
                        <option key={month} value={month}>{month}월</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {horse.weeklyReport && horse.weeklyReport.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {horse.weeklyReport.map((report) => (
                      <div 
                        key={report.horseReportId} 
                        className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/support/${farm_uuid}/${horseNo}/${report.horseReportId}`)}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          {report.frontImageUrl && (
                            <Image
                              src={report.frontImageUrl}
                              alt={`${horse.horseName} ${report.month}월 ${report.week}주차`}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {report.month}월 {report.week}주차
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {report.aiSummary || "AI 요약이 없습니다."}
                            </p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            업로드일: {report.uploadedAt ? formatDate(report.uploadedAt) : '정보 없음'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">주간 소식이 없습니다</h3>
                    <p className="text-gray-500 mb-4">
                      {selectedYear === 'all' 
                        ? '아직 주간 보고서가 작성되지 않았습니다.'
                        : selectedMonth 
                          ? `${selectedYear}년 ${selectedMonth}월에는 아직 주간 보고서가 작성되지 않았습니다.`
                          : `${selectedYear}년에는 아직 주간 보고서가 작성되지 않았습니다.`
                      }
                    </p>
                    <p className="text-sm text-gray-400">
                      목장 관리자가 운영 보고를 통해 주간 보고서를 작성하면 여기에 표시됩니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
      </div>
    </div>
  );
}



