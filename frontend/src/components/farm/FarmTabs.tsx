import React from "react";
export type FarmTabValue = "intro" | "horses" | "newsletter" | "donations" | "trust";

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
  { value: "intro",      label: "목장 홈",        panelId: "panel-intro" },
  { value: "horses",     label: "말 목록",        panelId: "panel-horses" },
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
        className="-mb-px flex gap-6"
        role="tablist"
        aria-label="Farm Tabs"
      >
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
      </nav>
    </div>
  );
}
