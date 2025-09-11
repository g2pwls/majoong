// src/app/api/farms/[farm_uuid]/route.ts
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { farm_uuid: string } }) {
  // 실제 파라미터 대신, 고정된 uuid를 사용
  const farm_uuid = "1111-2222-3333-4444";

  return NextResponse.json({
    id: farm_uuid,
    farm_name: "장수목장",
    total_score: 48.2,
    image_url: "/file.svg",
    name: "조인성",
    address: "부산광역시 강서구 봉림동 234-5",
    farm_phone: "051-867-8954",
    area: 8772.21,
    horse_count: 17,
  });
}
