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
import { getFarms, getHorses, Farm, Horse, addFarmBookmark, removeFarmBookmark } from "@/services/apiService";
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
    <Card className="relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
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
    <Card className="relative overflow-hidden rounded-2xl shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 p-0">
      <CardContent className="p-3">
        <div className="flex flex-col gap-3">
          {/* 말 이미지 */}
          <div className="w-full">
            <Image
              src={horse.horse_url || "/horses/mal.png"}
              alt={`${horse.hrNm} 이미지`}
              width={200}
              height={150}
              className="w-full h-45 rounded-lg object-cover"
            />
          </div>
          
          {/* 말 정보 */}
          <div className="space-y-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">{horse.hrNm}</h3>
              <p className="text-sm text-gray-600">마번: {horse.horseNo}</p>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">농장:</span> {farm.farm_name}</p>
              <p><span className="font-medium">농장주:</span> {farm.name}</p>
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
  const [horses, setHorses] = useState<Array<{ horse: Horse; farm: Farm }>>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState<Set<string>>(new Set());
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 즐겨찾기 토글 함수
  const handleBookmarkToggle = async (farmUuid: string) => {
    if (!isDonator()) return;
    
    // 로딩 상태 추가
    setBookmarkLoading(prev => new Set(prev).add(farmUuid));
    
    try {
      // 현재 농장의 즐겨찾기 상태 확인
      const currentFarm = farms.find(farm => farm.id === farmUuid);
      const isCurrentlyBookmarked = currentFarm?.bookmarked || false;
      
      if (isCurrentlyBookmarked) {
        await removeFarmBookmark(farmUuid);
        // farms 배열의 해당 농장의 bookmark 상태 업데이트
        setFarms(prev => prev.map(farm => 
          farm.id === farmUuid ? { ...farm, bookmarked: false } : farm
        ));
        // localStorage에서 즐겨찾기 상태 제거
        const bookmarkedFarms = JSON.parse(localStorage.getItem('bookmarkedFarms') || '[]');
        const updatedBookmarks = bookmarkedFarms.filter((id: string) => id !== farmUuid);
        localStorage.setItem('bookmarkedFarms', JSON.stringify(updatedBookmarks));
      } else {
        await addFarmBookmark(farmUuid);
        // farms 배열의 해당 농장의 bookmark 상태 업데이트
        setFarms(prev => prev.map(farm => 
          farm.id === farmUuid ? { ...farm, bookmarked: true } : farm
        ));
        // localStorage에 즐겨찾기 상태 추가
        const bookmarkedFarms = JSON.parse(localStorage.getItem('bookmarkedFarms') || '[]');
        if (!bookmarkedFarms.includes(farmUuid)) {
          bookmarkedFarms.push(farmUuid);
          localStorage.setItem('bookmarkedFarms', JSON.stringify(bookmarkedFarms));
        }
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

  // ✅ 농장 목록과 말 목록을 각각 가져옴
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 농장 목록과 말 목록을 병렬로 가져옴
        const [farmListResponse, horseListResponse] = await Promise.all([
          getFarms({
            page: 0,
            size: 100 // 충분한 수량으로 설정
          }),
          getHorses({
            page: 0,
            size: 100 // 충분한 수량으로 설정
          })
        ]);

        const farmList = farmListResponse.content || [];
        const horseList = horseListResponse.content || [];

        // 각 농장별 말 데이터와 이미지 4장 붙이기
        const withHorses = farmList.map((f) => {
          const imgs = Array.isArray(f.horses)
            ? f.horses.slice(0, 4).map((h) => h.horse_url).filter(Boolean)
            : [];
          return { ...f, horse_url: imgs };
        });

        if (alive) {
          setFarms(withHorses);
          setHorses(horseList);
          
          // localStorage에서 즐겨찾기 상태를 읽어와서 farms 배열에 반영
          const bookmarkedFarms = JSON.parse(localStorage.getItem('bookmarkedFarms') || '[]');
          if (bookmarkedFarms.length > 0) {
            setFarms(prev => prev.map(farm => ({
              ...farm,
              bookmarked: bookmarkedFarms.includes(farm.id)
            })));
          }
        }
      } catch (e) {
        console.error('데이터 조회 실패:', e);
        if (alive) {
          setFarms([]);
          setHorses([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // localStorage 변경 감지하여 즐겨찾기 상태 동기화
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookmarkedFarms' && e.newValue) {
        const bookmarkedFarms = JSON.parse(e.newValue);
        setFarms(prev => prev.map(farm => ({
          ...farm,
          bookmarked: bookmarkedFarms.includes(farm.id)
        })));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { filteredFarms, filteredHorses, paginatedFarms, paginatedHorses, totalPages, totalItems } = useMemo(() => {
    let farmArr = [...farms];
    let horseArr: Array<{ horse: Horse; farm: Farm }> = [];
    
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      if (searchType === "farm") {
        farmArr = farmArr.filter((f) => f.farm_name.toLowerCase().includes(q));
      } else {
        // 마명 검색: 전체 말 목록에서 검색
        horseArr = horses.filter(({ horse }) => 
          horse.hrNm.toLowerCase().includes(q)
        );
      }
    } else {
      // 검색어가 없을 때
      if (searchType === "farm") {
        farmArr = farms;
      } else {
        // 마명 탭에서는 전체 말 목록 표시
        horseArr = horses;
      }
    }
    
    if (sort === "recommended") {
      farmArr.sort((a, b) => b.total_score - a.total_score);
      horseArr.sort((a, b) => (b.horse.amt || 0) - (a.horse.amt || 0));
    }
    if (sort === "latest") {
      farmArr.sort((a, b) => b.id.localeCompare(a.id));
      horseArr.sort((a, b) => b.horse.id - a.horse.id);
    }
    
    // 페이지네이션 계산
    const totalItems = searchType === "farm" ? farmArr.length : horseArr.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    const paginatedFarms = farmArr.slice(startIndex, endIndex);
    const paginatedHorses = horseArr.slice(startIndex, endIndex);
    
    return { 
      filteredFarms: farmArr, 
      filteredHorses: horseArr,
      paginatedFarms,
      paginatedHorses,
      totalPages,
      totalItems
    };
  }, [farms, horses, keyword, searchType, sort, currentPage, itemsPerPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 검색어, 검색 타입, 정렬 변경 시 페이지 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [keyword, searchType, sort]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <div className="py-4">
          <Breadcrumbs items={[
            { label: "목장후원", href: "/support" },
          ]} />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* 왼쪽: 제목 + 탭 */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold">목장 목록</h1>
            <Tabs value={sort} onValueChange={(v) => setSort(v as "latest" | "recommended")} className="shrink-0">
              <TabsList>
                <TabsTrigger value="latest">최신순</TabsTrigger>
                <TabsTrigger value="recommended">신뢰도순</TabsTrigger>
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
          {!loading && searchType === "farm" && paginatedFarms.map((farm) => (
            <FarmCard 
              key={farm.id} 
              farm={farm} 
              isBookmarked={farm.bookmarked || false}
              onBookmarkToggle={handleBookmarkToggle}
              isLoading={bookmarkLoading.has(farm.id)}
            />
          ))}
          {!loading && searchType === "horse" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {paginatedHorses.map(({ horse, farm }) => (
                <HorseCard key={`${farm.id}-${horse.id}`} horse={horse} farm={farm} />
              ))}
            </div>
          )}
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

        {/* 페이지네이션 */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="text-sm text-gray-500">
              총 {totalItems}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}개 표시
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                이전
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // 페이지 번호 표시 로직 (최대 5개까지만 표시)
                  if (totalPages <= 5) {
                    return (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  } else {
                    // 현재 페이지 주변 2페이지씩만 표시
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, currentPage + 2);
                    
                    if (page === 1 || page === totalPages || (page >= startPage && page <= endPage)) {
                      return (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === startPage - 1 || page === endPage + 1) {
                      return <span key={page} className="text-gray-400">...</span>;
                    }
                    return null;
                  }
                })}
              </div>
              
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
