// src/components/farm/panels/HorsesPanel.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  isMyFarm?: boolean;
};

export default function HorsesPanel({ farmUuid, isMyFarm = false }: Props) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHorses = async () => {
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
    };

    fetchHorses();
  }, [farmUuid]);

  if (loading) {
    return (
      <section id="panel-horses" className="flex flex-col">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">말 목록을 불러오는 중...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="panel-horses" className="flex flex-col">
        <div className="flex justify-center items-center py-8">
          <div className="text-red-500">오류: {error}</div>
        </div>
      </section>
    );
  }

  if (horses.length === 0) {
    return (
      <section id="panel-horses" className="flex flex-col">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">등록된 말이 없습니다.</div>
        </div>
      </section>
    );
  }

  return (
    <section id="panel-horses" className="flex flex-col">
      <div className="mb-4 flex">
        <h2 className="text-lg font-semibold">등록된 말</h2>
        <p className="text-sm text-gray-600 flex items-center ml-5">총 {horses.length}마리</p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {horses.map((horse) => (
          <div
            key={horse.id ?? horse.horseNo}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group relative"
          >
            <Link
              href={`/support/${farmUuid}/${horse.horseNo}`}
              className="block hover:scale-105 transition-transform duration-300"
            >
              {horse.image ? (
                <Image
                  src={horse.image}
                  alt={horse.hrNm ?? "말 이미지"}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover bg-gray-50 group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center text-gray-400 text-sm group-hover:bg-gray-100 transition-colors duration-300">
                  이미지 없음
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{horse.hrNm || "이름 없음"}</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>마번: {horse.horseNo}</p>
                  {horse.birthDt && (
                    <p>생년월일: {horse.birthDt}</p>
                  )}
                  {horse.breed && (
                    <p>품종: {horse.breed}</p>
                  )}
                  {horse.sex && (
                    <p>성별: {horse.sex}</p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
