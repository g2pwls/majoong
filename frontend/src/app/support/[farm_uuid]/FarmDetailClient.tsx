// src/app/farms/[farm_uuid]/FarmDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
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
import { Farm } from "@/types/farm";
import { FarmService } from "@/services/farmService";

const TABS: FarmTabValue[] = ["intro", "newsletter", "donations", "trust"];

export default function FarmDetailClient({ farm_uuid }: { farm_uuid: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FarmTabValue>(
    (searchParams.get("tab") as FarmTabValue) || "intro"
  );

  // URL → 탭 동기화
  useEffect(() => {
    const q = searchParams.get("tab");
    if (q && TABS.includes(q as FarmTabValue)) setTab(q as FarmTabValue);
  }, [searchParams]);

  // 데이터 패칭
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await FarmService.getFarm(farm_uuid);
        if (mounted) setFarm(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [farm_uuid]);

  const onChangeTab = (next: FarmTabValue) => {
    setTab(next);
    const sp = new URLSearchParams(window.location.search);
    sp.set("tab", next);
    router.replace(`?${sp.toString()}`);
  };

  if (loading) return <div className="p-6">로딩 중…</div>;
  if (!farm) return <div className="p-6">농장 정보를 불러오지 못했습니다.</div>;

  const farmId = farm.id;
  
  // farmId가 없으면 에러 표시
  if (!farmId) {
    return <div className="p-6">농장 ID를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* 브레드크럼 */}
      <Breadcrumbs items={[{ label: "목장후원", href: "/support" }, { label: farm.farm_name }]} />

      {/* 2열: 좌(타이틀+카드), 우(탭+패널) */}
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* 왼쪽: 타이틀(바깥) + 카드(헤더 숨김) */}
        <aside className="lg:sticky lg:top-6 self-start">
          {/* 바깥 헤더 */}
          <div className="mb-3 flex items-baseline gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">{farm.farm_name}</h1>
            <span className="text-xl text-gray-800">{farm.total_score.toFixed(1)}°C</span>
          </div>

          {/* 카드: 헤더 숨김 */}
          <FarmInfo
            farm_name={farm.farm_name}
            total_score={farm.total_score}
            image_url={farm.image_url}
            name={farm.name}
            address={farm.address}
            farm_phone={farm.farm_phone}
            area={farm.area}
            horse_count={farm.horse_count}
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
          <FarmTabs value={tab} onChange={onChangeTab} farmUuid={farmId} />
          <div className="mt-6">
            {tab === "intro" && <IntroPanel farm={farm} />}
            {tab === "newsletter" && <NewsletterPanel farmId={farmId} />}
            {tab === "donations" && <DonationPanel farmId={farmId} />}
            {tab === "trust" && <TrustPanel score={farm.total_score} />}
          </div>
        </section>
      </div>
    </div>
  );
}
