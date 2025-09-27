// src/compents/farm/edit/HorseRegistrySection.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, memo } from "react";
import Image from "next/image";
import { FarmService } from "@/services/farmService";
import { Button } from "@/components/ui/button";

type Horse = {
  id?: string | number;
  horseNo: string;
  hrNm?: string;
  birthDt?: string;
  breed?: string;
  sex?: string;
  image?: string;
};

type Props = {
  farmUuid: string;
  onHorseRegistered?: number;
  isMyFarm?: boolean;
};

const HorseRegistrySection = memo(function HorseRegistrySection({ farmUuid, onHorseRegistered, isMyFarm = false }: Props) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingHorse, setDeletingHorse] = useState<string | null>(null);

  const fetchHorses = useCallback(async () => {
    if (!farmUuid) return;
    
    try {
      setLoading(true);
      setError(null);
      const horsesData = await FarmService.getHorses(farmUuid);
      setHorses(horsesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '말 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [farmUuid]);

  useEffect(() => {
    fetchHorses();
  }, [fetchHorses]);

  // 말 등록 트리거가 변경될 때마다 목록 새로고침
  useEffect(() => {
    if (onHorseRegistered && onHorseRegistered > 0) {
      fetchHorses();
    }
  }, [onHorseRegistered, fetchHorses]);

  // 말 삭제 처리
  const handleDeleteHorse = useCallback(async (horseNumber: string, horseName: string) => {
    if (!confirm(`정말로 "${horseName}" 말을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setDeletingHorse(horseNumber);
      await FarmService.deleteHorse(farmUuid, horseNumber);
      // 삭제 성공 후 목록 새로고침
      await fetchHorses();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '말 삭제에 실패했습니다.';
      alert(`말 삭제 실패: ${errorMessage}`);
    } finally {
      setDeletingHorse(null);
    }
  }, [farmUuid, fetchHorses]);
  return (
    <section>
      <h2 className="mt-3 text-lg font-semibold">등록된 말</h2>
      
      {loading && (
        <div className="mt-3 flex justify-center items-center py-8">
          <div className="text-gray-500">말 목록을 불러오는 중...</div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex justify-center items-center py-8">
          <div className="text-red-500">오류: {error}</div>
        </div>
      )}

      {!loading && !error && horses.length === 0 && (
        <div className="mt-3 flex justify-center items-center py-8">
          <div className="text-gray-500">등록된 말이 없습니다.</div>
        </div>
      )}

      {!loading && !error && horses.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {horses.map((horse) => (
            <div
              key={horse.id ?? horse.horseNo}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 group relative"
            >
              <Link
                href={`/support/${farmUuid}/${horse.horseNo}`}
                className="block"
              >
                {horse.image ? (
                  <Image
                    src={horse.image}
                    alt={horse.hrNm ?? "말 이미지"}
                    width={300}
                    height={192}
                    className="w-full h-44 object-cover bg-gray-50 group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-50 flex items-center justify-center text-gray-400 text-sm group-hover:bg-gray-100 transition-colors duration-300">
                    이미지 없음
                  </div>
                )}
                <div className="pt-3 pb-3 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">{horse.hrNm}</h4>
                  </div>
                  <p className="text-sm text-gray-500">마번: {horse.horseNo}</p>
                  {horse.birthDt && (
                    <p className="text-sm text-gray-500">출생일: {horse.birthDt}</p>
                  )}
                  {horse.breed && (
                    <p className="text-sm text-gray-500">품종: {horse.breed}</p>
                  )}
                  {horse.sex && (
                    <p className="text-sm text-gray-500">성별: {horse.sex}</p>
                  )}
                </div>
              </Link>
              
              {/* 삭제 버튼 - 내 농장일 때만 표시 */}
              {isMyFarm && (
                <div className="absolute top-2 right-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteHorse(horse.horseNo, horse.hrNm || '이름 없는 말');
                    }}
                    disabled={deletingHorse === horse.horseNo}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 h-6"
                  >
                    {deletingHorse === horse.horseNo ? '삭제 중...' : '삭제'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
});

export default HorseRegistrySection;


