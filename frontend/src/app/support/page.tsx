'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/common/Breadcrumb";
import { Search, Star, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFarms, Farm, Horse, addFarmBookmark, removeFarmBookmark } from "@/services/apiService";
import { isDonator, isFarmer } from "@/services/authService";

// ------------------------------------------------------------------
// /support (목장 후원) 페이지
// ------------------------------------------------------------------

// Farm과 Horse 타입은 apiService에서 import

const SearchTypeToggle: React.FC<{
  value: "farm" | "horse";
  onChange: (v: "farm" | "horse") => void;
}> = ({ value, onChange }) => (
  <div className="flex items-center gap-2 rounded-xl border px-2 py-1">
    <button
      onClick={() => onChange("farm")}
      className={`px-3 py-1 rounded-lg text-sm transition ${value === "farm" ? "bg-black text-white" : "hover:bg-muted"}`}
      aria-pressed={value === "farm"}
    >
      농장이름
    </button>
    <button
      onClick={() => onChange("horse")}
      className={`px-3 py-1 rounded-lg text-sm transition ${value === "horse" ? "bg-black text-white" : "hover:bg-muted"}`}
      aria-pressed={value === "horse"}
    >
      마명
    </button>
  </div>
);

// 안전장치 추가(숫자 아님 → 렌더 생략)
const TempBadge: React.FC<{ temp?: number }> = ({ temp }) => {
  const n = Number(temp);
  if (!Number.isFinite(n)) return null;
  const color = n >= 60 ? "bg-green-500" : n >= 45 ? "bg-blue-400" : n >= 38 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className={`absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-semibold text-white ${color}`}>
      {n.toFixed(1)}°C
    </div>
  );
};

