import React from "react";

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
}: Props) {
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
        {/* Donate Button */}
        <button
          type="button"
          className="ml-4 bg-green-500 text-white py-1.5 px-4 rounded-md hover:bg-green-600 transition-colors"
        >
          기부하기
        </button>
      </nav>
    </div>
  );
}
