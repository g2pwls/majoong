// components/farm/FarmInfo.tsx
import Image from "next/image";
import { Star } from "lucide-react";
import { addFarmBookmark, removeFarmBookmark } from "@/services/apiService";
import { isDonator } from "@/services/authService";

type Props = {
  farm_name: string;        // 농장명
  total_score: number;      // 신뢰도
  image_url?: string;       // 대표 이미지
  name?: string;            // 농장주
  address?: string;         // 주소
  farm_phone?: string;      // 연락처
  area?: number | string;   // 면적
  horse_count?: number;     // 두수
  className?: string;       // 외부 제어용
  showHeader?: boolean;     // ✅ 헤더(농장명+신뢰도) 출력 여부
  farm_uuid?: string;       // 농장 UUID (즐겨찾기용)
  isBookmarked?: boolean;   // 즐겨찾기 상태
  onBookmarkToggle?: (farmUuid: string) => void; // 즐겨찾기 토글 함수
  bookmarkLoading?: boolean; // 즐겨찾기 로딩 상태
};

export default function FarmInfo({
  farm_name,
  total_score,
  image_url,
  name,
  address,
  farm_phone,
  area,
  horse_count,
  className = "",
  showHeader = true,
  farm_uuid,
  isBookmarked = false,
  onBookmarkToggle,
  bookmarkLoading = false,
}: Props) {
  const fmtNum = (v?: number | string) =>
    v === undefined || v === null ? "-" : typeof v === "number" ? v.toLocaleString() : v;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (farm_uuid && onBookmarkToggle) {
      onBookmarkToggle(farm_uuid);
    }
  };

  return (
    <section className={`rounded-xl bg-white shadow-sm border p-3 ${className}`}>
      {/* 헤더: 토글 가능 */}
      {showHeader && (
        <div className="mb-4 flex items-baseline gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">{farm_name}</h1>
          <span className="text-xl text-gray-800">{fmtNum(total_score)}</span>
          {/* 즐겨찾기 버튼 */}
          {isDonator() && farm_uuid && onBookmarkToggle && (
            <button 
              className={`rounded-full border p-1 transition-colors ${
                isBookmarked 
                  ? 'border-yellow-400 bg-yellow-50' 
                  : 'border-gray-300 hover:border-yellow-400'
              } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
              aria-label={isBookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              onClick={handleBookmarkClick}
              disabled={bookmarkLoading}
            >
              <Star 
                className={`h-4 w-4 ${
                  isBookmarked 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-400 hover:text-yellow-400'
                } ${bookmarkLoading ? 'animate-pulse' : ''}`} 
              />
            </button>
          )}
        </div>
      )}

      {/* 대표 이미지 */}
      {image_url && (
        <div className="rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={image_url}
            alt={`${farm_name} 대표 이미지`}
            width={400}
            height={192}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* 정보 리스트: dt/dd 쌍만 직계 자식 */}
      <dl className="mt-5 grid grid-cols-[60px_1fr] gap-y-4 text-sm">
        {address && (
          <>
            <dt className="text-gray-500">위치</dt>
            <dd className="text-gray-800">{address}</dd>
          </>
        )}
        {name && (
          <>
            <dt className="text-gray-500">목장주</dt>
            <dd className="text-gray-800">{name}</dd>
          </>
        )}
        {farm_phone && (
          <>
            <dt className="text-gray-500">연락처</dt>
            <dd className="text-gray-900 font-semibold">{farm_phone}</dd>
          </>
        )}
        {area !== undefined && (
          <>
            <dt className="text-gray-500">면적</dt>
            <dd className="text-gray-800">{fmtNum(area)}m²</dd>
          </>
        )}
        {horse_count !== undefined && (
          <>
            <dt className="text-gray-500">두수</dt>
            <dd className="text-gray-800">{fmtNum(horse_count)}</dd>
          </>
        )}
      </dl>
    </section>
  );
}
