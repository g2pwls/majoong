// src/app/support/[farm_uuid]/[horseNo]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Trophy, MapPin, Phone } from "lucide-react";

type Horse = {
  horseNo: string;
  hrNm: string;
  horse_url?: string;
  farm_name?: string;
  birthDt?: string;
  sex?: string;
  color?: string;
  breed?: string;
  prdCty?: string;
  rcCnt?: number;
  fstCnt?: number;
  sndCnt?: number;
  amt?: number;
  discardDt?: string;
  fdebutDt?: string;
  lchulDt?: string;
};

type Farm = {
  id: string;
  farm_name: string;
  total_score: number;
  image_url?: string;
  name?: string;
  address?: string;
  farm_phone?: string;
  area?: number;
  horse_count?: number;
};

type PageProps = { 
  params: { 
    farm_uuid: string; 
    horseNo: string; 
  } 
};

export default function HorseDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { farm_uuid, horseNo } = params;

  const [horse, setHorse] = useState<Horse | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    
    // 말 정보 가져오기
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/horse/${farm_uuid}`);
        if (!res.ok) throw new Error(`Failed to fetch horses: ${res.status}`);
        const horses = await res.json();
        
        const foundHorse = horses.find((h: { horseNo: string | number }) => String(h.horseNo) === horseNo);
        if (!foundHorse) {
          throw new Error("말을 찾을 수 없습니다.");
        }
        
        if (alive) {
          setHorse({
            horseNo: foundHorse.horseNo,
            hrNm: foundHorse.hrNm,
            horse_url: foundHorse.horse_url,
            farm_name: foundHorse.farm_name,
            birthDt: foundHorse.birthDt,
            sex: foundHorse.sex,
            color: foundHorse.color,
            breed: foundHorse.breed,
            prdCty: foundHorse.prdCty,
            rcCnt: foundHorse.rcCnt,
            fstCnt: foundHorse.fstCnt,
            sndCnt: foundHorse.sndCnt,
            amt: foundHorse.amt,
            discardDt: foundHorse.discardDt,
            fdebutDt: foundHorse.fdebutDt,
            lchulDt: foundHorse.lchulDt,
          });
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "말 정보를 불러오는 중 오류가 발생했어요.";
        if (alive) setError(errorMessage);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // 목장 정보 가져오기
    (async () => {
      try {
        const res = await fetch(`/api/farms/${farm_uuid}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`Failed to fetch farm: ${res.status}`);
        const data: Farm = await res.json();
        if (alive) setFarm(data);
      } catch (e: unknown) {
        console.error("Farm fetch error:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [farm_uuid, horseNo]);

  const handleBack = () => {
    router.push(`/support/${farm_uuid}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">말 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-600 mb-4">{error || "말 정보를 찾을 수 없습니다."}</p>
          <Button onClick={handleBack}>목장으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-6">
        {/* 브레드크럼 */}
        <Breadcrumbs
          items={[
            { label: "목장후원", href: "/support" },
            { label: farm?.farm_name || "목장", href: `/support/${farm_uuid}` },
            { label: `${horse.horseNo} ${horse.hrNm}` },
          ]}
        />

        {/* 메인 콘텐츠 */}
        <div className="flex flex-row items-center justify-between mt-5">
          <h1 className="text-3xl font-bold"><span className="text-red-600">{horse.horseNo}</span> {horse.hrNm}</h1>
            <div className="mt-0">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                목장으로 돌아가기
              </Button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          {/* 왼쪽: 말 사진 */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {horse.horse_url ? (
                  <img
                    src={horse.horse_url}
                    alt={horse.hrNm}
                    className="w-full h-64 object-contain"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">말 사진 없음</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border py-0">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{farm?.farm_name || "목장명 없음"}</span>
                  </div>
                  
                  {farm?.farm_phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{farm.farm_phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 말 정보 */}
          <div className="space-y-6">
            {/* 말 기본 정보 */}
            <Card className="min-h-[430px]">
              <CardContent className="p-6">
                {/* 전체 2열 그리드 (모바일 1열) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* 출생일: 상단 전폭 */}
                  {horse.birthDt && (
                    <div className="md:col-span-2 flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>출생일: {horse.birthDt}</span>
                    </div>
                  )}

                  {/* 좌측: 말 상세 정보 */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">말 상세 정보</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">성별</label>
                        <p className="text-lg">{horse.sex || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">모색</label>
                        <p className="text-lg">{horse.color || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">품종</label>
                        <p className="text-lg">{horse.breed || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">생산국</label>
                        <p className="text-lg">{horse.prdCty || "-"}</p>
                      </div>
                    </div>
                  </section>

                  {/* 우측: 경주 기록 */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      경주 기록
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">출주횟수</label>
                        <p className="text-lg font-semibold">{horse.rcCnt || 0}회</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">일착횟수</label>
                        <p className="text-lg font-semibold text-yellow-600">{horse.fstCnt || 0}회</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">이착횟수</label>
                        <p className="text-lg font-semibold text-gray-600">{horse.sndCnt || 0}회</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">상금</label>
                        <p className="text-lg font-semibold text-green-600">
                          {horse.amt ? `${horse.amt.toLocaleString()}원` : "0원"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* 하단 추가 정보: 전폭 */}
                  {(horse.fdebutDt || horse.lchulDt || horse.discardDt) && (
                    <div className="md:col-span-2 mt-2 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {horse.fdebutDt && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">최초출주일</label>
                            <p className="text-lg">{horse.fdebutDt}</p>
                          </div>
                        )}
                        {horse.lchulDt && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">최종출주</label>
                            <p className="text-lg">{horse.lchulDt}</p>
                          </div>
                        )}
                        {horse.discardDt && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">경주마불용일</label>
                            <p className="text-lg">{horse.discardDt}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
                    {/* 주간 소식 섹션 */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">주간 소식</h2>
                  <div className="flex gap-2">
                    <select className="px-3 py-1 border rounded-md text-sm">
                      <option>2025</option>
                      <option>2024</option>
                      <option>2023</option>
                      <option>2022</option>
                      <option>2021</option>
                    </select>
                    <select className="px-3 py-1 border rounded-md text-sm">
                      <option>12</option>
                      <option>11</option>
                      <option>10</option>
                      <option>9</option>
                      <option>8</option>
                      <option>7</option>
                      <option>6</option>
                      <option>5</option>
                      <option>4</option>
                      <option>3</option>
                      <option>2</option>
                      <option>1</option>

                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      {horse.horse_url && (
                        <img
                          src={horse.horse_url}
                          alt={horse.hrNm}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">9월 1주차</p>
                        <p className="text-sm text-gray-500">보고서 기반 2줄 정도만 간단하게 넣을 예정</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center text-gray-400">
                      <p className="text-sm">추가 소식</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center text-gray-400">
                      <p className="text-sm">추가 소식</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
      </div>
    </div>
  );
}