const FarmCard: React.FC<{ 
  farm: Farm; 
  isBookmarked: boolean; 
  onBookmarkToggle: (farmUuid: string) => void;
  isLoading?: boolean;
}> = ({ farm, isBookmarked, onBookmarkToggle, isLoading = false }) => {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    onBookmarkToggle(farm.id);
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl shadow-sm">
      <TempBadge temp={farm.total_score} />
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* 왼쪽: cover + 정보 */}
          <Link href={`/support/${farm.id}`} className="flex gap-4 items-start cursor-pointer">
            <Image
              src={farm.image_url}
              alt={`${farm.farm_name} cover`}
              width={232}
              height={168}
              className="h-42 w-58 rounded-xl object-cover"
            />
            <div className="flex flex-col gap-1">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-xl font-semibold">{farm.farm_name}</h3>
                {isDonator() && (
                  <button 
                    className={`rounded-full border p-1 transition-colors ${
                      isBookmarked 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-300 hover:border-yellow-400'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    aria-label={isBookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                    onClick={handleBookmarkClick}
                    disabled={isLoading}
                  >
                    <Star 
                      className={`h-4 w-4 ${
                        isBookmarked 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-400 hover:text-yellow-400'
                      } ${isLoading ? 'animate-pulse' : ''}`} 
                    />
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {farm.address}
              </p>
              <p className="text-sm text-muted-foreground">농장주: {farm.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" /> 말 {farm.horse_count}두
              </p>
              {farm.state && (
                <p className="text-sm text-muted-foreground">농장 상태: {farm.state}</p>
              )}
            </div>
          </Link>

          {/* 오른쪽: 갤러리 + 버튼 */}
          <div className="flex flex-col items-end gap-3">
            {!isFarmer() && (
              <Link href={isDonator() ? `/support/${farm.id}/donate` : '/login'}>
                <Button className="ml-2 whitespace-nowrap bg-red-500 hover:bg-red-600">
                  기부하기
                </Button>
              </Link>
            )}
            <div className="flex gap-2">
              {(farm.horse_url ?? []).slice(0, 4).map((src, i) => 
                src ? (
                  <Image
                    key={i}
                    src={src}
                    alt={`${farm.farm_name} horse_url ${i + 1}`}
                    width={92}
                    height={120}
                    className="h-30 w-23 rounded-lg object-cover"
                  />
                ) : null
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const HorseCard: React.FC<{ horse: Horse; farm: Farm }> = ({ horse, farm }) => (
  <Link href={`/support/${farm.id}/${horse.horseNo}`} passHref>
    <Card className="relative overflow-hidden rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4 items-start">
          {/* 말 이미지 */}
          <div className="flex-shrink-0">
            <Image
              src={horse.horse_url || "/horses/mal.png"}
              alt={`${horse.hrNm} 이미지`}
              width={96}
              height={128}
              className="h-32 w-24 rounded-lg object-cover"
            />
          </div>
          
          {/* 말 정보 */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{horse.hrNm}</h3>
              <p className="text-sm text-gray-600">마번: {horse.horseNo}</p>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">농장:</span> {farm.farm_name}</p>
              <p><span className="font-medium">성별:</span> {horse.sex || "미상"}</p>
              <p><span className="font-medium">색상:</span> {horse.color || "미상"}</p>
              <p><span className="font-medium">품종:</span> {horse.breed || "미상"}</p>
              {horse.rcCnt !== undefined && (
                <p><span className="font-medium">경주횟수:</span> {horse.rcCnt}회</p>
              )}
              {horse.amt !== undefined && horse.amt > 0 && (
                <p><span className="font-medium">총상금:</span> {horse.amt.toLocaleString()}원</p>
              )}
            </div>
          </div>
          
          {/* 농장 정보 */}
          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-gray-500 space-y-1">
              <p>농장주: {farm.name}</p>
              <p className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {farm.address}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default function SupportPage() {
  const [sort, setSort] = useState<"latest" | "recommended">("recommended");
  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState<"farm" | "horse">("farm");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedFarms, setBookmarkedFarms] = useState<Set<string>>(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState<Set<string>>(new Set());

  // 즐겨찾기 토글 함수
  const handleBookmarkToggle = async (farmUuid: string) => {
    if (!isDonator()) return;
    
    // 로딩 상태 추가
    setBookmarkLoading(prev => new Set(prev).add(farmUuid));
    
    try {
      const isCurrentlyBookmarked = bookmarkedFarms.has(farmUuid);
      
      if (isCurrentlyBookmarked) {
        await removeFarmBookmark(farmUuid);
        // 로컬 상태 업데이트
        setBookmarkedFarms(prev => {
          const newSet = new Set(prev);
          newSet.delete(farmUuid);
          return newSet;
        });
        // farms 배열의 해당 농장의 bookmark 상태도 업데이트
        setFarms(prev => prev.map(farm => 
          farm.id === farmUuid ? { ...farm, bookmark: false } : farm
        ));
      } else {
        await addFarmBookmark(farmUuid);
        // 로컬 상태 업데이트
        setBookmarkedFarms(prev => new Set(prev).add(farmUuid));
        // farms 배열의 해당 농장의 bookmark 상태도 업데이트
        setFarms(prev => prev.map(farm => 
          farm.id === farmUuid ? { ...farm, bookmark: true } : farm
        ));
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      // 에러 발생 시 사용자에게 알림 (선택사항)
    } finally {
      // 로딩 상태 제거
      setBookmarkLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(farmUuid);
        return newSet;
      });
    }
  };

  // ✅ 전체 목록을 한 번에 가져옴
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 실제 API 호출
        const farmListResponse = await getFarms({
          page: 0,
          size: 100 // 충분한 수량으로 설정
        });

        const list = farmListResponse.content || [];

        // 각 농장별 말 데이터와 이미지 4장 붙이기
        const withHorses = list.map((f) => {
          const imgs = Array.isArray(f.horses)
            ? f.horses.slice(0, 4).map((h) => h.horse_url).filter(Boolean)
            : [];
          return { ...f, horse_url: imgs };
        });

        if (alive) setFarms(withHorses);
      } catch (e) {
        console.error('농장 목록 조회 실패:', e);
        if (alive) setFarms([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 농장 목록에서 북마크 상태 추출
  React.useEffect(() => {
    if (!isDonator() || farms.length === 0) return;
    
    const bookmarkIds = new Set(
      farms
        .filter(farm => farm.bookmark === true)
        .map(farm => farm.id)
    );
    setBookmarkedFarms(bookmarkIds);
  }, [farms]);

  const { filteredFarms, filteredHorses } = useMemo(() => {
    let farmArr = [...farms];
    let horseArr: Array<{ horse: Horse; farm: Farm }> = [];
    
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      if (searchType === "farm") {
        farmArr = farmArr.filter((f) => f.farm_name.toLowerCase().includes(q));
      } else {
        // 마명 검색: 각 농장의 말 데이터에서 hrNm으로 검색하여 말 카드 배열 생성
        farmArr = farmArr.filter((f) => 
          (f.horses ?? []).some((horse) => 
            horse.hrNm.toLowerCase().includes(q)
          )
        );
        
        // 검색된 농장들에서 매칭된 말들만 추출
        horseArr = farmArr.flatMap((farm) => 
          (farm.horses ?? [])
            .filter((horse) => horse.hrNm.toLowerCase().includes(q))
            .map((horse) => ({ horse, farm }))
        );
      }
    } else {
      // 검색어가 없을 때는 모든 농장 표시
      farmArr = farms;
    }
    
    if (sort === "recommended") {
      farmArr.sort((a, b) => b.total_score - a.total_score);
      horseArr.sort((a, b) => (b.horse.amt || 0) - (a.horse.amt || 0));
    }
    if (sort === "latest") {
      farmArr.sort((a, b) => b.id.localeCompare(a.id));
      horseArr.sort((a, b) => b.horse.id - a.horse.id);
    }
    
    return { filteredFarms: farmArr, filteredHorses: horseArr };
  }, [farms, keyword, searchType, sort]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <div className="py-4">
          <Breadcrumbs items={[
            { label: "홈", href: "/" },
            { label: "목장후원", href: "/support" },
            { label: "목장 목록" },
          ]} />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* 왼쪽: 제목 + 탭 */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold">목장 목록</h1>
            <Tabs value={sort} onValueChange={(v) => setSort(v as "latest" | "recommended")} className="shrink-0">
              <TabsList>
                <TabsTrigger value="latest">최신순</TabsTrigger>
                <TabsTrigger value="recommended">추천순</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 오른쪽: 검색 */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <SearchTypeToggle value={searchType} onChange={setSearchType} />
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="w-[240px] pl-8"
                  placeholder={searchType === "farm" ? "농장이름 검색" : "마명 검색"}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {loading && (
            <div className="rounded-2xl border bg-white p-8 text-center text-sm text-muted-foreground">불러오는 중…</div>
          )}
          {!loading && searchType === "farm" && filteredFarms.map((farm) => (
            <FarmCard 
              key={farm.id} 
              farm={farm} 
              isBookmarked={bookmarkedFarms.has(farm.id)}
              onBookmarkToggle={handleBookmarkToggle}
              isLoading={bookmarkLoading.has(farm.id)}
            />
          ))}
          {!loading && searchType === "horse" && filteredHorses.map(({ horse, farm }) => (
            <HorseCard key={`${farm.id}-${horse.id}`} horse={horse} farm={farm} />
          ))}
          {!loading && searchType === "farm" && filteredFarms.length === 0 && (
            <div className="rounded-2xl border bg-white p-8 text-center text-sm text-muted-foreground">
              검색 조건에 맞는 목장이 없어요.
            </div>
          )}
          {!loading && searchType === "horse" && filteredHorses.length === 0 && (
            <div className="rounded-2xl border bg-white p-8 text-center text-sm text-muted-foreground">
              검색 조건에 맞는 말이 없어요.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
