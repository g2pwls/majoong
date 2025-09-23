// src/app/support/[farm_uuid]/edit/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import FarmBasicInfoPanel from "@/components/farm/edit/FarmBasicInfoPanel";
import HorseInfoPanel from "@/components/farm/edit/HorseInfoPanel";
import HorseRegistrySection from "@/components/farm/edit/HorseRegistrySection";
import Breadcrumbs from "@/components/common/Breadcrumb";
import { FarmService } from "@/services/farmService";
import { Farm } from "@/types/farm";

type PageProps = { params: Promise<{ farm_uuid: string }> };

export default function FarmEdit({ params }: PageProps) {
  const { farm_uuid } = use(params);

  // farm 데이터 가져오기
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return () => {
      alive = false;
    };
  }, [farm_uuid]);

  // 말 등록 처리 (HorseInfoPanel에서 사용)
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleHorseRegistration = (horseData: unknown) => {
    console.log("Horse registered:", horseData);
    // 말 등록 후 목록 새로고침 트리거
    setRefreshTrigger(prev => prev + 1);
  };

  const title = loading ? "불러오는 중..." : farm?.farm_name ?? "목장 이름";
  const scoreText = loading
    ? "--"
    : typeof farm?.total_score === "number"
    ? farm!.total_score.toFixed(1)
    : "--";

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          {/* 브래드크럼 */}
          <Breadcrumbs
            items={[
              { label: "목장후원", href: "/support" },
              { label: title, href: `/support/${farm_uuid}` },
              { label: "농장 정보 수정" },
            ]}
          />
          <div className="mt-2 flex items-end justify-between">
            <div className="flex items-center gap-3">
              {/* 농장이름 및 신뢰도 */}
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <span className="rounded-full border px-2.5 py-1 text-xs text-neutral-600">
                {scoreText} °C
              </span>
            </div>
          </div>

          {/* 오류 노출 (필요 시 토스트로 대체 가능) */}
          {error && (
            <p className="mt-2 text-sm text-red-600">불러오기에 실패했어요: {error}</p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-12">
        {/* 기본 정보 수정 패널 */}
        <h2 className="text-lg font-semibold mb-2">기본 정보 수정</h2>
        <FarmBasicInfoPanel farm_uuid={farm_uuid} farm={farm ?? undefined} />

        {/* 말 정보 수정 패널 */}
        <h2 className="mt-6 text-lg font-semibold mb-2">말 정보 수정</h2>
        <HorseInfoPanel farm_uuid={farm_uuid} onHorseRegistered={handleHorseRegistration} />

        <HorseRegistrySection 
          farmUuid={farm_uuid} 
          onHorseRegistered={() => setRefreshTrigger(prev => prev + 1)}
        />
      </main>
    </div>
  );
}
