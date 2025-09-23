"use client";

import { useEffect, useState, useCallback } from "react";
import HorseRegistrySection from "@/components/farm/edit/HorseRegistrySection";
import TrustScoreChart from "./TrustScoreChart";
import DonationProgressChart from "./DonationProgressChart";
import { Farm } from "@/types/farm";
import { FarmService } from "@/services/farmService";
import { ScoreHistory } from "@/types/farm";

export default function IntroPanel({ farm }: { farm: Farm }) {
  const [deadlineText, setDeadlineText] = useState<string>("");
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
    // Calculate the deadline (Sunday) and show the countdown
    const getDeadlineText = () => {
      const today = new Date();
      const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, etc.
      const daysUntilSunday = (7 - dayOfWeek) % 7; // Days until next Sunday

      const deadlineDate = new Date(today);
      deadlineDate.setDate(today.getDate() + daysUntilSunday); // Set to next Sunday
      const openDate = new Date(deadlineDate);
      openDate.setDate(deadlineDate.getDate() - 2); // Friday (open day)

      // Only show the countdown on Friday, Saturday, or Sunday
      if (today >= openDate && today <= deadlineDate) {
        const daysLeft = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        switch (daysLeft) {
          case 2:
            setDeadlineText("마감일 D-2");
            break;
          case 1:
            setDeadlineText("마감일 D-1");
            break;
          case 0:
            setDeadlineText("마감일 D-Day");
            break;
          default:
            setDeadlineText("");
            break;
        }
      }
    };

    getDeadlineText();
  }, []);

  // 신뢰도 데이터 가져오기
  useEffect(() => {
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
        />
      </div>

      <div className="flex flex-col items-end">
        {/* Countdown Text */}
        {deadlineText && (
          <div className="mb-2 text-sm text-gray-600">
            {deadlineText}
          </div>
        )}
        
        {/* Horse registry section */}
        <HorseRegistrySection 
          farmUuid={farm?.id || ""} 
          onHorseRegistered={() => {}}
        />
      </div>
    </section>
  );
}

