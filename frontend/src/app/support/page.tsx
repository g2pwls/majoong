'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumb";
import { Search, Star, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ------------------------------------------------------------------
// /support (목장 후원) 페이지
// ------------------------------------------------------------------

type Farm = {
  id: string;
  farm_name: string;
  address: string;
  name: string;
  horse_count: number;
  total_score: number;
  image_url: string;
  state?: "우수" | "양호" | "보통" | "미흡";
  horse_url?: string[]; // 말 이미지 4장
};

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

const FarmCard: React.FC<{ farm: Farm }> = ({ farm }) => (
  <Link href={`/support/${farm.id}`} passHref>
    <Card className="relative overflow-hidden rounded-2xl shadow-sm cursor-pointer">
      <TempBadge temp={farm.total_score} />
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* 왼쪽: cover + 정보 */}
          <div className="flex gap-4 items-start">
            <img
              src={farm.image_url}
              alt={`${farm.farm_name} cover`}
              className="h-42 w-58 rounded-xl object-cover"
            />
            <div className="flex flex-col gap-1">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-xl font-semibold">{farm.farm_name}</h3>
                <button className="rounded-full border p-1" aria-label="즐겨찾기">
                  <Star className="h-4 w-4" />
                </button>
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
          </div>

          {/* 오른쪽: 갤러리 + 버튼 */}
          <div className="flex flex-col items-end gap-3">
            <Button className="ml-2 whitespace-nowrap bg-red-500 hover:bg-red-600">
              기부하기
            </Button>
            <div className="flex gap-2">
              {(farm.horse_url ?? []).slice(0, 4).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${farm.farm_name} horse_url ${i + 1}`}
                  className="h-30 w-23 rounded-lg object-cover"
                />
              ))}
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

  // ✅ 전체 목록을 한 번에 가져옴
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // /api/farms/all 로 전체 배열 호출
        const res = await fetch(`/api/farms/all`, { cache: "no-store" });
        const list = res.ok ? ((await res.json()) as Farm[]) : [];

        // (선택) 각 농장별 말 4장 붙이기 — horse API가 있다면
        const withHorses = await Promise.all(
          list.map(async (f) => {
            try {
              const r = await fetch(`/api/horse/${f.id}`, { cache: "no-store" });
              const horses = r.ok ? ((await r.json()) as any[]) : [];
              const imgs = Array.isArray(horses)
                ? horses.slice(0, 4).map((h) => h.horse_url).filter(Boolean)
                : [];
              return { ...f, horse_url: imgs };
            } catch {
              return f;
            }
          })
        );

        if (alive) setFarms(withHorses);
      } catch (e) {
        console.error(e);
        if (alive) setFarms([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let arr = [...farms];
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      if (searchType === "farm") arr = arr.filter((f) => f.farm_name.toLowerCase().includes(q));
      else arr = arr.filter((f) => (f.horse_url ?? []).some((u) => u.toLowerCase().includes(q)));
    }
    if (sort === "recommended") arr.sort((a, b) => b.total_score - a.total_score);
    if (sort === "latest") arr.sort((a, b) => b.id.localeCompare(a.id));
    return arr;
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
            <Tabs value={sort} onValueChange={(v: any) => setSort(v)} className="shrink-0">
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
          {!loading && filtered.map((farm) => <FarmCard key={farm.id} farm={farm} />)}
          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border bg-white p-8 text-center text-sm text-muted-foreground">
              검색 조건에 맞는 목장이 없어요.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
