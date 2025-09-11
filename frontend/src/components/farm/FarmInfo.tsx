// components/farm/FarmInfo.tsx
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
}: Props) {
  const fmtNum = (v?: number | string) =>
    v === undefined || v === null ? "-" : typeof v === "number" ? v.toLocaleString() : v;

  return (
    <section className={`rounded-xl bg-white shadow-sm border p-5 ${className}`}>
      {/* 헤더: 토글 가능 */}
      {showHeader && (
        <div className="mb-4 flex items-baseline gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">{farm_name}</h1>
          <span className="text-xl text-gray-800">{fmtNum(total_score)}</span>
        </div>
      )}

      {/* 대표 이미지 */}
      {image_url && (
        <div className="rounded-lg overflow-hidden bg-gray-100">
          <img
            src={image_url}
            alt={`${farm_name} 대표 이미지`}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* 정보 리스트: dt/dd 쌍만 직계 자식 */}
      <dl className="mt-5 grid grid-cols-[80px_1fr] gap-y-3 text-sm">
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
