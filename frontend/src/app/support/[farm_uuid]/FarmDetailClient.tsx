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
import { getFarm, Farm, addFarmBookmark, removeFarmBookmark } from "@/services/apiService";
import { isDonator } from "@/services/authService";

const TABS: FarmTabValue[] = ["intro", "newsletter", "donations", "trust"];

export default function FarmDetailClient({ farm_uuid }: { farm_uuid: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FarmTabValue>(
    (searchParams.get("tab") as FarmTabValue) || "intro"
  );
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

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
        const data = await getFarm(farm_uuid);
        console.log('농장 상세 데이터:', data);
        if (mounted) setFarm(data);
        
        // 즐겨찾기 상태 확인 (farm.bookmarked 속성 사용)
        if (isDonator()) {
          if (mounted) setIsBookmarked(data.bookmarked || false);
        }
      } catch (e) {
        console.error('농장 상세 조회 실패:', e);
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

  // 즐겨찾기 토글 핸들러
  const handleBookmarkToggle = async (farmUuid: string) => {
    if (!isDonator()) return;
    
    setBookmarkLoading(true);
    
    try {
      if (isBookmarked) {
        await removeFarmBookmark(farmUuid);
        setIsBookmarked(false);
      } else {
        await addFarmBookmark(farmUuid);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) return <div className="p-6">로딩 중…</div>;
  if (!farm) return <div className="p-6">농장 정보를 불러오지 못했습니다.</div>;

  // farm_uuid prop을 사용

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* 브레드크럼 */}
      <Breadcrumbs items={[{ label: "목장후원", href: "/support" }, { label: farm.farm_name }]} />

      {/* 2열: 좌(타이틀+카드), 우(탭+패널) */}
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* 왼쪽: 카드(헤더 포함) */}
        <aside className="lg:sticky lg:top-6 self-start">
          {/* 카드: 헤더 포함 (즐겨찾기 버튼 포함) */}
          <FarmInfo
            farm_name={farm.farm_name}
            total_score={farm.total_score}
            image_url={farm.image_url}
            name={farm.name}
            address={farm.address}
            farm_phone={farm.farm_phone}
            area={farm.area}
            horse_count={farm.horse_count}
            showHeader={true}   // ✅ 카드 내부 헤더 표시 (즐겨찾기 버튼 포함)
            farm_uuid={farm_uuid}
            isBookmarked={isBookmarked}
            onBookmarkToggle={handleBookmarkToggle}
            bookmarkLoading={bookmarkLoading}
            className=""
          />
        </aside>

        {/* 오른쪽: 탭 + 패널 */}
        <section>
          <FarmTabs value={tab} onChange={onChangeTab} farmUuid={farm_uuid} />
          <div className="mt-4.5">
            {tab === "intro" && <IntroPanel farm={farm} />}
            {tab === "newsletter" && <NewsletterPanel farmUuid={farm_uuid} />}
            {tab === "donations" && <DonationPanel farmUuid={farm_uuid} />}
            {tab === "trust" && <TrustPanel farmUuid={farm_uuid} currentScore={farm.total_score} />}
          </div>
        </section>
      </div>
    </div>
  );
}
