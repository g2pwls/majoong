// src/app/api/farms/[farm_uuid]/route.ts
import { NextResponse } from "next/server";

// 개발/프리뷰에서 캐시/엣지 이슈 방지
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { farm_uuid: string } }) {
  // 현재는 파라미터와 상관없이 고정 uuid로 응답
  const farm_uuid = "1111-2222-3333-4444";

  return NextResponse.json({
    id: farm_uuid,
    farm_name: "장수목장",
    total_score: 48.2,
    name: "조인성",
    address: "부산광역시 강서구 봉림동 234-5",
    farm_phone: "051-867-8954",
    area: 8772.21,
    horse_count: 17,
    image_url: "/horses/farm.png",
  });
}
