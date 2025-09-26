// src/app/support/[farm_uuid]/report/page.tsx
"use client";

import { useEffect, useMemo, useState, use, useRef } from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/common/Breadcrumb";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HorseImageUpload from "@/components/farm/report/HorseImageUpload"; // HorseImageUpload 컴포넌트 불러오기
import DonationProofUpload from "@/components/farm/report/DonationProofUpload"; // DonationProofUpload 컴포넌트 불러오기
import { FarmService } from "@/services/farmService";
import { Farm } from "@/types/farm";
import { getUserRole } from "@/services/authService";

// ---- Types ----

type Horse = {
  horseNo: string;
  hrNm: string;
  horse_url?: string;
};

type PageProps = { params: Promise<{ farm_uuid: string }> };

function FarmReportContent({ farm_uuid }: { farm_uuid: string }) {
  // farm 데이터 가져오기
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [imageData, setImageData] = useState<Record<string, Record<string, string>>>({});
  const [donationData, setDonationData] = useState<Record<string, Record<string, string>>>({});
  const [activeTab, setActiveTab] = useState<"farmManagement" | "receiptProof">("farmManagement");
  const [selectedHorseNo, setSelectedHorseNo] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const farmData = await FarmService.getFarm(farm_uuid);
        if (alive) setFarm(farmData);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "불러오기 중 오류가 발생했어요.";
        if (alive) setError(errorMessage);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // Fetch horses data using FarmService
    (async () => {
      try {
        const horsesData = await FarmService.getHorses(farm_uuid);
        // FarmService에서 반환된 데이터를 Horse 타입에 맞게 변환
        const mappedHorses = horsesData.map((h) => ({
          horseNo: h.horseNo,
          hrNm: h.hrNm || '',
          horse_url: h.image,
        }));
        setHorses(mappedHorses);
        if (Array.isArray(mappedHorses) && mappedHorses.length > 0) {
          setSelectedHorseNo(mappedHorses[0].horseNo);
        }
      } catch (e) {
        console.error("Failed to fetch horses:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [farm_uuid]);

  // horses 데이터가 변경될 때 스크롤 상태 확인
  useEffect(() => {
    checkScrollButtons();
  }, [horses]);

  const handleImageUpload = (horseNo: string, imageType: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedImages = { ...imageData };
      if (!updatedImages[horseNo]) {
        updatedImages[horseNo] = {};
      }
      updatedImages[horseNo][imageType] = reader.result as string;
      setImageData(updatedImages);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleImageSwap = (horseNo: string, fromType: string, toType: string) => {
    const updatedImages = { ...imageData };
    if (!updatedImages[horseNo]) {
      updatedImages[horseNo] = {};
    }
    
    // 두 이미지의 위치를 바꿈
    const temp = updatedImages[horseNo][fromType];
    updatedImages[horseNo][fromType] = updatedImages[horseNo][toType] || '';
    updatedImages[horseNo][toType] = temp || '';
    
    setImageData(updatedImages);
  };

  const handleDonationImageUpload = (farmUuid: string, type: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedDonations = { ...donationData };
      if (!updatedDonations[farmUuid]) {
        updatedDonations[farmUuid] = {};
      }
      updatedDonations[farmUuid][type] = reader.result as string;
      setDonationData(updatedDonations);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleDonationImageSwap = (farmUuid: string, fromType: string, toType: string) => {
    const updatedDonations = { ...donationData };
    if (!updatedDonations[farmUuid]) {
      updatedDonations[farmUuid] = {};
    }
    
    // 두 이미지의 위치를 바꿈
    const temp = updatedDonations[farmUuid][fromType];
    updatedDonations[farmUuid][fromType] = updatedDonations[farmUuid][toType] || '';
    updatedDonations[farmUuid][toType] = temp || '';
    
    setDonationData(updatedDonations);
  };

  const selectedHorse = useMemo(() => {
    return horses.find((h) => h.horseNo === selectedHorseNo) || null;
  }, [horses, selectedHorseNo]);

  // 스크롤 상태 확인 함수
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    checkScrollButtons();
  };

  // 좌측 스크롤 함수
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  // 우측 스크롤 함수
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const title = loading ? "불러오는 중..." : farm?.farm_name ?? "목장 이름";
  const scoreText = loading
    ? "--"
    : typeof farm?.total_score === "number"
    ? farm!.total_score.toFixed(1)
    : "--";

  // 디버깅을 위한 로그
  console.log('Farm data:', farm);
  console.log('Title:', title);
  console.log('Loading:', loading);

  return (
    <div className="min-h-screen">
      <header>
        <div className="mx-auto max-w-6xl px-6 py-8 pb-3">
          {/* 브래드크럼 */}
          <Breadcrumbs
            items={[
              { label: getUserRole() === 'FARMER' ? "전체목장" : "목장후원", href: "/support" },
              { label: title, href: `/support/${farm_uuid}` },
              { label: "운영 보고" },
            ]}
          />
          <div className="mt-2 flex items-end justify-between">
            <div className="flex items-center gap-3">
              {/* 농장이름 및 신뢰도 */}
              <h1 className="text-2xl font-bold tracking-tight">목장 운영 보고</h1>
            </div>
          </div>

          {/* 오류 노출 (필요 시 토스트로 대체 가능) */}
          {error && (
            <p className="mt-2 text-sm text-red-600">불러오기에 실패했어요: {error}</p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-4 pt-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "farmManagement" | "receiptProof")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="farmManagement">목장 관리</TabsTrigger>
            <TabsTrigger value="receiptProof">기부금 증빙</TabsTrigger>
          </TabsList>
          
          <TabsContent value="farmManagement" className="space-y-6">
            <div className="mt-0">
                {/* 말 썸네일 가로 리스트 - 전체 너비 컨테이너 */}
                <div className="relative w-full h-44 bg-gray-100 rounded-lg border border-gray-200 mb-3 overflow-hidden">
                  {/* 좌측 화살표 버튼 */}
                  {canScrollLeft && (
                    <button
                      onClick={scrollLeft}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 border border-gray-200 transition-all"
                      aria-label="왼쪽으로 스크롤"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* 우측 화살표 버튼 */}
                  {canScrollRight && (
                    <button
                      onClick={scrollRight}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 border border-gray-200 transition-all"
                      aria-label="오른쪽으로 스크롤"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* 스크롤 컨테이너 - 고정 크기 내에서만 스크롤 */}
                  <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex items-center gap-3 h-full px-3 py-2 overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {horses.map((h) => (
                      <button
                        key={h.horseNo}
                        onClick={() => setSelectedHorseNo(h.horseNo)}
                        className={`flex-shrink-0 w-30 h-38 rounded border overflow-hidden transition-all ${selectedHorseNo === h.horseNo ? "ring-2 ring-blue-600" : "opacity-80 hover:opacity-100"}`}
                        title={h.hrNm}
                      >
                        {h.horse_url ? (
                          <Image
                            src={h.horse_url}
                            alt={h.hrNm}
                            width={120}
                            height={152}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="w-full h-full grid place-items-center text-xs bg-gray-200">{h.hrNm}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 선택된 말 업로드 섹션 */}
                {selectedHorse ? (
                  <HorseImageUpload
                    key={selectedHorse.horseNo}
                    horseNo={selectedHorse.horseNo}
                    hrNm={selectedHorse.hrNm}
                    farmUuid={farm_uuid}
                    imageData={imageData}
                    onImageUpload={handleImageUpload}
                    onImageSwap={handleImageSwap}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">등록된 말이 없습니다.</div>
                )}
            </div>
          </TabsContent>
          
          <TabsContent value="receiptProof" className="space-y-6">
            <div className="mt-0">
              <DonationProofUpload
                farmUuid={farm_uuid}
                donationData={donationData}
                onImageUpload={handleDonationImageUpload}
                onImageSwap={handleDonationImageSwap}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function FarmReport({ params }: PageProps) {
  // React.use()를 사용하여 Promise 언래핑
  const resolvedParams = use(params);
  
  return <FarmReportContent farm_uuid={resolvedParams.farm_uuid} />;
}
