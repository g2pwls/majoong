import React, { useEffect, useState } from "react";
import Link from "next/link";
import { isDonator, isFarmer } from "@/services/authService";
import { isMyFarm } from "@/services/apiService";
export type FarmTabValue = "intro" | "newsletter" | "donations" | "trust";

export type TabItem = {
  value: FarmTabValue;
  label: string;
  // 패널 id를 연결하면 a11y에 좋아요 (선택)
  panelId?: string;
};

type Props = {
  value: FarmTabValue;                 // 현재 활성 탭
  onChange: (next: FarmTabValue) => void;
  items?: TabItem[];                   // 탭 목록 (미지정 시 기본 4개)
  className?: string;
  farmUuid?: string;                  // 농장 UUID (기부하기 버튼 링크용)
};

const DEFAULT_ITEMS: TabItem[] = [
  { value: "intro",      label: "목장 소개",        panelId: "panel-intro" },
  { value: "newsletter", label: "월간 소식지",      panelId: "panel-newsletter" },
  { value: "donations",  label: "기부금 사용 내역", panelId: "panel-donations" },
  { value: "trust",      label: "신뢰도 내역",      panelId: "panel-trust" },
];

export default function FarmTabs({
  value,
  onChange,
  items = DEFAULT_ITEMS,
  className = "",
  farmUuid,
}: Props) {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 현재 사용자가 해당 목장의 소유자인지 확인
  useEffect(() => {
    const checkOwnership = async () => {
      if (!farmUuid) {
        setIsLoading(false);
        return;
      }

      // 기부자일 때는 내 목장 확인을 하지 않음
      if (isDonator()) {
        setIsOwner(false);
        setIsLoading(false);
        return;
      }

      try {
        const isMyFarmResult = await isMyFarm(farmUuid);
        setIsOwner(isMyFarmResult);
      } catch (error) {
        console.error('목장 소유자 확인 실패:', error);
        setIsOwner(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOwnership();
  }, [farmUuid]);
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav
        className="-mb-px flex gap-6 items-center justify-between" // Added justify-between and items-center
        role="tablist"
        aria-label="Farm Tabs"
      >
        <div className="flex gap-6">
          {items.map((it) => {
            const active = value === it.value;
            return (
              <button
                key={it.value}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={it.panelId}
                className={[
                  "whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring",
                  active
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-black hover:border-gray-300",
                ].join(" ")}
                onClick={() => onChange(it.value)}
              >
                {it.label}
              </button>
            );
          })}
        </div>
        {/* Role-based Buttons */}
        {!isLoading && (
          <div className="flex gap-2">
            {isOwner && (
              <Link 
                href={farmUuid ? `/support/${farmUuid}/edit` : "/farm/edit"}
                className="ml-4 bg-gray-500 text-white py-1.5 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                목장 정보 수정
              </Link>
            )}
            {isOwner ? (
              <Link 
                href={farmUuid ? `/support/${farmUuid}/report` : "/farm/report"}
                className="bg-blue-500 text-white py-1.5 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                목장 운영 보고하기
              </Link>
            ) : !isFarmer() && (
              <Link 
                href={isDonator() ? (farmUuid ? `/support/${farmUuid}/donate` : "/donate") : "/login"}
                className="ml-4 bg-green-500 text-white py-1.5 px-4 rounded-md hover:bg-green-600 transition-colors"
              >
                기부하기
              </Link>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
