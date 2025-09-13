// src/app/support/[farm_uuid]/report/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "@/components/common/Breadcrumb";
import HorseImageUpload from "@/components/farm/report/HorseImageUpload"; // HorseImageUpload 컴포넌트 불러오기
import DonationProofUpload from "@/components/farm/report/DonationProofUpload"; // DonationProofUpload 컴포넌트 불러오기

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

type Horse = {
  horseNo: string;
  name: string;
  horse_url?: string;
};

type PageProps = { params?: { farm_uuid: string } };  // params가 없을 수 있음을 명시적으로 처리

export default function FarmReport({ params }: PageProps) {
  // params가 없을 경우 처리
  if (!params || !params.farm_uuid) {
    return <div>목장 정보가 없습니다. 다시 시도해주세요.</div>;
  }

  const farm_uuid = params.farm_uuid;

  // farm 데이터 가져오기
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [imageData, setImageData] = useState<Record<string, Record<string, string>>>({});
  const [donationData, setDonationData] = useState<Record<string, Record<string, string>>>({});
  const [activeTab, setActiveTab] = useState<"farmManagement" | "receiptProof">("farmManagement");
  const [selectedHorseNo, setSelectedHorseNo] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/farms/${farm_uuid}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
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

    // Fetch horses data
    (async () => {
      try {
        const res = await fetch(`/api/horse/${farm_uuid}`);
        if (!res.ok) throw new Error("Failed to fetch horses");
        const data = await res.json();
        // API 응답을 Horse 타입에 맞게 변환
        const mappedHorses = data.map((h: any) => ({
          horseNo: String(h.horseNo),
          name: h.hrNm,
          horse_url: h.horse_url,
        }));
        setHorses(mappedHorses);
        if (Array.isArray(mappedHorses) && mappedHorses.length > 0) {
          setSelectedHorseNo(mappedHorses[0].horseNo);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [farm_uuid]);

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
              { label: "운영 보고" },
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

      <main className="mx-auto max-w-6xl px-6 py-3">
        <h2 className="text-xl font-semibold">목장 운영 보고</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[160px_1fr]">
          {/* 좌측 탭 */}
          <aside>
            <div className="flex lg:flex-col gap-2 border rounded-md p-2 bg-white">
              <button
                className={`px-3 py-2 text-left rounded ${activeTab === "farmManagement" ? "bg-gray-900 text-white" : "bg-gray-100"}`}
                onClick={() => setActiveTab("farmManagement")}
              >
                목장 관리
              </button>
              <button
                className={`px-3 py-2 text-left rounded ${activeTab === "receiptProof" ? "bg-gray-900 text-white" : "bg-gray-100"}`}
                onClick={() => setActiveTab("receiptProof")}
              >
                기부금 증빙
              </button>
            </div>
          </aside>

          {/* 우측 콘텐츠 */}
          <section>

            {activeTab === "farmManagement" && (
              <div className="mt-0">
                {/* 말 썸네일 가로 리스트 */}
                <div className="flex items-center rounded-lg gap-3 overflow-x-auto py-2 bg-gray-100 p-3 mb-3 border border-gray-200">
                  {horses.map((h) => (
                    <button
                      key={h.horseNo}
                      onClick={() => setSelectedHorseNo(h.horseNo)}
                      className={`flex-shrink-0 w-30 h-38 rounded border overflow-hidden transition-all ${selectedHorseNo === h.horseNo ? "ring-2 ring-blue-600" : "opacity-80 hover:opacity-100"}`}
                      title={h.name}
                    >
                      {h.horse_url ? (
                        <img
                          src={h.horse_url}
                          alt={h.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full grid place-items-center text-xs bg-gray-200">{h.name}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* 선택된 말 업로드 섹션 */}
                {selectedHorse ? (
                  <HorseImageUpload
                    key={selectedHorse.horseNo}
                    horseNo={selectedHorse.horseNo}
                    horseName={selectedHorse.name}
                    imageData={imageData}
                    onImageUpload={handleImageUpload}
                    onImageSwap={handleImageSwap}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">등록된 말이 없습니다.</div>
                )}
              </div>
            )}

            {activeTab === "receiptProof" && (
              <div className="mt-0">
                <DonationProofUpload
                  farmUuid={farm_uuid}
                  donationData={donationData}
                  onImageUpload={handleDonationImageUpload}
                  onImageSwap={handleDonationImageSwap}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
