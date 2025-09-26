"use client";

import { useEffect, useState, useCallback } from "react";
import HorseRegistrySection from "@/components/farm/edit/HorseRegistrySection";
import TrustScoreChart from "./TrustScoreChart";
import DonationProgressChart from "./DonationProgressChart";
import { Farm } from "@/types/farm";
import { FarmService } from "@/services/farmService";
import { ScoreHistory } from "@/types/farm";

export default function IntroPanel({ farm, isMyFarm = false }: { farm: Farm; isMyFarm?: boolean }) {
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);

  // 디버깅을 위한 콘솔 로그
  console.log('IntroPanel farm data:', farm);

  // 신뢰도 내역 조회 (현재 년도)
  const fetchScoreHistory = useCallback(async () => {
    if (!farm?.id) return;
    
    const currentYear = new Date().getFullYear();
    
    try {
      console.log('신뢰도 내역 조회 시작:', { farmUuid: farm.farmUuid, year: currentYear });
      const response = await FarmService.getScoreHistory(farm.farmUuid, currentYear);
      console.log('신뢰도 내역 조회 성공:', response);
      setScoreHistory(response.result);
    } catch (e: unknown) {
      console.error('신뢰도 내역 조회 실패:', e);
    }
  }, [farm?.id, farm.farmUuid]);
  // 주석 추가

  useEffect(() => {
    // 신뢰도 데이터 가져오기
    fetchScoreHistory();
  }, [fetchScoreHistory]);

  return (
    <section id="panel-intro" className="flex flex-col">
      
      {/* 목장 소개 섹션 */}
      {farm?.description && (
        <div className="mb-2">
          <div className="bg-gray-50 rounded-lg px-4 py-2 border">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {farm.description}
            </p>
          </div>
        </div>
      )}

      {/* 기부 모금 진행률 차트 */}
      <div className="mb-2">
        <DonationProgressChart 
          monthTotalAmount={farm?.month_total_amount || 0}
          purposeTotalAmount={farm?.purpose_total_amount || 0}
        />
      </div>

      {/* 신뢰도 평균 변화 표 */}
      <div className="mb-4">
        <TrustScoreChart 
          scoreHistory={scoreHistory}
          selectedYear={new Date().getFullYear()}
          currentScore={farm?.total_score || 0}
          createdAt={farm?.created_at}
        />
      </div>

      <div className="flex flex-col">
        {/* Horse registry section */}
        <HorseRegistrySection 
          farmUuid={farm?.farmUuid || ""} 
          onHorseRegistered={0}
          isMyFarm={isMyFarm}
        />
      </div>
    </section>
  );
}

