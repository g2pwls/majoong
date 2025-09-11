// src/app/support/[farm_uuid]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import FarmBasicInfoPanel from "@/components/farm/edit/FarmBasicInfoPanel";
import HorseInfoPanel from "@/components/farm/edit/HorseInfoPanel";
import Breadcrumbs from "@/components/common/Breadcrumb";
import FarmTabs, { FarmTabValue } from "@/components/farm/FarmTabs";

// ---- Types ----
export type Farm = {
  id: string;
  farm_name: string;
  total_score: number;
  image_url?: string;
  name?: string; // 대표자명 등
  address?: string;
  farm_phone?: string;
  area?: number;
  horse_count?: number;
};

type PageProps = { params: { farm_uuid: string } };

export default function FarmEdit({ params }: PageProps) {
  const farm_uuid = params.farm_uuid;

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
        const res = await fetch(`/api/farms/${farm_uuid}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          // 캐시 무효화가 필요하면 다음 옵션 사용
          // cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data: Farm = await res.json();
        if (alive) setFarm(data);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "불러오기 중 오류가 발생했어요.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [farm_uuid]);

  // 등록된 말 정보 상태 관리
  const [registeredHorses, setRegisteredHorses] = useState<any[]>([]);

  // ✅ 초기 더미 말 목록 불러와 카드로 표시
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/horse/${farm_uuid}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          // cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to fetch horses: ${res.status}`);
        const data = (await res.json()) as any[];
        if (!alive) return;
        const mapped = data.map((h: any) => ({
          id: h.id,
          horseNo: String(h.horseNo),
          name: h.hrNm,
          birthDate: typeof h.birthDt === "string" && h.birthDt.length === 8
            ? `${h.birthDt.slice(0, 4)}-${h.birthDt.slice(4, 6)}-${h.birthDt.slice(6, 8)}`
            : h.birthDt,
          breed: h.breed,
          sex: h.sex,
          image: h.image,
        }));
        setRegisteredHorses(mapped);
      } catch (e) {
        // 초기 더미 로드 실패는 치명적이지 않으므로 콘솔에만 기록
        console.error(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [farm_uuid]);

  // ✅ 말 등록 처리: 마번 중복이면 교체
  const handleHorseRegistration = (horseData: any) => {
    setRegisteredHorses((prev) => {
      const existsIdx = prev.findIndex((h) => h.horseNo === horseData.horseNo);
      if (existsIdx >= 0) {
        const next = [...prev];
        next[existsIdx] = { ...prev[existsIdx], ...horseData };
        return next;
      }
      return [...prev, horseData];
    });
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
        <div className="mx-auto max-w-6xl px-6 py-5">
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

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-12">
        {/* 기본 정보 수정 패널 */}
        <h2 className="text-lg font-semibold">기본 정보 수정</h2>
        <FarmBasicInfoPanel farm_uuid={farm_uuid} farm={farm ?? undefined} />

        {/* 말 정보 수정 패널 */}
        <h2 className="mt-6 text-lg font-semibold">말 정보 수정</h2>
        <HorseInfoPanel farm_uuid={farm_uuid} onHorseRegistered={handleHorseRegistration} />

        {/* ✅ 여러 말 카드 렌더링 */}
        <h2 className="mt-6 text-lg font-semibold">등록된 말</h2>
        {registeredHorses.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {registeredHorses.map((horse) => (
              <div
                key={horse.id ?? horse.horseNo}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {horse.image ? (
                  <img
                    src={horse.image}
                    alt={horse.name}
                    className="w-full h-48 object-cover bg-gray-50"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                    이미지 없음
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">{horse.name}</h4>
                  </div>
                  <p className="text-sm text-gray-500">마번: {horse.horseNo}</p>
                  <p className="text-sm text-gray-500">생년월일: {horse.birthDate}</p>
                  <p className="text-sm text-gray-500">품종: {horse.breed}</p>
                  <p className="text-sm text-gray-500">성별: {horse.sex}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
