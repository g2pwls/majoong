// src/app/api/farms/[farm_uuid]/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- 더미 목장 데이터 ----
const FARMS = [
  {
    id: "1111-2222-3333-4444",
    farm_name: "장수목장",
    total_score: 48.2,
    name: "조인성",
    address: "부산광역시 강서구 봉림동 234-5",
    farm_phone: "051-867-8954",
    area: 8772.21,
    horse_count: 17,
    image_url: "/horses/farm1.jpg",
  },
  {
    id: "2222-3333-4444-5555",
    farm_name: "한라목장",
    total_score: 75.3,
    name: "김하늘",
    address: "제주특별자치도 제주시 애월읍 곽지리 77",
    farm_phone: "064-723-9999",
    area: 15200.0,
    horse_count: 34,
    image_url: "/horses/farm2.jpg",
  },
  {
    id: "3333-4444-5555-6666",
    farm_name: "설악목장",
    total_score: 62.1,
    name: "이병헌",
    address: "강원도 속초시 노학동 88-9",
    farm_phone: "033-762-1234",
    area: 9400.5,
    horse_count: 22,
    image_url: "/horses/farm3.jpg",
  },
  {
    id: "4444-5555-6666-7777",
    farm_name: "대청목장",
    total_score: 80.5,
    name: "송혜교",
    address: "충청북도 청주시 흥덕구 운천동 100-2",
    farm_phone: "043-234-5678",
    area: 13450.7,
    horse_count: 41,
    image_url: "/horses/farm4.jpg",
  },
  {
    id: "5555-6666-7777-8888",
    farm_name: "금강목장",
    total_score: 45.9,
    name: "현빈",
    address: "대전광역시 유성구 봉명동 456-12",
    farm_phone: "042-987-6543",
    area: 6233.3,
    horse_count: 15,
    image_url: "/horses/farm5.jpeg",
  },
  {
    id: "6666-7777-8888-9999",
    farm_name: "백두목장",
    total_score: 92.0,
    name: "전지현",
    address: "서울특별시 강남구 삼성동 11-3",
    farm_phone: "02-345-1111",
    area: 20000.0,
    horse_count: 55,
    image_url: "/horses/farm6.jpg",
  },
  {
    id: "7777-8888-9999-0000",
    farm_name: "소백목장",
    total_score: 58.6,
    name: "원빈",
    address: "경상북도 영주시 풍기읍 성내리 17",
    farm_phone: "054-777-2222",
    area: 7450.2,
    horse_count: 19,
    image_url: "/horses/farm7.jpg",
  },
  {
    id: "8888-9999-0000-1111",
    farm_name: "무등목장",
    total_score: 67.4,
    name: "손예진",
    address: "광주광역시 북구 용봉동 300-2",
    farm_phone: "062-345-8888",
    area: 8800.8,
    horse_count: 27,
    image_url: "/horses/farm8.jpg",
  },
  {
    id: "9999-0000-1111-2222",
    farm_name: "태백목장",
    total_score: 73.2,
    name: "강동원",
    address: "강원도 태백시 황지동 90-1",
    farm_phone: "033-555-3333",
    area: 11200.6,
    horse_count: 31,
    image_url: "/horses/farm9.jpg",
  },
  {
    id: "0000-1111-2222-3333",
    farm_name: "청송목장",
    total_score: 40.5,
    name: "김태희",
    address: "경상북도 청송군 진보면 북향리 45",
    farm_phone: "054-222-4444",
    area: 5033.9,
    horse_count: 12,
    image_url: "/horses/farm10.png",
  },
];

// ---- API Handler ----
export async function GET(
  _req: Request,
  { params }: { params: { farm_uuid: string } }
) {
  const { farm_uuid } = params;

  // 🔹 확장: 'all' → 전체 배열, 'demo' → 첫 아이템 반환
  if (farm_uuid === "all") {
    return NextResponse.json(FARMS);
  }
  if (farm_uuid === "demo") {
    return NextResponse.json(FARMS[0]);
  }

  const farm = FARMS.find((f) => f.id === farm_uuid);

  if (!farm) {
    return NextResponse.json(
      { error: `Farm with id ${farm_uuid} not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(farm);
}
