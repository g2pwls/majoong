// src/compents/farm/edit/HorseRegistrySection.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, memo } from "react";
import Image from "next/image";
import { FarmService } from "@/services/farmService";

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
  onHorseRegistered?: () => void;
};

const HorseRegistrySection = memo(function HorseRegistrySection({ farmUuid, onHorseRegistered }: Props) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 말 등록 콜백이 호출될 때마다 목록 새로고침
  useEffect(() => {
    if (onHorseRegistered) {
      fetchHorses();
    }
  }, [onHorseRegistered, fetchHorses]);
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
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {horses.map((horse) => (
            <Link
              key={horse.id ?? horse.horseNo}
              href={`/support/${farmUuid}/${horse.horseNo}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
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
                  <p className="text-sm text-gray-500">생년월일: {horse.birthDt}</p>
                )}
                {horse.breed && (
                  <p className="text-sm text-gray-500">품종: {horse.breed}</p>
                )}
                {horse.sex && (
                  <p className="text-sm text-gray-500">성별: {horse.sex}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
});

export default HorseRegistrySection;


