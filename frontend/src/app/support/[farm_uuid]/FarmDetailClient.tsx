// src/app/farms/[farm_uuid]/FarmDetailClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Breadcrumbs from "@/components/common/Breadcrumb";
import FarmInfo from "@/components/farm/FarmInfo";
import FarmTabs, { FarmTabValue } from "@/components/farm/FarmTabs";
import IntroPanel from "@/components/farm/panels/IntroPanel";
import NewsletterPanel from "@/components/farm/panels/NewsletterPanel";
import DonationPanel from "@/components/farm/panels/DonationPanel";
import TrustPanel from "@/components/farm/panels/TrustPanel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getFarm } from "@/services/apiService";
import { useFarmStore, useUIStore } from "@/stores";

const TABS: FarmTabValue[] = ["intro", "newsletter", "donations", "trust"];

export default function FarmDetailClient({ farm_uuid }: { farm_uuid: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentFarm, isLoading, setCurrentFarm, setLoading } = useFarmStore();
  const { selectedTab, setSelectedTab } = useUIStore();

  // URL → 탭 동기화
  useEffect(() => {
    const q = searchParams.get("tab");
    if (q && TABS.includes(q as FarmTabValue)) setSelectedTab(q as FarmTabValue);
  }, [searchParams, setSelectedTab]);

  // 데이터 패칭
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getFarm(farm_uuid);
        console.log('농장 상세 데이터:', data);
        if (mounted) setCurrentFarm(data);
      } catch (e) {
        console.error('농장 상세 조회 실패:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [farm_uuid, setCurrentFarm, setLoading]);

  const onChangeTab = (next: FarmTabValue) => {
    setSelectedTab(next);
    const sp = new URLSearchParams(window.location.search);
    sp.set("tab", next);
    router.replace(`?${sp.toString()}`);
  };

  if (isLoading) return <div className="p-6">로딩 중…</div>;
  if (!currentFarm) return <div className="p-6">농장 정보를 불러오지 못했습니다.</div>;

  const farmId = currentFarm.id;
  
  // farmId가 없으면 에러 표시
  if (!farmId) {
    return <div className="p-6">농장 ID를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* 브레드크럼 */}
      <Breadcrumbs items={[{ label: "목장후원", href: "/support" }, { label: currentFarm.farm_name }]} />

      {/* 2열: 좌(타이틀+카드), 우(탭+패널) */}
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* 왼쪽: 타이틀(바깥) + 카드(헤더 숨김) */}
        <aside className="lg:sticky lg:top-6 self-start">
          {/* 바깥 헤더 */}
          <div className="mb-3 flex items-baseline gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">{currentFarm.farm_name}</h1>
            <span className="text-xl text-gray-800">{currentFarm.total_score.toFixed(1)}°C</span>
          </div>

          {/* 카드: 헤더 숨김 */}
          <FarmInfo
            farm_name={currentFarm.farm_name}
            total_score={currentFarm.total_score}
            image_url={currentFarm.image_url}
            name={currentFarm.name}
            address={currentFarm.address}
            farm_phone={currentFarm.farm_phone}
            area={currentFarm.area}
            horse_count={currentFarm.horse_count}
            showHeader={false}   // ✅ 카드 내부 헤더 비표시
            className="mt-4"
          />
          <div className="flex justify-end">
            <Link href={`/support/${farmId}/edit`}>
            <Button className="mt-2 whitespace-nowrap">
              목장 정보 수정
            </Button>
            </Link>
          </div>
        </aside>

        {/* 오른쪽: 탭 + 패널 */}
        <section>
          <FarmTabs value={selectedTab as FarmTabValue} onChange={onChangeTab} farmUuid={farmId} />
          <div className="mt-4.5">
            {selectedTab === "intro" && <IntroPanel farm={currentFarm} />}
            {selectedTab === "newsletter" && <NewsletterPanel farmId={farmId} />}
            {selectedTab === "donations" && <DonationPanel farmId={farmId} />}
            {selectedTab === "trust" && <TrustPanel farmId={farmId} currentScore={currentFarm.total_score} />}
          </div>
        </section>
      </div>
    </div>
  );
}
