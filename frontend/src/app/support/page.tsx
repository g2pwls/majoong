'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/common/Breadcrumb";
import { Search, Star, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFarms, getHorses, Farm, Horse, addFarmBookmark, removeFarmBookmark } from "@/services/apiService";
import { isDonator, isFarmer, getUserRole, isGuest } from "@/services/authService";
import { getFavoriteFarms } from "@/services/userService";

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
      목장이름
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
  onDonateClick: (farmId: string) => void;
  rank?: number;
  isLoading?: boolean;
}> = ({ farm, isBookmarked, onBookmarkToggle, onDonateClick, rank, isLoading = false }) => {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    onBookmarkToggle(farm.id);
  };

  return (
    <Link href={`/support/${farm.id}`} className="block">
      <Card className="relative overflow-hidden rounded-2xl shadow-sm hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out hover:rotate-0 hover:-translate-y-2 hover:scale-102 cursor-pointer p-0 will-change-transform">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between h-auto lg:h-58">
          {/* 왼쪽: 이미지 (패딩 없이 꽉 차게, 고정 크기) */}
          <div className="relative lg:w-1/3 h-48 sm:h-56 lg:h-full">
            <Image
              src={farm.image_url}
              alt={`${farm.farm_name} cover`}
              width={232}
              height={168}
              className="h-full w-full object-cover rounded-t-2xl lg:rounded-t-2xl lg:rounded-b-none lg:rounded-r-none"
            />
            <TempBadge temp={farm.total_score} />
          </div>
          {/* 오른쪽: 정보 (패딩 적용) */}
          <div className="py-4 px-4 sm:px-6 md:px-8 lg:w-2/3 lg:h-full flex flex-col justify-center">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* 왼쪽: 농장 정보 */}
              <div className="flex flex-col justify-center gap-2 lg:min-w-0 lg:flex-1">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {rank && (
                      <div className="flex items-center gap-1">
                        <div className="text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm" style={{ backgroundColor: '#4D3A2C' }}>
                          {rank}위
                        </div>
                      </div>
                    )}
                    <h3 className="text-lg sm:text-xl font-semibold">{farm.farm_name}</h3>
                    {isDonator() && (
                      <button 
                        className={`rounded-full border p-1 transition-colors cursor-pointer ${
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
                  {/* 모바일에서 기부하기 버튼을 여기에 배치 */}
                  {!isFarmer() && (
                    <Button 
                      className="lg:hidden whitespace-nowrap bg-[#91745A] hover:bg-[#91745A] text-sm sm:text-sm px-3 py-1.5"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDonateClick(farm.id);
                      }}
                    >
                      기부하기
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4 flex-shrink-0" /> 
                    <span className="break-words">{farm.address}</span>
                </p>
                <p className="text-sm text-muted-foreground"> 말 {farm.horse_count}두</p>
                <p className="text-sm text-muted-foreground">목장주: {farm.name}</p>
                {farm.state && (
                  <p className="text-sm text-muted-foreground">목장 상태: {farm.state}</p>
                )}
              </div>

          {/* 오른쪽: 갤러리 + 버튼 */}
              <div className={`flex flex-col items-end gap-3 lg:flex-shrink-0 ${isFarmer() ? 'justify-end' : ''}`}>
            {!isFarmer() && (
                  <Button 
                    className="hidden lg:flex ml-2 whitespace-nowrap min-w-[120px] text-sm sm:text-base items-center justify-center text-white"
                    style={{ backgroundColor: '#91745A' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7d6149'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#91745A'}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDonateClick(farm.id);
                    }}
                  >
                  이 목장에 기부하기
                </Button>
            )}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {(farm.horse_url ?? []).map((src, i) => 
                src ? (
                      <div key={i} className="relative group flex-shrink-0">
                  <Image
                    src={src}
                    alt={`${farm.farm_name} horse_url ${i + 1}`}
                    width={92}
                    height={120}
                          className="h-30 w-23 rounded-xl object-cover shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-2 border-white/20"
                  />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                ) : null
              )}
            </div>
          </div>
        </div>
          </div>
        </div>
    </Card>
    </Link>
  );
};
 
const HorseCard: React.FC<{ horse: Horse; farm: Farm; index: number }> = ({ horse, farm, index }) => {
  // 각 카드마다 다른 회전각도 적용
  const getRotationClass = (index: number) => {
    const rotations = [
      'rotate-[0.8deg]', 'rotate-[-0.8deg]', 'rotate-[-0.6deg]', 'rotate-[0.6deg]', 
      'rotate-[-0.75deg]', 'rotate-[0.25deg]', 'rotate-[-0.3deg]', 'rotate-[0.9deg]'
    ];
    return rotations[index % rotations.length];
  };

  // 평균 색상 계산 (이미지에서 추출된 색상 사용)
  const getAverageColor = (index: number) => {
    const colors = [
      '#b0b6a9', '#afa294', '#3c3c3d', '#b47460', 
      '#60a6ce', '#46666f', '#8e898f', '#8d516e'
    ];
    return colors[index % colors.length];
  };

  const averageColor = getAverageColor(index);

  return (
  <Link href={`/support/${farm.id}/${horse.horseNo}`} passHref>
      <article 
        className={`
          relative group cursor-pointer transition-all duration-300 ease-in-out
          hover:rotate-0 hover:-translate-y-3 hover:scale-110 hover:opacity-100
          ${getRotationClass(index)}
          sm:opacity-75
          will-change-transform
        `}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        <div 
          className="
            border-2 sm:border-4 rounded-lg p-0.5 sm:p-1
            bg-gradient-to-br from-[var(--average-color)] to-[var(--average-color)]/90
            shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]
            group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] sm:group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]
            transition-all duration-300
            min-h-[140px] sm:min-h-[200px]
          "
          style={{
            borderColor: averageColor,
            backgroundColor: averageColor,
            backgroundImage: `radial-gradient(transparent 0)`,
            backgroundSize: '7px 7px',
            backgroundPosition: 'center'
          }}
        >
          {/* 말 이미지 */}
          <div className="relative overflow-hidden rounded-md">
            <Image
              src={horse.horse_url || "/horses/mal.png"}
              alt={`${horse.hrNm} 이미지`}
              width={200}
              height={280}
              className="w-full aspect-[200/200] sm:aspect-[200/280] object-cover rounded-md"
            />
          </div>
          
          {/* 말 이름 (캡션) */}
          <div className="p-1 sm:p-2">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate text-center leading-tight">
              {horse.hrNm}
            </h3>
            <p className="text-xs text-white/80 text-center mt-0.5 sm:mt-1 truncate">
              {farm.farm_name}
            </p>
            </div>
          </div>
      </article>
  </Link>
);
};

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
  const itemsPerPage = searchType === "horse" ? 24 : 10; // 마명 검색 시 30개, 농장 검색 시 10개

  // 기부하기 버튼 클릭 핸들러
  const handleDonateClick = (farmId: string) => {
    if (isGuest()) {
      // 비회원이면 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    } else {
      // 회원이면 기부 페이지로 이동
      window.location.href = `/support/${farmId}/donate`;
    }
  };

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
        
        // 커스텀 이벤트 발생시켜 다른 페이지에서 변경사항 감지
        window.dispatchEvent(new CustomEvent('bookmarkChanged'));
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
        
        // 커스텀 이벤트 발생시켜 다른 페이지에서 변경사항 감지
        window.dispatchEvent(new CustomEvent('bookmarkChanged'));
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

        // API 응답 콘솔 로그
        console.log('=== Support 페이지 API 응답 ===');
        console.log('농장 목록 API 응답:', farmListResponse);
        console.log('말 목록 API 응답:', horseListResponse);

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
          
          // 기부자인 경우 서버에서 실제 즐겨찾기 상태를 가져와서 farms 배열에 반영
          if (isDonator()) {
            try {
              const favoriteResponse = await getFavoriteFarms();
              if (favoriteResponse.isSuccess && favoriteResponse.result) {
                const bookmarkedFarmUuids = favoriteResponse.result.map(farm => farm.farmUuid);
                setFarms(prev => prev.map(farm => ({
                  ...farm,
                  bookmarked: bookmarkedFarmUuids.includes(farm.id)
                })));
                
                // localStorage도 서버 상태와 동기화
                localStorage.setItem('bookmarkedFarms', JSON.stringify(bookmarkedFarmUuids));
              }
            } catch (error) {
              console.error('즐겨찾기 상태 조회 실패:', error);
              // 서버 조회 실패 시 localStorage에서 읽어오기 (fallback)
              const bookmarkedFarms = JSON.parse(localStorage.getItem('bookmarkedFarms') || '[]');
              if (bookmarkedFarms.length > 0) {
                setFarms(prev => prev.map(farm => ({
                  ...farm,
                  bookmarked: bookmarkedFarms.includes(farm.id)
                })));
              }
            }
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

    // 커스텀 이벤트 리스너 추가 (같은 탭 내에서의 변경 감지)
    const handleCustomStorageChange = () => {
      const bookmarkedFarms = JSON.parse(localStorage.getItem('bookmarkedFarms') || '[]');
      setFarms(prev => prev.map(farm => ({
        ...farm,
        bookmarked: bookmarkedFarms.includes(farm.id)
      })));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookmarkChanged', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarkChanged', handleCustomStorageChange);
    };
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
    } else if (sort === "latest") {
      // 최신순: created_at 기준으로 내림차순 정렬 (최신이 먼저)
      farmArr.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      // 말 목록도 농장의 created_at 기준으로 정렬
      horseArr.sort((a, b) => {
        const dateA = new Date(a.farm.created_at || 0).getTime();
        const dateB = new Date(b.farm.created_at || 0).getTime();
        return dateB - dateA;
      });
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
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-4 pb-3">
          <Breadcrumbs items={[
            { label: getUserRole() === 'FARMER' ? "전체목장" : "목장후원" }
          ]} />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* 왼쪽: 제목 + 탭 */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">전체 목장</h1>
            <Tabs value={sort} onValueChange={(v) => setSort(v as "latest" | "recommended")} className="shrink-0">
              <TabsList className="h-8">
                <TabsTrigger value="recommended" className="text-xs px-2">신뢰도순</TabsTrigger>
                <TabsTrigger value="latest" className="text-xs px-2">최신순</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 오른쪽: 검색 */}
          <div className="flex flex-row items-center gap-2">
            <SearchTypeToggle value={searchType} onChange={setSearchType} />
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="w-[182px] sm:w-[200px] pl-8 h-9 text-sm"
                placeholder={searchType === "farm" ? "목장이름 검색" : "마명 검색"}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {loading && (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderBottomColor: '#4D3A2C' }}></div>
                <div className="text-sm text-muted-foreground">불러오는 중…</div>
              </div>
            </div>
          )}
          {!loading && searchType === "farm" && paginatedFarms.map((farm, index) => {
            // 신뢰도 순위 계산 (전체 목록에서의 신뢰도 순위)
            const currentRank = (() => {
              if (sort === "recommended") {
                // 신뢰도순 정렬일 때는 현재 페이지 기준 순위
                return (currentPage - 1) * itemsPerPage + index + 1;
              } else {
                // 최신순 정렬일 때는 전체 목록에서의 신뢰도 순위 계산
                const sortedByScore = [...filteredFarms].sort((a, b) => b.total_score - a.total_score);
                const rankIndex = sortedByScore.findIndex(f => f.id === farm.id);
                return rankIndex !== -1 ? rankIndex + 1 : undefined;
              }
            })();
            
            return (
              <FarmCard 
                key={farm.id} 
                farm={farm} 
                isBookmarked={farm.bookmarked || false}
                onBookmarkToggle={handleBookmarkToggle}
                onDonateClick={handleDonateClick}
                rank={currentRank}
                isLoading={bookmarkLoading.has(farm.id)}
              />
            );
          })}
          {!loading && searchType === "horse" && (
            <div className="relative">
              <div className="mb-6">
                <p className="text-sm text-gray-600">총 {filteredHorses.length}마의 말이 있습니다</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                {paginatedHorses.map(({ horse, farm }, index) => (
                  <HorseCard 
                    key={`${farm.id}-${horse.id}`} 
                    horse={horse} 
                    farm={farm} 
                    index={index}
                  />
                ))}
              </div>
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
