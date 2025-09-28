// src/app/farms/[farm_uuid]/FarmDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Breadcrumbs from "@/components/common/Breadcrumb";
import FarmInfo from "@/components/farm/FarmInfo";
import FarmTabs, { FarmTabValue } from "@/components/farm/FarmTabs";
import IntroPanel from "@/components/farm/panels/IntroPanel";
import HorsesPanel from "@/components/farm/panels/HorsesPanel";
import NewsletterPanel from "@/components/farm/panels/NewsletterPanel";
import DonationPanel from "@/components/farm/panels/DonationPanel";
import TrustPanel from "@/components/farm/panels/TrustPanel";
import { getFarm, Farm, addFarmBookmark, removeFarmBookmark, isMyFarm as checkIsMyFarm } from "@/services/apiService";
import { isDonator, isFarmer, getUserRole } from "@/services/authService";

const TABS: FarmTabValue[] = ["intro", "horses", "newsletter", "donations", "trust"];

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
  const [isMyFarm, setIsMyFarm] = useState(false);

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
        
        // 내 목장인지 확인
        if (isFarmer()) {
          try {
            const isMyFarmResult = await checkIsMyFarm(farm_uuid);
            if (mounted) setIsMyFarm(isMyFarmResult);
          } catch (error) {
            console.error('내 목장 확인 실패:', error);
            if (mounted) setIsMyFarm(false);
          }
        }
        
        // 즐겨찾기 상태 확인 (localStorage 우선, 없으면 API 응답 사용)
        if (isDonator()) {
          const bookmarkedFarms = JSON.parse(localStorage.getItem('bookmarkedFarms') || '[]');
          const isBookmarkedFromStorage = bookmarkedFarms.includes(farm_uuid);
          const isBookmarkedFromAPI = data.bookmarked || false;
          
          // localStorage에 데이터가 있으면 그것을 사용, 없으면 API 응답 사용
          if (mounted) setIsBookmarked(isBookmarkedFromStorage || isBookmarkedFromAPI);
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

  // localStorage 변경 감지하여 즐겨찾기 상태 동기화
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookmarkedFarms' && e.newValue) {
        const bookmarkedFarms = JSON.parse(e.newValue);
        const isBookmarkedFromStorage = bookmarkedFarms.includes(farm_uuid);
        setIsBookmarked(isBookmarkedFromStorage);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
        // localStorage에서 즐겨찾기 상태 제거
        const bookmarkedFarms = JSON.parse(localStorage.getItem('bookmarkedFarms') || '[]');
        const updatedBookmarks = bookmarkedFarms.filter((id: string) => id !== farmUuid);
        localStorage.setItem('bookmarkedFarms', JSON.stringify(updatedBookmarks));
      } else {
        await addFarmBookmark(farmUuid);
        setIsBookmarked(true);
        // localStorage에 즐겨찾기 상태 추가
        const bookmarkedFarms = JSON.parse(localStorage.getItem('bookmarkedFarms') || '[]');
        if (!bookmarkedFarms.includes(farmUuid)) {
          bookmarkedFarms.push(farmUuid);
          localStorage.setItem('bookmarkedFarms', JSON.stringify(bookmarkedFarms));
        }
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>;
  if (!farm) return <div className="p-6">농장 정보를 불러오지 못했습니다.</div>;

  // farm_uuid prop을 사용

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
      {/* 브레드크럼 */}
      <div className="flex items-center justify-between">
        <Breadcrumbs items={[{ label: getUserRole() === 'FARMER' ? "전체목장" : "목장후원", href: "/support" }, { label: farm.farm_name }]} />
        {/* 모바일에서만 기부하기 버튼 표시 */}
        {!isFarmer() && (
          <button
            onClick={() => window.location.href = `/support/${farm_uuid}/donate`}
            className="lg:hidden bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            기부하기
          </button>
        )}
      </div>

      {/* 2열: 좌(타이틀+카드), 우(탭+패널) */}
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[290px_1fr]">
        {/* 왼쪽: 카드(헤더 포함) */}
        <aside className="lg:sticky lg:top-20 self-start">
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
          <FarmTabs 
            value={tab} 
            onChange={onChangeTab} 
            farmUuid={farm_uuid}
            showDonateButton={!isFarmer()}
            showEditButton={isMyFarm}
          />
          <div className="mt-4.5">
            {tab === "intro" && <IntroPanel farm={farm} isMyFarm={false} />}
            {tab === "horses" && <HorsesPanel farmUuid={farm_uuid} isMyFarm={isMyFarm} />}
            {tab === "newsletter" && <NewsletterPanel farmUuid={farm_uuid} />}
            {tab === "donations" && <DonationPanel farmUuid={farm_uuid} />}
            {tab === "trust" && <TrustPanel farmUuid={farm_uuid} currentScore={farm.total_score} />}
          </div>
        </section>
      </div>
    </div>
  );
}
